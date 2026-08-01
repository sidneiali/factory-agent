import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
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

test('CLI executa workflow direto com provider Ollama compatível', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'factory-cli-runtime-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url === '/api/tags') {
      response.end(JSON.stringify({ models: [{ name: 'mock-coder' }] }));
      return;
    }
    response.end(JSON.stringify({
      model: 'mock-coder',
      message: { content: JSON.stringify({
        summary: 'brief',
        artifacts: [{ path: '_factory_product/brief.md', content: '# Brief CLI\\n' }],
        nextAgent: 'factory-requirements',
      }) },
      done: true,
    }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const output = capture();

  assert.equal(await runCli(['install', `--root=${root}`, '--engines=pi-agent', '--project=RuntimeCLI'], output.io), 0);
  assert.equal(await runCli(['provider', 'select', 'ollama', `--base-url=${baseUrl}`, '--model=mock-coder', `--root=${root}`], output.io), 0);
  assert.equal(await runCli(['provider', 'test', 'ollama', `--root=${root}`], output.io), 0);
  assert.equal(await runCli(['new', 'Uma', 'agenda', `--root=${root}`], output.io), 0);
  assert.equal(await runCli(['run', `--root=${root}`], output.io), 0);
  assert.equal(await runCli(['approve', `--root=${root}`], output.io), 0);
  assert.match(await readFile(join(root, '_factory_product/brief.md'), 'utf8'), /Brief CLI/);
  assert.equal(await runCli(['resume', `--root=${root}`, '--json'], output.io), 0);
  assert.match(output.lines.join('\n'), /factory-requirements/);
});
