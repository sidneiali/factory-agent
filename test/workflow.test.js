import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectWorkflow } from '../lib/workflow.js';

const state = {
  folders: { product: '_factory_product', delivery: '_factory_delivery', operations: '_factory_operations' },
  activeWork: null,
};

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'factory-flow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, '_factory_product'), { recursive: true });
  await mkdir(join(root, '_factory_delivery'), { recursive: true });
  return root;
}

async function touch(path, content = '# artefato\n') {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, content, 'utf8');
}

test('workflow percorre produto e entrega por evidência física', async (t) => {
  const root = await fixture(t);
  assert.equal((await detectWorkflow(root, state)).nextAgent, 'factory-discovery');

  await touch(join(root, '_factory_product/brief.md'));
  assert.equal((await detectWorkflow(root, state)).nextAgent, 'factory-requirements');

  await touch(join(root, '_factory_product/requirements.md'));
  assert.equal((await detectWorkflow(root, state)).nextAgent, 'factory-architect');

  await touch(join(root, '_factory_product/architecture.md'));
  assert.equal((await detectWorkflow(root, state)).nextAgent, 'factory-plan');

  const active = { ...state, activeWork: '001-mvp' };
  const work = join(root, '_factory_delivery/001-mvp');
  await touch(join(work, 'roadmap.md'));
  await touch(join(work, 'actions.md'), '- [ ] T001\n');
  assert.equal((await detectWorkflow(root, active)).nextAgent, 'factory-developer');

  await touch(join(work, 'actions.md'), '- [X] T001\n');
  assert.equal((await detectWorkflow(root, active)).nextAgent, 'factory-reviewer');
  await touch(join(work, 'review.md'));
  assert.equal((await detectWorkflow(root, active)).nextAgent, 'factory-qa');
  await touch(join(work, 'qa-report.md'), 'Status: reprovado\n');
  assert.equal((await detectWorkflow(root, active)).stage, 'qa-blocked');
  await touch(join(work, 'qa-report.md'), 'Status: aprovado\n');
  assert.equal((await detectWorkflow(root, active)).nextAgent, 'factory-acceptance');
  await touch(join(work, 'acceptance.md'), 'Status: aprovado\n');
  assert.equal((await detectWorkflow(root, active)).nextAgent, 'factory-documentation');
  await touch(join(work, 'documentation.md'));
  assert.equal((await detectWorkflow(root, active)).stage, 'done');
});
