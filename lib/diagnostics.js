import { join } from 'node:path';
import { detectEngines, ENGINES } from './engines.js';
import { exists, safePath } from './filesystem.js';
import { fileStatus, loadManifest } from './manifest.js';
import { loadState, validateState } from './state.js';

export async function diagnose(projectRoot) {
  const checks = [];
  const state = await loadState(projectRoot);
  if (!state) return { ok: false, checks: [{ level: 'error', name: 'state', message: '.factory/state.json ausente' }] };

  const stateErrors = validateState(state);
  checks.push({ level: stateErrors.length ? 'error' : 'ok', name: 'state', message: stateErrors.join('; ') || 'estado válido' });

  const manifest = await loadManifest(projectRoot);
  for (const [path, hash] of Object.entries(manifest.files || {})) {
    const status = await fileStatus(projectRoot, path, hash);
    checks.push({ level: status === 'missing' ? 'error' : status === 'modified' ? 'warning' : 'ok', name: 'managed-file', path, message: status });
  }

  const detected = detectEngines(projectRoot);
  for (const engineId of state.engines) {
    const engine = ENGINES[engineId];
    const installed = engine && await exists(safePath(projectRoot, engine.entryFile));
    const runtimeDetected = detected.find((item) => item.id === engineId)?.detected || false;
    checks.push({ level: installed ? 'ok' : 'warning', name: 'engine', path: engineId, message: installed ? `entrada instalada; runtime ${runtimeDetected ? 'detectado' : 'não detectado'}` : 'arquivo de entrada ausente' });
  }

  for (const folder of Object.values(state.folders || {})) {
    checks.push({ level: await exists(join(projectRoot, folder)) ? 'ok' : 'warning', name: 'folder', path: folder, message: 'pasta de artefatos' });
  }

  return { ok: !checks.some((check) => check.level === 'error'), checks };
}
