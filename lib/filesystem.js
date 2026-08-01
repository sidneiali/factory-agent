import { mkdir, readFile, rename, writeFile, access, copyFile, readdir, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

export function resolveProjectRoot(value, cwd) {
  return resolve(value ? String(value) : cwd);
}

export function safePath(root, relativePath) {
  if (!relativePath || isAbsolute(relativePath)) {
    throw new Error(`Caminho relativo inválido: ${relativePath}`);
  }
  const target = resolve(root, relativePath);
  const rel = relative(root, target);
  if (rel.startsWith('..' + sep) || rel === '..' || isAbsolute(rel)) {
    throw new Error(`Caminho fora da raiz do projeto: ${relativePath}`);
  }
  return target;
}

export async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function atomicWrite(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, path);
}

export async function writeJson(path, value) {
  await atomicWrite(path, JSON.stringify(value, null, 2) + '\n');
}

export async function writeNew(path, content) {
  if (await exists(path)) return false;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, { encoding: 'utf8', flag: 'wx' });
  return true;
}

export async function copyNew(source, destination) {
  if (await exists(destination)) return false;
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  return true;
}

export async function listFiles(root) {
  if (!(await exists(root))) return [];
  const result = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) result.push(path);
    }
  }
  await visit(root);
  return result;
}

export async function removeEmptyParents(path, stopAt) {
  let current = dirname(path);
  const boundary = resolve(stopAt);
  while (current.startsWith(boundary) && current !== boundary) {
    try {
      await rm(current, { recursive: false });
    } catch {
      break;
    }
    current = dirname(current);
  }
}
