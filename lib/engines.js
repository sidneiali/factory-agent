import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const ENGINES = Object.freeze({
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    entryFile: 'CLAUDE.md',
    entryTemplate: 'CLAUDE.md',
    skillDirs: ['.agents/skills', '.claude/skills'],
    command: 'claude',
    markers: ['.claude'],
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    entryFile: 'AGENTS.md',
    entryTemplate: 'AGENTS.md',
    skillDirs: ['.agents/skills'],
    command: 'codex',
    markers: ['AGENTS.md'],
  },
});

function commandExists(command) {
  const finder = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(finder, [command], { stdio: 'ignore' }).status === 0;
}

export function detectEngines(projectRoot) {
  return Object.values(ENGINES).map((engine) => ({
    ...engine,
    detected: engine.markers.some((marker) => existsSync(join(projectRoot, marker))) || commandExists(engine.command),
  }));
}

export function parseEngineIds(value, projectRoot) {
  const requested = value
    ? String(value).split(',').map((item) => item.trim()).filter(Boolean)
    : detectEngines(projectRoot).filter((engine) => engine.detected).map((engine) => engine.id);
  const ids = requested.length > 0 ? requested : ['codex'];
  const invalid = ids.filter((id) => !ENGINES[id]);
  if (invalid.length > 0) throw new Error(`Engine(s) não suportada(s): ${invalid.join(', ')}`);
  return [...new Set(ids)];
}
