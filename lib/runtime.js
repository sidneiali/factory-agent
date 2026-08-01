import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createProvider } from './providers/index.js';
import { appendEvent, loadState, saveState } from './state.js';
import { atomicWrite, exists, listFiles, readJson, safePath, writeJson, writeNew } from './filesystem.js';
import { detectWorkflow } from './workflow.js';

const MAX_CONTEXT_BYTES = 200_000;
const FORBIDDEN_PATHS = /(^|\/)(\.git|\.env(?:\.|$)|node_modules|\.factory)(\/|$)/i;
const RUNTIME_MANAGED_ARTIFACTS = new Set(['.factory/events.jsonl', '.factory/state.json']);

function nowId() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 17);
}

function normalizeRelative(path) {
  return String(path || '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function assertArtifactAllowed(state, agent, path) {
  const normalized = normalizeRelative(path);
  if (!normalized || normalized.startsWith('/') || normalized.includes('../') || FORBIDDEN_PATHS.test(normalized)) {
    throw new Error(`Artefato proibido na proposta: ${path}`);
  }
  const product = `${state.folders.product}/`;
  const delivery = `${state.folders.delivery}/`;
  const operations = `${state.folders.operations}/`;
  const areas = agent === 'factory-support' || agent.startsWith('factory-bug')
    ? [operations]
    : agent === 'factory-developer'
      ? [product, delivery, operations, 'src/', 'app/', 'test/', 'tests/']
      : [product, delivery, operations];
  if (!areas.some((prefix) => normalized.startsWith(prefix))) {
    throw new Error(`Agente ${agent} não pode propor escrita em ${path}.`);
  }
  return normalized;
}

function extractEnvelope(content) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1] || trimmed;
  let envelope;
  try {
    envelope = JSON.parse(fenced);
  } catch {
    throw new Error('O modelo não retornou o envelope JSON obrigatório.');
  }
  if (!envelope || typeof envelope !== 'object' || !Array.isArray(envelope.artifacts)) {
    throw new Error('Envelope inválido: artifacts deve ser array.');
  }
  for (const artifact of envelope.artifacts) {
    if (typeof artifact?.path !== 'string' || typeof artifact.content !== 'string') {
      throw new Error('Envelope inválido: cada artefato exige path e content.');
    }
  }
  return envelope;
}

async function loadProviders(projectRoot) {
  const path = safePath(projectRoot, '.factory/providers.json');
  if (!(await exists(path))) throw new Error('.factory/providers.json ausente. Execute factory update ou reinstale.');
  return readJson(path);
}

async function collectContext(projectRoot, state) {
  const roots = [safePath(projectRoot, state.folders.product)];
  if (state.activeWork) roots.push(safePath(projectRoot, `${state.folders.delivery}/${state.activeWork}`));
  const chunks = [];
  let total = 0;
  for (const root of roots) {
    for (const path of await listFiles(root)) {
      if (!/\.(md|json)$/i.test(path)) continue;
      const content = await readFile(path, 'utf8');
      const bytes = Buffer.byteLength(content);
      if (total + bytes > MAX_CONTEXT_BYTES) continue;
      total += bytes;
      chunks.push(`--- ${relative(projectRoot, path).replaceAll('\\', '/')}\n${content}`);
    }
  }
  return chunks.join('\n\n');
}

export async function startWorkflow(projectRoot, idea, options = {}) {
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent não está instalado.');
  if (!idea?.trim()) throw new Error('Descreva a ideia do projeto.');
  if (state.runtime?.status && state.runtime.status !== 'done' && !options.restart) {
    throw new Error('Já existe workflow ativo. Use factory resume ou --restart.');
  }
  const intakePath = safePath(projectRoot, '.factory/intake.md');
  await atomicWrite(intakePath, `# Ideia inicial\n\n${idea.trim()}\n`);
  state.activeWork = options.workId || state.activeWork || '001-mvp';
  state.runtime = {
    status: 'ready',
    currentAgent: 'factory-discovery',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pendingGate: null,
    approvals: [],
  };
  await saveState(projectRoot, state);
  await appendEvent(projectRoot, { event: 'workflow-started', agent: state.runtime.currentAgent, work: state.activeWork });
  return { state, intakePath };
}

export async function resumeWorkflow(projectRoot) {
  const state = await loadState(projectRoot);
  if (!state) throw new Error('Factory Agent não está instalado.');
  const physical = await detectWorkflow(projectRoot, state);
  if (!state.runtime) state.runtime = { status: 'ready', currentAgent: physical.nextAgent, pendingGate: null, approvals: [] };
  if (!state.runtime.pendingGate) state.runtime.currentAgent = physical.nextAgent;
  if (physical.stage === 'done') state.runtime.status = 'done';
  state.runtime.updatedAt = new Date().toISOString();
  await saveState(projectRoot, state);
  return { state, physical };
}

export async function runAgent(projectRoot, requestedAgent, dependencies = {}) {
  const { state, physical } = await resumeWorkflow(projectRoot);
  if (state.runtime.pendingGate) throw new Error('Existe proposta aguardando approve ou reject.');
  const agent = requestedAgent || physical.nextAgent || state.runtime.currentAgent;
  if (!agent) throw new Error('Workflow já concluído.');
  if (requestedAgent && physical.nextAgent && requestedAgent !== physical.nextAgent) {
    throw new Error(`Próximo agente físico é ${physical.nextAgent}, não ${requestedAgent}.`);
  }
  const skillPath = safePath(projectRoot, `.agents/skills/${agent}/SKILL.md`);
  if (!(await exists(skillPath))) throw new Error(`Skill não instalada: ${agent}`);
  const [skill, providers, context, intake] = await Promise.all([
    readFile(skillPath, 'utf8'),
    loadProviders(projectRoot),
    collectContext(projectRoot, state),
    exists(safePath(projectRoot, '.factory/intake.md')).then((available) => available ? readFile(safePath(projectRoot, '.factory/intake.md'), 'utf8') : ''),
  ]);
  const providerId = providers.active;
  const config = { id: providerId, ...(providers.providers?.[providerId] || {}) };
  if (!config.enabled) throw new Error(`Provider desativado: ${providerId}`);
  const provider = createProvider(config, dependencies);
  const response = await provider.chat({
    model: config.model,
    messages: [
      { role: 'system', content: `${skill}\n\nVocê está no runtime direto. Retorne SOMENTE JSON válido no formato {"summary":"...","artifacts":[{"path":"caminho relativo","content":"conteúdo completo"}],"nextAgent":"factory-..."}. Não use cercas Markdown. Não inclua .factory/state.json nem .factory/events.jsonl; o runtime gerencia esses arquivos. Não solicite ferramentas nem altere arquivos.` },
      { role: 'user', content: `IDEIA:\n${intake}\n\nESTADO FÍSICO: ${JSON.stringify(physical)}\n\nCONTEXTO VERIFICADO:\n${context || '(sem artefatos)'}` },
    ],
  }, dependencies.signal);
  const envelope = extractEnvelope(response.content);
  const ignoredArtifacts = envelope.artifacts.filter((artifact) => RUNTIME_MANAGED_ARTIFACTS.has(normalizeRelative(artifact.path))).map((artifact) => artifact.path);
  envelope.artifacts = envelope.artifacts
    .filter((artifact) => !RUNTIME_MANAGED_ARTIFACTS.has(normalizeRelative(artifact.path)))
    .map((artifact) => ({ ...artifact, path: assertArtifactAllowed(state, agent, artifact.path) }));
  if (envelope.artifacts.length === 0) throw new Error('O modelo não propôs nenhum artefato aplicável.');
  const id = `${nowId()}-${agent}`;
  const proposalRelative = `.factory/proposals/${id}.json`;
  await writeJson(safePath(projectRoot, proposalRelative), {
    id,
    agent,
    provider: response.provider,
    model: response.model,
    createdAt: new Date().toISOString(),
    summary: envelope.summary || '',
    nextAgent: envelope.nextAgent || null,
    artifacts: envelope.artifacts,
    usage: response.usage,
    ignoredArtifacts,
  });
  state.runtime.status = 'awaiting-approval';
  state.runtime.currentAgent = agent;
  state.runtime.pendingGate = { type: 'proposal', proposal: proposalRelative, agent, createdAt: new Date().toISOString() };
  state.runtime.updatedAt = new Date().toISOString();
  await saveState(projectRoot, state);
  await appendEvent(projectRoot, { event: 'proposal-created', agent, proposal: proposalRelative });
  return { proposal: proposalRelative, envelope, response };
}

export async function approveProposal(projectRoot) {
  const state = await loadState(projectRoot);
  const gate = state?.runtime?.pendingGate;
  if (!gate) throw new Error('Não há proposta aguardando aprovação.');
  const proposal = await readJson(safePath(projectRoot, gate.proposal));
  const targets = proposal.artifacts.map((artifact) => safePath(projectRoot, assertArtifactAllowed(state, proposal.agent, artifact.path)));
  const existing = [];
  for (let index = 0; index < targets.length; index += 1) {
    if (await exists(targets[index])) existing.push(proposal.artifacts[index].path);
  }
  if (existing.length) throw new Error(`Aprovação não sobrescreve arquivos existentes: ${existing.join(', ')}.`);
  for (let index = 0; index < targets.length; index += 1) {
    await writeNew(targets[index], proposal.artifacts[index].content);
  }
  state.runtime.approvals = [...(state.runtime.approvals || []), { proposal: gate.proposal, agent: proposal.agent, approvedAt: new Date().toISOString() }];
  state.runtime.pendingGate = null;
  state.runtime.status = 'ready';
  state.runtime.currentAgent = proposal.nextAgent || null;
  state.runtime.updatedAt = new Date().toISOString();
  await saveState(projectRoot, state);
  await appendEvent(projectRoot, { event: 'proposal-approved', agent: proposal.agent, artifacts: proposal.artifacts.map((item) => item.path) });
  return proposal;
}

export async function rejectProposal(projectRoot, reason = '') {
  const state = await loadState(projectRoot);
  const gate = state?.runtime?.pendingGate;
  if (!gate) throw new Error('Não há proposta aguardando rejeição.');
  state.runtime.pendingGate = null;
  state.runtime.status = 'ready';
  state.runtime.updatedAt = new Date().toISOString();
  await saveState(projectRoot, state);
  await appendEvent(projectRoot, { event: 'proposal-rejected', agent: gate.agent, proposal: gate.proposal, reason });
  return gate;
}

export { assertArtifactAllowed, extractEnvelope };
