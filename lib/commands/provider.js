import { resolveProjectRoot, readJson, safePath, writeJson } from '../filesystem.js';
import { createProvider, PROVIDER_IDS } from '../providers/index.js';

async function configFor(projectRoot) {
  const path = safePath(projectRoot, '.factory/providers.json');
  return { path, value: await readJson(path) };
}

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const action = options._[0] || 'list';
  const { path, value } = await configFor(projectRoot);

  if (action === 'list') {
    const result = { active: value.active, supported: PROVIDER_IDS, providers: value.providers };
    context.io.log(options.json ? JSON.stringify(result, null, 2) : `Ativo: ${result.active}; suportados: ${result.supported.join(', ')}`);
    return 0;
  }

  const id = options._[1] || value.active;
  if (!PROVIDER_IDS.includes(id)) throw new Error(`Provider não suportado: ${id}`);
  if (action === 'select') {
    value.active = id;
    value.providers[id] = {
      ...value.providers[id],
      enabled: true,
      ...(options['base-url'] ? { baseUrl: String(options['base-url']) } : {}),
      ...(options.model !== undefined ? { model: String(options.model) } : {}),
      ...(options.timeout ? { timeoutMs: Number(options.timeout) } : {}),
    };
    await writeJson(path, value);
    context.io.log(`Provider ativo: ${id}; modelo: ${value.providers[id].model || '(não selecionado)'}`);
    return 0;
  }

  const provider = createProvider({ id, ...value.providers[id] });
  if (action === 'test') {
    const result = await provider.testConnection();
    context.io.log(options.json ? JSON.stringify(result, null, 2) : `${id}: conectado em ${result.baseUrl}; ${result.models} modelo(s)`);
    return 0;
  }
  if (action === 'models') {
    const models = await provider.listModels();
    context.io.log(options.json ? JSON.stringify(models, null, 2) : models.map((model) => model.id).join('\n'));
    return 0;
  }
  throw new Error('Uso: factory provider [list|select|test|models] [ollama]');
}
