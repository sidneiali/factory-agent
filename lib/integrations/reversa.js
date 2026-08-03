import { relative, resolve, sep } from 'node:path';
import { atomicWrite, safePath, writeJson } from '../filesystem.js';
import { appendEvent, loadState, saveState } from '../state.js';
import { detectReversa, validateReversa } from './reversa-detection.js';
import { createReversaSnapshot } from './reversa-snapshot.js';

function nested(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..' + sep) && rel !== '..');
}

export async function importReversa({ source, targetRoot }) {
  const projectRoot = resolve(targetRoot);
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent nao esta instalado no sistema-alvo.');
  const detection = await detectReversa(source);
  if (nested(detection.legacyRoot, projectRoot) || nested(projectRoot, detection.legacyRoot)) {
    throw new Error('Origem legada e sistema-alvo devem estar em raizes separadas.');
  }
  const validation = await validateReversa(detection);
  if (!validation.valid) throw new Error(`Extracao Reversa incompleta: ${validation.missing.join(', ')}`);
  const snapshot = await createReversaSnapshot({ projectRoot, state, detection, validation });
  const record = {
    id: snapshot.importId,
    adapter: 'reversa',
    snapshot: snapshot.snapshotRelative,
    source: snapshot.manifest.source,
    importedAt: snapshot.manifest.importedAt,
    active: true,
  };
  state.imports = {
    active: record.id,
    records: [...(state.imports?.records || []).map((item) => ({ ...item, active: false })), record],
  };
  await saveState(projectRoot, state);
  await writeJson(safePath(projectRoot, '.factory/imports.json'), state.imports);
  await appendEvent(projectRoot, { event: 'reversa-imported', importId: record.id, files: snapshot.manifest.files.length });
  return { record, manifest: snapshot.manifest, snapshotRoot: snapshot.snapshotRoot };
}

export async function startFromReversa(projectRoot, options = {}) {
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent nao esta instalado.');
  const active = state.imports?.records?.find((item) => item.id === state.imports.active);
  if (!active) throw new Error('Nenhuma importacao Reversa ativa. Execute factory import reversa.');
  if (state.runtime?.status && state.runtime.status !== 'done' && !options.restart) {
    throw new Error('Ja existe workflow ativo. Use factory resume ou --restart.');
  }
  await atomicWrite(safePath(projectRoot, '.factory/intake.md'), `# Reconstrucao a partir do Reversa\n\nImportacao: ${active.id}\nSnapshot: ${active.snapshot}\nOrigem: ${active.source.legacyRoot}\n`);
  state.activeWork = options.workId || '001-rebuild';
  state.runtime = {
    mode: 'reversa-rebuild',
    status: 'ready',
    currentAgent: 'factory-reversa-curator',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pendingGate: null,
    approvals: [],
  };
  await saveState(projectRoot, state);
  await appendEvent(projectRoot, { event: 'reversa-rebuild-started', importId: active.id, work: state.activeWork });
  return { state, active };
}
