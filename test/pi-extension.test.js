import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installProject } from '../lib/installer.js';
import { loadState } from '../lib/state.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function runPi(args, options = {}) {
  if (process.platform !== 'win32') return spawnSync('pi', args, { encoding: 'utf8', ...options });
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const command = `pi ${args.map((value) => String(value).startsWith('-') ? value : quote(value)).join(' ')}`;
  return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command], { encoding: 'utf8', ...options });
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'factory-pi-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await installProject({ packageRoot, projectRoot: root, version: '0.2.0', projectName: 'Pi', engineIds: ['pi-agent'] });
  return root;
}

test('instala extensão e skills locais do Pi Agent', async (t) => {
  const root = await fixture(t);
  const index = await readFile(join(root, '.pi/extensions/factory-agent/index.ts'), 'utf8');
  const policy = await readFile(join(root, '.pi/extensions/factory-agent/policy.ts'), 'utf8');
  assert.match(index, /registerCommand\("factory-new"/);
  assert.match(index, /registerTool\(/);
  assert.match(index, /pi\.on\("tool_call"/);
  assert.match(index, /Factory Decision Gate/);
  assert.match(policy, /Factory Policy Gate|evaluateToolCall/);
  assert.match(await readFile(join(root, '.pi/skills/factory-new/SKILL.md'), 'utf8'), /name: factory-new/);
  assert.deepEqual((await loadState(root)).engines, ['pi-agent']);
});

test('Pi Agent carrega a extensão TypeScript instalada', async (t) => {
  const probe = runPi(['--version']);
  if (probe.status !== 0) return t.skip('Pi Agent não está disponível.');
  const root = await fixture(t);
  const extension = join(root, '.pi/extensions/factory-agent/index.ts');
  const result = runPi([
    '-e', extension,
    '--no-extensions',
    '--no-skills',
    '--approve',
    '--offline',
    '--list-models',
  ], { cwd: root, timeout: 30_000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('policy guard do Pi bloqueia, confirma e permite conforme o risco', async (t) => {
  const probe = runPi(['--version']);
  if (probe.status !== 0) return t.skip('Pi Agent não está disponível.');
  const root = await fixture(t);
  const validator = join(root, 'validate-policy.ts');
  await writeFile(validator, `
import { evaluateToolCall } from "./.pi/extensions/factory-agent/policy.ts";
export default function () {
  const cases = [
    [evaluateToolCall(process.cwd(), "write", { path: ".env" }).kind, "block"],
    [evaluateToolCall(process.cwd(), "bash", { command: "git push --force" }).kind, "block"],
    [evaluateToolCall(process.cwd(), "bash", { command: "npm install pacote" }).kind, "confirm"],
    [evaluateToolCall(process.cwd(), "read", { path: "README.md" }).kind, "allow"],
    [evaluateToolCall(process.cwd(), "write", { path: "src/app.js" }).kind, "block"],
  ];
  for (const [actual, expected] of cases) if (actual !== expected) throw new Error(\`policy: \${actual} != \${expected}\`);
}
`, 'utf8');
  const result = runPi([
    '-e', validator,
    '--no-extensions',
    '--no-skills',
    '--approve',
    '--offline',
    '--list-models',
  ], { cwd: root, timeout: 30_000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
