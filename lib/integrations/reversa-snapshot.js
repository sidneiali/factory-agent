import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { atomicWrite, safePath, writeJson, writeNew } from '../filesystem.js';
import { listReversaFiles, relativeReversaPath } from './reversa-detection.js';

function confidenceCounts(content) {
  const levels = {
    CONFIRMED: /(?:CONFIRMED|🟢)/gi,
    INFERRED: /(?:INFERRED|🟡)/gi,
    GAP: /(?:GAP|🔴)/gi,
  };
  return Object.fromEntries(Object.entries(levels).map(([name, pattern]) => [name, [...content.matchAll(pattern)].length]));
}

function validationReport(detection, validation, count) {
  return `# Validacao da importacao Reversa\n\n**Origem:** ${detection.legacyRoot}\n\n**Saida:** ${detection.outputRoot}\n\n**Versao:** ${detection.version || 'nao informada'}\n\n**Status:** ${validation.valid ? 'valido' : 'invalido'}\n\n**Arquivos:** ${count}\n\n**Specs SDD:** ${validation.specs}\n\n## Ausencias\n\n${validation.missing.length ? validation.missing.map((item) => `- ${item}`).join('\n') : '- Nenhuma'}\n\n## Avisos\n\n${validation.warnings.length ? validation.warnings.map((item) => `- ${item}`).join('\n') : '- Nenhum'}\n`;
}

function curation(items) {
  const rows = items.map((item) => `| ${item.id} | ${item.source}:${item.line} | ${item.confidence} | HUMAN_DECISION | pendente |`).join('\n');
  return `# Curadoria inicial do legado\n\nCada item comeca como \`HUMAN_DECISION\`. O curador deve produzir \`_factory_product/rebuild/curation-decisions.md\` sem alterar este baseline.\n\n| REV-ID | Evidencia | Confianca | Decisao inicial | Justificativa |\n|---|---|---|---|---|\n${rows}\n`;
}

function traceability(items) {
  const rows = items.map((item) => `| ${item.id} | ${item.source}:${item.line} | HUMAN_DECISION | - | - | - | - | - | - |`).join('\n');
  return `# Rastreabilidade Reversa para sistema-alvo\n\n| REV-ID | Origem | Decisao | Requisito | ADR | Acao | Codigo | Teste | Paridade |\n|---|---|---|---|---|---|---|---|---|\n${rows}\n`;
}

export async function createReversaSnapshot({ projectRoot, state, detection, validation }) {
  const importId = `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 17)}-${createHash('sha256').update(detection.outputRoot).digest('hex').slice(0, 8)}`;
  const snapshotRelative = `${state.folders.product}/imports/reversa/${importId}`;
  const snapshotRoot = safePath(projectRoot, snapshotRelative);
  const entries = [];
  for (const sourcePath of await listReversaFiles(detection.outputRoot)) {
    const info = await lstat(sourcePath);
    if (!info.isFile() || info.isSymbolicLink()) continue;
    const relativePath = relativeReversaPath(detection.outputRoot, sourcePath);
    if (!relativePath || relativePath.startsWith('../')) throw new Error(`Caminho invalido: ${sourcePath}`);
    const content = await readFile(sourcePath);
    const sha256 = createHash('sha256').update(content).digest('hex');
    const counts = confidenceCounts(content.toString('utf8'));
    const confidence = counts.GAP ? 'GAP' : counts.INFERRED ? 'INFERRED' : counts.CONFIRMED ? 'CONFIRMED' : 'UNSPECIFIED';
    await writeNew(safePath(snapshotRoot, `source/${relativePath}`), content);
    entries.push({ path: relativePath, bytes: content.length, sha256, confidence, confidenceCounts: counts });
  }
  for (const entry of entries) {
    const current = createHash('sha256').update(await readFile(join(detection.outputRoot, entry.path))).digest('hex');
    if (current !== entry.sha256) throw new Error(`Origem mudou durante a importacao: ${entry.path}`);
  }
  const traceabilityItems = [];
  for (const entry of entries) {
    const lines = (await readFile(join(detection.outputRoot, entry.path), 'utf8')).split(String.fromCharCode(10)).map((line) => line.endsWith(String.fromCharCode(13)) ? line.slice(0, -1) : line);
    const marked = lines.map((text, index) => ({ text: text.trim(), line: index + 1 })).filter((item) => /(?:CONFIRMED|INFERRED|GAP|🟢|🟡|🔴)/i.test(item.text));
    const candidates = marked.length ? marked : [{ text: `Artefato ${entry.path}`, line: 1 }];
    for (const candidate of candidates) {
      const confidence = /(?:GAP|🔴)/i.test(candidate.text) ? 'GAP' : /(?:INFERRED|🟡)/i.test(candidate.text) ? 'INFERRED' : /(?:CONFIRMED|🟢)/i.test(candidate.text) ? 'CONFIRMED' : entry.confidence;
      traceabilityItems.push({ id: `REV-${String(traceabilityItems.length + 1).padStart(4, '0')}`, source: entry.path, line: candidate.line, confidence, excerpt: candidate.text.slice(0, 240) });
    }
  }
  const manifest = {
    schemaVersion: 1,
    importId,
    importedAt: new Date().toISOString(),
    adapter: 'reversa',
    source: { legacyRoot: detection.legacyRoot, outputRoot: detection.outputRoot, outputFolder: detection.outputFolder, version: detection.version },
    validation,
    files: entries,
    traceabilityItems,
  };
  await writeJson(join(snapshotRoot, 'import-manifest.json'), manifest);
  await atomicWrite(join(snapshotRoot, 'validation-report.md'), validationReport(detection, validation, entries.length));
  await atomicWrite(join(snapshotRoot, 'legacy-baseline.md'), `# Baseline legado\n\nImportacao **${importId}** com ${entries.length} arquivos e ${validation.specs} specs. A origem e somente leitura.\n`);
  await atomicWrite(join(snapshotRoot, 'curation.md'), curation(traceabilityItems));
  await atomicWrite(join(snapshotRoot, 'traceability.md'), traceability(traceabilityItems));
  return { importId, snapshotRelative, snapshotRoot, manifest };
}
