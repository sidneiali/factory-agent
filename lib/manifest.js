import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { exists, safePath, readJson, writeJson } from './filesystem.js';

export async function hashFile(path) {
  if (!(await exists(path))) return null;
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

export async function buildManifest(projectRoot, absolutePaths) {
  const files = {};
  for (const path of absolutePaths) {
    const hash = await hashFile(path);
    if (hash) files[relative(projectRoot, path).replaceAll('\\', '/')] = hash;
  }
  return { version: 1, generatedAt: new Date().toISOString(), files };
}

export async function loadManifest(projectRoot) {
  const path = safePath(projectRoot, '.factory/manifest.json');
  return (await exists(path)) ? readJson(path) : { version: 1, files: {} };
}

export async function saveManifest(projectRoot, manifest) {
  await writeJson(safePath(projectRoot, '.factory/manifest.json'), manifest);
}

export async function fileStatus(projectRoot, relativePath, expectedHash) {
  const current = await hashFile(safePath(projectRoot, relativePath));
  if (!current) return 'missing';
  return current === expectedHash ? 'intact' : 'modified';
}
