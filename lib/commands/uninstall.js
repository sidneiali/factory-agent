import { rm } from 'node:fs/promises';
import { resolveProjectRoot, exists, removeEmptyParents, safePath } from '../filesystem.js';
import { fileStatus, loadManifest } from '../manifest.js';
import { loadState } from '../state.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent não está instalado.');
  const manifest = await loadManifest(projectRoot);
  const removed = [];
  const preserved = [];

  for (const [path, hash] of Object.entries(manifest.files || {}).sort(([a], [b]) => b.length - a.length)) {
    const status = await fileStatus(projectRoot, path, hash);
    if (status === 'intact') {
      const target = safePath(projectRoot, path);
      await rm(target, { force: true });
      await removeEmptyParents(target, projectRoot);
      removed.push(path);
    } else if (status === 'modified') preserved.push(path);
  }

  for (const admin of ['.factory/events.jsonl', '.factory/manifest.json', '.factory/created-files.json']) {
    const target = safePath(projectRoot, admin);
    if (await exists(target)) await rm(target, { force: true });
  }
  await removeEmptyParents(safePath(projectRoot, '.factory/events.jsonl'), projectRoot);

  context.io.log(`Removidos: ${removed.length}; modificados preservados: ${preserved.length}.`);
  if (preserved.length) context.io.log(`Preservados: ${preserved.join(', ')}`);
  return 0;
}
