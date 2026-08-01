import { copyFile } from 'node:fs/promises';
import { resolveProjectRoot, copyNew, exists, safePath, writeJson } from '../filesystem.js';
import { fileStatus, hashFile, loadManifest, saveManifest } from '../manifest.js';
import { appendEvent, loadState, saveState } from '../state.js';
import { sourceForManagedFile } from '../installer.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent não está instalado.');
  const manifest = await loadManifest(projectRoot);
  const result = { updated: [], restored: [], preserved: [], migrated: [] };

  for (const [path, expectedHash] of Object.entries(manifest.files || {})) {
    const source = await sourceForManagedFile(context.packageRoot, path);
    if (!source || !(await exists(source))) continue;
    const status = await fileStatus(projectRoot, path, expectedHash);
    if (status === 'modified') {
      result.preserved.push(path);
      continue;
    }
    const destination = safePath(projectRoot, path);
    await copyFile(source, destination);
    manifest.files[path] = await hashFile(destination);
    result[status === 'missing' ? 'restored' : 'updated'].push(path);
  }
  const providersPath = safePath(projectRoot, '.factory/providers.json');
  if (await copyNew(safePath(context.packageRoot, 'templates/providers.json'), providersPath)) {
    state.createdFiles = [...new Set([...state.createdFiles, '.factory/providers.json'])].sort();
    result.migrated.push('.factory/providers.json');
  }
  state.version = context.version || state.version;
  await saveState(projectRoot, state);
  await writeJson(safePath(projectRoot, '.factory/created-files.json'), state.createdFiles);

  manifest.generatedAt = new Date().toISOString();
  await saveManifest(projectRoot, manifest);
  await appendEvent(projectRoot, { event: 'updated', version: state.version, ...Object.fromEntries(Object.entries(result).map(([key, value]) => [key, value.length])) });
  context.io.log(`Atualizados: ${result.updated.length}; restaurados: ${result.restored.length}; migrados: ${result.migrated.length}; customizados preservados: ${result.preserved.length}.`);
  return 0;
}
