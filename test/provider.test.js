import test from 'node:test';
import assert from 'node:assert/strict';
import { createProvider } from '../lib/providers/index.js';
import { ModelProvider, validateChatRequest } from '../lib/providers/provider.js';
import { OllamaProvider } from '../lib/providers/ollama.js';

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

test('ModelProvider é abstrato e valida mensagens', () => {
  assert.throws(() => new ModelProvider('x'), /abstrato/);
  assert.throws(() => validateChatRequest({ messages: [] }), /ao menos uma/);
  assert.throws(() => validateChatRequest({ messages: [{ role: 'x', content: 'a' }] }), /Mensagem inválida/);
  assert.doesNotThrow(() => validateChatRequest({ messages: [{ role: 'user', content: 'oi' }] }));
});

test('Ollama lista modelos e normaliza /v1', async () => {
  const calls = [];
  const provider = new OllamaProvider({
    baseUrl: 'http://localhost:11434/v1/',
    fetch: async (url, options) => {
      calls.push({ url, options });
      return response({ models: [{ name: 'coder:latest', size: 42 }] });
    },
  });
  assert.equal(provider.baseUrl, 'http://localhost:11434');
  assert.deepEqual(await provider.listModels(), [{ id: 'coder:latest', name: 'coder:latest', size: 42, modifiedAt: undefined, details: {}, capabilities: ['chat'] }]);
  assert.equal(calls[0].url, 'http://localhost:11434/api/tags');
});

test('Ollama executa chat sem streaming e retorna uso', async () => {
  let body;
  const provider = createProvider({ id: 'ollama', model: 'coder' }, {
    fetch: async (_url, options) => {
      body = JSON.parse(options.body);
      return response({ model: 'coder', message: { content: 'feito' }, done: true, prompt_eval_count: 7, eval_count: 3 });
    },
  });
  const result = await provider.chat({ messages: [{ role: 'user', content: 'implemente' }] });
  assert.equal(body.stream, false);
  assert.equal(body.model, 'coder');
  assert.equal(result.content, 'feito');
  assert.deepEqual(result.usage, { input: 7, output: 3 });
});

test('Ollama relata erro HTTP e provider desconhecido', async () => {
  const provider = new OllamaProvider({ fetch: async () => response({ error: 'modelo ausente' }, 404) });
  await assert.rejects(() => provider.listModels(), /HTTP 404: modelo ausente/);
  assert.throws(() => createProvider({ id: 'outro' }), /não suportado/);
});
