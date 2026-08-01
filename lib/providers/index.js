import { OllamaProvider } from './ollama.js';

export const PROVIDER_IDS = Object.freeze(['ollama']);

export function createProvider(config = {}, dependencies = {}) {
  const id = config.id || config.type || 'ollama';
  if (id === 'ollama') {
    return new OllamaProvider({
      baseUrl: config.baseUrl,
      model: config.model,
      timeoutMs: config.timeoutMs,
      fetch: dependencies.fetch,
    });
  }
  throw new Error(`Provider não suportado: ${id}`);
}
