import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseEngineIds } from '../lib/engines.js';
import { safePath } from '../lib/filesystem.js';
import { validateState } from '../lib/state.js';
import { allActionsClosed } from '../lib/workflow.js';

async function temporary(t) {
  const root = await mkdtemp(join(tmpdir(), 'factory-core-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('parseEngineIds aceita engines suportadas e remove duplicatas', async (t) => {
  const root = await temporary(t);
  assert.deepEqual(parseEngineIds('claude-code,codex,codex', root), ['claude-code', 'codex']);
  assert.throws(() => parseEngineIds('desconhecida', root), /não suportada/);
});

test('safePath impede saída da raiz', async (t) => {
  const root = await temporary(t);
  assert.equal(safePath(root, 'a/b.txt'), join(root, 'a/b.txt'));
  assert.throws(() => safePath(root, '../segredo.txt'), /fora da raiz/);
  assert.throws(() => safePath(root, root), /relativo inválido/);
});

test('validateState detecta contrato inválido', () => {
  assert.deepEqual(validateState({}), [
    'version ausente',
    'project inválido',
    'folders ausente',
    'engines deve ser array',
    'agents deve ser array',
    'createdFiles deve ser array',
  ]);
  assert.deepEqual(validateState({ version: '1', project: 'x', folders: {}, engines: [], agents: [], createdFiles: [] }), []);
});

test('allActionsClosed exige pelo menos uma ação e nenhuma aberta', () => {
  assert.equal(allActionsClosed('sem ações'), false);
  assert.equal(allActionsClosed('- [X] A\n- [x] B'), true);
  assert.equal(allActionsClosed('- [X] A\n- [ ] B'), false);
});
