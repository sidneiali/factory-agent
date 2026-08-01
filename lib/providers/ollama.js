import { ModelProvider, validateChatRequest } from './provider.js';

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434';
const DEFAULT_TIMEOUT_MS = 120_000;

function cleanBaseUrl(value) {
  const url = new URL(value || DEFAULT_BASE_URL);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('URL do Ollama deve usar http ou https.');
  return url.toString().replace(/\/$/, '').replace(/\/v1$/, '');
}

export class OllamaProvider extends ModelProvider {
  constructor(options = {}) {
    super('ollama');
    this.baseUrl = cleanBaseUrl(options.baseUrl);
    this.model = options.model || '';
    this.timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
    this.fetch = options.fetch || globalThis.fetch;
    if (typeof this.fetch !== 'function') throw new Error('Fetch não está disponível neste runtime.');
  }

  async request(path, options = {}, externalSignal) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error('Timeout do Ollama.')), this.timeoutMs);
    const abort = () => controller.abort(externalSignal.reason);
    if (externalSignal) {
      if (externalSignal.aborted) abort();
      else externalSignal.addEventListener('abort', abort, { once: true });
    }
    try {
      const response = await this.fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal,
      });
      const text = await response.text();
      let payload;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Ollama retornou JSON inválido (HTTP ${response.status}).`);
      }
      if (!response.ok) {
        const detail = payload.error || payload.message || text || response.statusText;
        throw new Error(`Ollama HTTP ${response.status}: ${detail}`);
      }
      return payload;
    } catch (error) {
      if (controller.signal.aborted) throw new Error(`Ollama indisponível: ${controller.signal.reason?.message || 'operação cancelada'}`);
      throw new Error(`Ollama indisponível em ${this.baseUrl}: ${error.message}`);
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener('abort', abort);
    }
  }

  async listModels(signal) {
    const payload = await this.request('/api/tags', { method: 'GET' }, signal);
    return (payload.models || []).map((model) => {
      const details = model.details || {};
      const embeddingOnly = /(?:embed|bert)/i.test(`${model.name || model.model || ''} ${details.family || ''}`);
      return {
        id: model.name || model.model,
        name: model.name || model.model,
        size: model.size,
        modifiedAt: model.modified_at,
        details,
        capabilities: embeddingOnly ? ['embedding'] : ['chat'],
      };
    }).filter((model) => model.id);
  }

  async testConnection(signal) {
    const models = await this.listModels(signal);
    return { ok: true, provider: this.id, baseUrl: this.baseUrl, models: models.length };
  }

  async chat(request, signal) {
    validateChatRequest(request);
    const model = request.model || this.model;
    if (!model) throw new Error('Modelo Ollama não configurado.');
    const payload = await this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: false,
        options: request.options || undefined,
        format: request.format || undefined,
      }),
    }, signal);
    if (typeof payload.message?.content !== 'string') throw new Error('Resposta do Ollama não contém message.content.');
    return {
      provider: this.id,
      model: payload.model || model,
      content: payload.message.content,
      done: payload.done === true,
      usage: {
        input: payload.prompt_eval_count || 0,
        output: payload.eval_count || 0,
      },
      raw: payload,
    };
  }
}

export { DEFAULT_BASE_URL };
