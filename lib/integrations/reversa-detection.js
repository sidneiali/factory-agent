import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { exists, readJson } from '../filesystem.js';

export const REQUIRED_REVERSA_FILES = ['inventory.md', 'domain.md', 'architecture.md'];
const ALLOWED_EXTENSIONS = new Set(['.md', '.json', '.yaml', '.yml', '.toml']);

function extension(path) {
  const name = basename(path).toLowerCase();
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index) : '';
}

async function readJsonOptional(path) {
  try {
    return await readJson(path);
  } catch {
    return null;
  }
}

async function resolveOutputFolder(legacyRoot) {
  const state = await readJsonOptional(join(legacyRoot, '.reversa', 'state.json'));
  if (typeof state?.output_folder === 'string' && state.output_folder.trim()) return state.output_folder.trim();
  const configPath = join(legacyRoot, '.reversa', 'config.toml');
  if (await exists(configPath)) {
    const config = await readFile(configPath, 'utf8');
    const section = config.match(/\[output\]([\s\S]*?)(?:\n\[|$)/i)?.[1] || '';
    const folder = section.match(/^\s*folder\s*=\s*["']([^"']+)["']/im)?.[1];
    if (folder) return folder;
  }
  return '_reversa_sdd';
}

export async function listReversaFiles(root) {
  const result = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && ALLOWED_EXTENSIONS.has(extension(path))) result.push(path);
    }
  }
  await visit(root);
  return result.sort();
}

export async function detectReversa(source) {
  if (!source) throw new Error('Informe a origem Reversa.');
  const requested = resolve(String(source));
  if (!(await exists(requested))) throw new Error(`Origem Reversa nao existe: ${requested}`);
  let direct = true;
  for (const name of REQUIRED_REVERSA_FILES) direct = direct && await exists(join(requested, name));
  const legacyRoot = direct ? dirname(requested) : requested;
  const outputFolder = direct ? basename(requested) : await resolveOutputFolder(legacyRoot);
  if (isAbsolute(outputFolder) || outputFolder.includes('..')) throw new Error(`output_folder inseguro: ${outputFolder}`);
  const outputRoot = direct ? requested : resolve(legacyRoot, outputFolder);
  if (!(await exists(outputRoot))) throw new Error(`Saida Reversa nao encontrada: ${outputRoot}`);
  const state = await readJsonOptional(join(legacyRoot, '.reversa', 'state.json'));
  const versionPath = join(legacyRoot, '.reversa', 'version');
  const version = await exists(versionPath) ? (await readFile(versionPath, 'utf8')).trim() : state?.version || null;
  return { requested, legacyRoot, outputRoot, outputFolder, version };
}

export async function validateReversa(detection) {
  const missing = [];
  for (const name of REQUIRED_REVERSA_FILES) if (!(await exists(join(detection.outputRoot, name)))) missing.push(name);
  const sddRoot = join(detection.outputRoot, 'sdd');
  const specs = (await exists(sddRoot)) ? (await listReversaFiles(sddRoot)).filter((path) => path.endsWith('.md')) : [];
  if (specs.length === 0) missing.push('sdd/*.md');
  const warnings = [];
  for (const name of ['confidence-report.md', 'gaps.md']) if (!(await exists(join(detection.outputRoot, name)))) warnings.push(`${name} ausente`);
  return { valid: missing.length === 0, missing, warnings, specs: specs.length };
}

export function relativeReversaPath(root, path) {
  return relative(root, path).split(String.fromCharCode(92)).join('/');
}
