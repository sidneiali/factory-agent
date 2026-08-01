import { exists, readJson, safePath, writeJson } from './filesystem.js';

const REQUIRED_ARRAYS = ['engines', 'agents', 'createdFiles'];

export function validateState(state) {
  const errors = [];
  if (!state || typeof state !== 'object' || Array.isArray(state)) return ['estado deve ser um objeto'];
  if (typeof state.version !== 'string' || !state.version) errors.push('version ausente');
  if (typeof state.project !== 'string') errors.push('project inválido');
  if (!state.folders || typeof state.folders !== 'object') errors.push('folders ausente');
  for (const key of REQUIRED_ARRAYS) {
    if (!Array.isArray(state[key])) errors.push(`${key} deve ser array`);
  }
  return errors;
}

export async function loadState(projectRoot) {
  const path = safePath(projectRoot, '.factory/state.json');
  if (!(await exists(path))) return null;
  return readJson(path);
}

export async function saveState(projectRoot, state) {
  const errors = validateState(state);
  if (errors.length > 0) throw new Error(`Estado inválido: ${errors.join('; ')}`);
  await writeJson(safePath(projectRoot, '.factory/state.json'), state);
}

export async function appendEvent(projectRoot, event) {
  const { mkdir, appendFile } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  const path = safePath(projectRoot, '.factory/events.jsonl');
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n', 'utf8');
}
