import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagnose } from '../lib/diagnostics.js';
import { installAgent, installEngine, installProject } from '../lib/installer.js';
import { loadManifest } from '../lib/manifest.js';
import { loadState } from '../lib/state.js';
import { run as update } from '../lib/commands/update.js';
import { run as uninstall } from '../lib/commands/uninstall.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const silent = { log() {}, error() {} };

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'factory-install-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('install é não destrutivo, íntegro e retomável', async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, 'AGENTS.md'), '# conteúdo do usuário\n', 'utf8');

  const result = await installProject({ packageRoot, projectRoot: root, version: '0.1.0', projectName: 'Teste', engineIds: ['codex'] });
  assert.equal(await readFile(join(root, 'AGENTS.md'), 'utf8'), '# conteúdo do usuário\n');
  assert.equal(result.state.project, 'Teste');
  assert.ok(result.state.agents.includes('factory-qa'));
  assert.equal((await diagnose(root)).ok, true);
  assert.ok(Object.keys((await loadManifest(root)).files).length > 10);
  await assert.rejects(() => installProject({ packageRoot, projectRoot: root, version: '0.1.0', engineIds: ['codex'] }), /já está instalado/);
});

test('add-engine instala espelho e add-agent restaura skill ausente', async (t) => {
  const root = await fixture(t);
  await installProject({ packageRoot, projectRoot: root, version: '0.1.0', projectName: 'Teste', engineIds: ['codex'] });
  await installEngine({ packageRoot, projectRoot: root, engineId: 'claude-code' });
  assert.match(await readFile(join(root, 'CLAUDE.md'), 'utf8'), /Factory Agent/);
  assert.match(await readFile(join(root, '.claude/skills/factory-qa/SKILL.md'), 'utf8'), /name: factory-qa/);

  await rm(join(root, '.agents/skills/factory-qa/SKILL.md'));
  await installAgent({ packageRoot, projectRoot: root, agentId: 'factory-qa' });
  assert.match(await readFile(join(root, '.agents/skills/factory-qa/SKILL.md'), 'utf8'), /name: factory-qa/);
  assert.deepEqual((await loadState(root)).engines, ['claude-code', 'codex']);
});

test('update e uninstall preservam customização local', async (t) => {
  const root = await fixture(t);
  await installProject({ packageRoot, projectRoot: root, version: '0.1.0', projectName: 'Teste', engineIds: ['codex'] });
  const custom = join(root, '.agents/skills/factory-qa/SKILL.md');
  await appendFile(custom, '\ncustom-local\n', 'utf8');

  await update({ root, _: [] }, { cwd: root, packageRoot, io: silent });
  assert.match(await readFile(custom, 'utf8'), /custom-local/);

  await uninstall({ root, _: [] }, { cwd: root, packageRoot, io: silent });
  assert.match(await readFile(custom, 'utf8'), /custom-local/);
  assert.equal(await readFile(join(root, 'AGENTS.md'), 'utf8').then(() => true, () => false), false);
});
