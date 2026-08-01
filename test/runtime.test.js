import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installProject } from '../lib/installer.js';
import { readJson, writeJson } from '../lib/filesystem.js';
import { loadState } from '../lib/state.js';
import { approveProposal, assertArtifactAllowed, extractEnvelope, rejectProposal, resumeWorkflow, runAgent, startWorkflow } from '../lib/runtime.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'factory-runtime-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await installProject({ packageRoot, projectRoot: root, version: '0.2.0', projectName: 'Runtime', engineIds: ['codex'] });
  const providerPath = join(root, '.factory/providers.json');
  const providers = await readJson(providerPath);
  providers.providers.ollama.model = 'mock-coder';
  await writeJson(providerPath, providers);
  return root;
}

function ollamaEnvelope(envelope) {
  return async () => new Response(JSON.stringify({
    model: 'mock-coder',
    message: { content: JSON.stringify(envelope) },
    done: true,
    prompt_eval_count: 10,
    eval_count: 5,
  }), { status: 200 });
}

test('runtime inicia, propõe, aprova e retoma pelo artefato', async (t) => {
  const root = await fixture(t);
  await startWorkflow(root, 'Uma agenda simples', { workId: '001-agenda' });
  let state = await loadState(root);
  assert.equal(state.runtime.currentAgent, 'factory-discovery');
  assert.equal(state.activeWork, '001-agenda');

  const proposal = await runAgent(root, undefined, { fetch: ollamaEnvelope({
    summary: 'Brief inicial',
    artifacts: [
      { path: '.factory/events.jsonl', content: '{"event":"modelo"}\n' },
      { path: '_factory_product/brief.md', content: '# Brief\n\nAgenda simples.\n' },
    ],
    nextAgent: 'factory-requirements',
  }) });
  assert.equal(proposal.envelope.artifacts[0].path, '_factory_product/brief.md');
  const storedProposal = await readJson(join(root, proposal.proposal));
  assert.deepEqual(storedProposal.ignoredArtifacts, ['.factory/events.jsonl']);
  state = await loadState(root);
  assert.equal(state.runtime.status, 'awaiting-approval');

  await approveProposal(root);
  assert.match(await readFile(join(root, '_factory_product/brief.md'), 'utf8'), /Agenda simples/);
  const resumed = await resumeWorkflow(root);
  assert.equal(resumed.physical.nextAgent, 'factory-requirements');
  assert.equal(resumed.state.runtime.pendingGate, null);
});

test('runtime rejeita proposta sem aplicar artefatos', async (t) => {
  const root = await fixture(t);
  await startWorkflow(root, 'Sistema de estoque');
  await runAgent(root, undefined, { fetch: ollamaEnvelope({
    artifacts: [{ path: '_factory_product/brief.md', content: '# Brief\n' }],
  }) });
  await rejectProposal(root, 'brief incompleto');
  await assert.rejects(() => readFile(join(root, '_factory_product/brief.md'), 'utf8'));
  assert.equal((await loadState(root)).runtime.status, 'ready');
});

test('runtime valida envelope, área do agente e não sobrescreve', async (t) => {
  const root = await fixture(t);
  const state = await loadState(root);
  assert.throws(() => extractEnvelope('texto livre'), /envelope JSON/);
  assert.throws(() => assertArtifactAllowed(state, 'factory-architect', '../fora.md'), /proibido/);
  assert.throws(() => assertArtifactAllowed(state, 'factory-architect', 'src/app.js'), /não pode/);

  await startWorkflow(root, 'Sistema');
  await runAgent(root, undefined, { fetch: ollamaEnvelope({ artifacts: [{ path: '_factory_product/brief.md', content: '# Primeiro\n' }] }) });
  await approveProposal(root);
  const currentState = await loadState(root);
  currentState.runtime.currentAgent = 'factory-discovery';
  currentState.runtime.status = 'ready';
  await import('../lib/state.js').then(({ saveState }) => saveState(root, currentState));
  await assert.rejects(
    () => runAgent(root, 'factory-discovery', { fetch: ollamaEnvelope({ artifacts: [{ path: '_factory_product/brief.md', content: '# Segundo\n' }] }) }),
    /Próximo agente físico/,
  );
});
