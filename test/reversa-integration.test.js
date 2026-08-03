import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCli } from '../lib/cli.js';
import { readJson, writeJson } from '../lib/filesystem.js';
import { installProject } from '../lib/installer.js';
import { detectReversa, validateReversa } from '../lib/integrations/reversa-detection.js';
import { importReversa, startFromReversa } from '../lib/integrations/reversa.js';
import { loadState } from '../lib/state.js';
import { detectWorkflow } from '../lib/workflow.js';
import { runAgent } from '../lib/runtime.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

async function fixture(t) {
  const base = await mkdtemp(join(tmpdir(), 'factory-reversa-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const legacy = join(base, 'legacy');
  const target = join(base, 'target');
  const output = join(legacy, 'specs-out');
  await mkdir(join(legacy, '.reversa'), { recursive: true });
  await mkdir(join(output, 'sdd'), { recursive: true });
  await writeFile(join(legacy, '.reversa/state.json'), JSON.stringify({ version: '1.2.57', output_folder: 'specs-out' }), 'utf8');
  await writeFile(join(legacy, '.reversa/version'), '1.2.57\n', 'utf8');
  await writeFile(join(output, 'inventory.md'), '# Inventory\n\n🟢 API legacy\n', 'utf8');
  await writeFile(join(output, 'domain.md'), '# Domain\n\n🟢 Regra A\n🟡 Regra B\n', 'utf8');
  await writeFile(join(output, 'architecture.md'), '# Architecture\n\nComponente API\n', 'utf8');
  await writeFile(join(output, 'confidence-report.md'), '# Confidence\n', 'utf8');
  await writeFile(join(output, 'gaps.md'), '# Gaps\n\n🔴 Integracao desconhecida\n', 'utf8');
  await writeFile(join(output, 'sdd/api.md'), '# API Spec\n\nRF-1\n', 'utf8');
  await installProject({ packageRoot, projectRoot: target, version: '0.3.0', projectName: 'Target', engineIds: ['pi-agent'] });
  const providers = await readJson(join(target, '.factory/providers.json'));
  providers.providers.ollama.model = 'mock';
  await writeJson(join(target, '.factory/providers.json'), providers);
  return { base, legacy, target, output };
}

function capture() {
  const lines = [];
  return { lines, io: { log: (...args) => lines.push(args.join(' ')), error: (...args) => lines.push(args.join(' ')) } };
}

test('detecta e valida saida Reversa configuravel', async (t) => {
  const { legacy, output } = await fixture(t);
  const detection = await detectReversa(legacy);
  assert.equal(detection.outputRoot, output);
  assert.equal(detection.version, '1.2.57');
  assert.deepEqual(await validateReversa(detection), { valid: true, missing: [], warnings: [], specs: 1 });
  assert.equal((await detectReversa(output)).outputRoot, output);
});

test('importa snapshot com hashes sem modificar a origem', async (t) => {
  const { legacy, target, output } = await fixture(t);
  const before = await readFile(join(output, 'domain.md'), 'utf8');
  const result = await importReversa({ source: legacy, targetRoot: target });
  assert.equal(await readFile(join(output, 'domain.md'), 'utf8'), before);
  assert.equal(result.manifest.files.length, 6);
  assert.ok(result.manifest.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.ok(result.manifest.traceabilityItems.length > result.manifest.files.length);
  assert.equal(result.manifest.files.find((file) => file.path === 'architecture.md').confidence, 'UNSPECIFIED');
  assert.match(await readFile(join(result.snapshotRoot, 'curation.md'), 'utf8'), /HUMAN_DECISION/);
  assert.match(await readFile(join(result.snapshotRoot, 'traceability.md'), 'utf8'), /REV-0001/);
  assert.match(await readFile(join(result.snapshotRoot, 'source/domain.md'), 'utf8'), /Regra A/);
  const state = await loadState(target);
  assert.equal(state.imports.active, result.record.id);
  assert.equal(state.imports.records.length, 1);
});

test('recusa extracao incompleta e raiz alvo dentro do legado', async (t) => {
  const { legacy, target, output } = await fixture(t);
  await rm(join(output, 'architecture.md'));
  await assert.rejects(() => importReversa({ source: legacy, targetRoot: target }), /incompleta.*architecture.md/);
  await writeFile(join(output, 'architecture.md'), '# Architecture\n', 'utf8');
  const nestedTarget = join(legacy, 'novo');
  await installProject({ packageRoot, projectRoot: nestedTarget, version: '0.3.0', projectName: 'Nested', engineIds: ['codex'] });
  await assert.rejects(() => importReversa({ source: legacy, targetRoot: nestedTarget }), /raizes separadas/);
});

test('CLI importa e inicia workflow from-reversa', async (t) => {
  const { legacy, target } = await fixture(t);
  const output = capture();
  assert.equal(await runCli(['import', 'reversa', `--source=${legacy}`, `--root=${target}`], output.io), 0);
  assert.equal(await runCli(['new', '--from-reversa', `--root=${target}`], output.io), 0);
  const state = await loadState(target);
  assert.equal(state.runtime.mode, 'reversa-rebuild');
  assert.equal(state.runtime.currentAgent, 'factory-reversa-curator');
  assert.equal((await detectWorkflow(target, state)).nextAgent, 'factory-reversa-curator');
  assert.match(output.lines.join('\n'), /factory new --from-reversa/);
});

test('runtime Ollama recebe o snapshot ativo no contexto', async (t) => {
  const { legacy, target } = await fixture(t);
  await importReversa({ source: legacy, targetRoot: target });
  await startFromReversa(target);
  let contextSeen = false;
  const fetch = async (_url, init) => {
    const request = JSON.parse(init.body);
    contextSeen = request.messages.some((message) => message.content.includes('Regra A') && message.content.includes('REV-0001'));
    return new Response(JSON.stringify({
      model: 'mock',
      message: { content: JSON.stringify({ artifacts: [{ path: '_factory_product/rebuild/curation-decisions.md', content: '# Decisions\n\nREV-0001 PRESERVE\n' }], nextAgent: 'factory-reversa-target-requirements' }) },
      done: true,
    }), { status: 200 });
  };
  const proposal = await runAgent(target, 'factory-reversa-curator', { fetch });
  assert.equal(contextSeen, true);
  assert.equal(proposal.envelope.artifacts[0].path, '_factory_product/rebuild/curation-decisions.md');
});
