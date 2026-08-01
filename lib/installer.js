import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { ENGINES } from './engines.js';
import { buildManifest, saveManifest } from './manifest.js';
import { appendEvent, loadState, saveState } from './state.js';
import { copyNew, exists, listFiles, safePath, writeJson, writeNew } from './filesystem.js';

function relativeUnix(root, path) {
  return relative(root, path).replaceAll('\\', '/');
}

export async function availableAgents(packageRoot) {
  const root = join(packageRoot, 'agents');
  if (!(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory() && entry.name.startsWith('factory-')).map((entry) => entry.name).sort();
}

async function copyAgent(packageRoot, projectRoot, agentId, skillDir, created) {
  const sourceRoot = join(packageRoot, 'agents', agentId);
  if (!(await exists(sourceRoot))) throw new Error(`Agente não encontrado: ${agentId}`);
  for (const source of await listFiles(sourceRoot)) {
    const subpath = relative(sourceRoot, source);
    const destination = safePath(projectRoot, join(skillDir, agentId, subpath));
    if (await copyNew(source, destination)) created.add(relativeUnix(projectRoot, destination));
  }
}

async function copyEngineEntry(packageRoot, projectRoot, engine, created) {
  const source = join(packageRoot, 'templates', 'engines', engine.entryTemplate);
  const destination = safePath(projectRoot, engine.entryFile);
  if (await copyNew(source, destination)) {
    created.add(relativeUnix(projectRoot, destination));
    return 'created';
  }
  return 'preserved';
}

export async function installProject({ packageRoot, projectRoot, version, projectName, engineIds }) {
  if (await loadState(projectRoot)) throw new Error('Factory Agent já está instalado. Use "factory update".');

  const created = new Set();
  const agents = await availableAgents(packageRoot);
  if (agents.length === 0) throw new Error('Nenhuma skill factory-* encontrada no pacote.');

  const templateFiles = ['config.json', 'policies.json'];
  for (const name of templateFiles) {
    const source = join(packageRoot, 'templates', name);
    const destination = safePath(projectRoot, `.factory/${name}`);
    if (await copyNew(source, destination)) created.add(relativeUnix(projectRoot, destination));
  }

  const eventsPath = safePath(projectRoot, '.factory/events.jsonl');
  if (await writeNew(eventsPath, '')) created.add(relativeUnix(projectRoot, eventsPath));

  for (const engineId of engineIds) {
    const engine = ENGINES[engineId];
    for (const skillDir of engine.skillDirs) {
      for (const agentId of agents) await copyAgent(packageRoot, projectRoot, agentId, skillDir, created);
    }
    await copyEngineEntry(packageRoot, projectRoot, engine, created);
  }

  for (const folder of ['_factory_product', '_factory_delivery', '_factory_operations']) {
    await mkdir(safePath(projectRoot, folder), { recursive: true });
  }

  const statePath = safePath(projectRoot, '.factory/state.json');
  const createdPath = safePath(projectRoot, '.factory/created-files.json');
  created.add(relativeUnix(projectRoot, statePath));
  created.add(relativeUnix(projectRoot, createdPath));

  const state = {
    version,
    project: projectName || basename(projectRoot),
    language: 'pt-BR',
    mode: 'guided',
    folders: { product: '_factory_product', delivery: '_factory_delivery', operations: '_factory_operations' },
    engines: engineIds,
    agents,
    createdFiles: [...created].sort(),
    activeWork: null,
  };
  await saveState(projectRoot, state);
  await writeJson(createdPath, state.createdFiles);

  const tracked = state.createdFiles
    .filter((path) => path !== '.factory/events.jsonl')
    .map((path) => safePath(projectRoot, path));
  await saveManifest(projectRoot, await buildManifest(projectRoot, tracked));
  await appendEvent(projectRoot, { event: 'installed', version, engines: engineIds, agents: agents.length });

  return { state, created: state.createdFiles };
}

export async function installAgent({ packageRoot, projectRoot, agentId }) {
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent não está instalado.');
  const available = await availableAgents(packageRoot);
  if (!available.includes(agentId)) throw new Error(`Agente não encontrado: ${agentId}`);

  const created = new Set(state.createdFiles);
  for (const engineId of state.engines) {
    for (const skillDir of ENGINES[engineId].skillDirs) {
      await copyAgent(packageRoot, projectRoot, agentId, skillDir, created);
    }
  }
  state.agents = [...new Set([...state.agents, agentId])].sort();
  state.createdFiles = [...created].sort();
  await saveState(projectRoot, state);
  await writeJson(safePath(projectRoot, '.factory/created-files.json'), state.createdFiles);
  const tracked = state.createdFiles.filter((path) => path !== '.factory/events.jsonl').map((path) => safePath(projectRoot, path));
  await saveManifest(projectRoot, await buildManifest(projectRoot, tracked));
  await appendEvent(projectRoot, { event: 'agent-added', agent: agentId });
  return state;
}

export async function installEngine({ packageRoot, projectRoot, engineId }) {
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent não está instalado.');
  const engine = ENGINES[engineId];
  if (!engine) throw new Error(`Engine não suportada: ${engineId}`);

  const created = new Set(state.createdFiles);
  for (const skillDir of engine.skillDirs) {
    for (const agentId of state.agents) await copyAgent(packageRoot, projectRoot, agentId, skillDir, created);
  }
  await copyEngineEntry(packageRoot, projectRoot, engine, created);
  state.engines = [...new Set([...state.engines, engineId])].sort();
  state.createdFiles = [...created].sort();
  await saveState(projectRoot, state);
  await writeJson(safePath(projectRoot, '.factory/created-files.json'), state.createdFiles);
  const tracked = state.createdFiles.filter((path) => path !== '.factory/events.jsonl').map((path) => safePath(projectRoot, path));
  await saveManifest(projectRoot, await buildManifest(projectRoot, tracked));
  await appendEvent(projectRoot, { event: 'engine-added', engine: engineId });
  return state;
}

export async function sourceForManagedFile(packageRoot, relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  for (const prefix of ['.agents/skills/', '.claude/skills/']) {
    if (!normalized.startsWith(prefix)) continue;
    const remainder = normalized.slice(prefix.length);
    const [agentId, ...parts] = remainder.split('/');
    return join(packageRoot, 'agents', agentId, ...parts);
  }
  if (normalized === 'AGENTS.md' || normalized === 'CLAUDE.md') {
    return join(packageRoot, 'templates', 'engines', normalized);
  }
  return null;
}

export async function overwriteFromSource(source, destination) {
  await mkdir(join(destination, '..'), { recursive: true });
  await copyFile(source, destination);
}
