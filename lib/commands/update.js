import { copyFile } from 'node:fs/promises';
import { resolveProjectRoot, exists, safePath } from '../filesystem.js';
import { fileStatus, hashFile, loadManifest, saveManifest } from '../manifest.js';
import { appendEvent, loadState } from '../state.js';
import { sourceForManagedFile } from '../installer.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  if (!(await loadState(projectRoot))) throw new Error('Factory Agent não está instalado.');
  const manifest = await loadManifest(projectRoot);
  const result = { updated: [], restored: [], preserved: [] };

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
  manifest.generatedAt = new Date().toISOString();
  await saveManifest(projectRoot, manifest);
  await appendEvent(projectRoot, { event: 'updated', ...Object.fromEntries(Object.entries(result).map(([key, value]) => [key, value.length])) });
  context.io.log(`Atualizados: ${result.updated.length}; restaurados: ${result.restored.length}; customizados preservados: ${result.preserved.length}.`);
  return 0;
}
