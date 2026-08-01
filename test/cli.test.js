import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../lib/cli.js';

function capture() {
  const lines = [];
  return { lines, io: { log: (...args) => lines.push(args.join(' ')), error: (...args) => lines.push(args.join(' ')) } };
}

test('CLI oferece ajuda, versão e erro para comando desconhecido', async () => {
  const output = capture();
  assert.equal(await runCli(['--help'], output.io), 0);
  assert.match(output.lines.join('\n'), /factory install/);
  assert.equal(await runCli(['--version'], output.io), 0);
  assert.equal(await runCli(['inexistente'], output.io), 1);
});

test('CLI instala, reporta status e executa doctor em projeto temporário', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'factory-cli-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const output = capture();

  assert.equal(await runCli(['install', `--root=${root}`, '--engines=codex', '--project=CLI'], output.io), 0);
  assert.equal(await runCli(['status', `--root=${root}`, '--json'], output.io), 0);
  assert.equal(await runCli(['doctor', `--root=${root}`], output.io), 0);
  const content = output.lines.join('\n');
  assert.match(content, /Factory Agent instalado/);
  assert.match(content, /"nextAgent": "factory-discovery"/);
  assert.match(content, /Diagnóstico concluído sem erros/);
});
