import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { exists, safePath } from './filesystem.js';

async function hasMarkdown(directory) {
  if (!(await exists(directory))) return false;
  return (await readdir(directory, { withFileTypes: true })).some((entry) => entry.isFile() && entry.name.endsWith('.md'));
}

function allActionsClosed(content) {
  const boxes = [...content.matchAll(/\[( |x|X)\]/g)].map((match) => match[1].toUpperCase());
  return boxes.length > 0 && boxes.every((value) => value === 'X');
}

async function approved(path) {
  if (!(await exists(path))) return false;
  const content = await readFile(path, 'utf8');
  return /(?:status|resultado)\s*:\s*(?:approved|aprovado)/i.test(content);
}

export async function detectWorkflow(projectRoot, state) {
  const product = safePath(projectRoot, state.folders.product);
  const deliveryRoot = safePath(projectRoot, state.folders.delivery);
  const activeWork = state.activeWork;

  const productStages = [
    ['requirements.md', 'factory-requirements', 'requirements'],
    ['architecture.md', 'factory-architect', 'architecture'],
  ];

  if (!(await exists(join(product, 'brief.md')))) {
    return { stage: 'intake', nextAgent: 'factory-discovery', reason: 'brief.md ainda não existe' };
  }
  for (const [artifact, nextAgent, stage] of productStages) {
    if (!(await exists(join(product, artifact)))) {
      return { stage, nextAgent, reason: `${artifact} ainda não existe` };
    }
  }

  if (!activeWork) {
    return { stage: 'ready-for-work', nextAgent: 'factory-plan', reason: 'produto definido; falta criar ou selecionar uma entrega' };
  }

  const work = safePath(deliveryRoot, activeWork);
  const roadmap = join(work, 'roadmap.md');
  const actions = join(work, 'actions.md');
  if (!(await exists(roadmap)) || !(await exists(actions))) {
    return { stage: 'planning', nextAgent: 'factory-plan', reason: 'roadmap.md ou actions.md ausente na entrega ativa' };
  }

  const actionContent = await readFile(actions, 'utf8');
  if (!allActionsClosed(actionContent)) {
    return { stage: 'implementation', nextAgent: 'factory-developer', reason: 'actions.md possui ações abertas' };
  }
  if (!(await exists(join(work, 'review.md')))) {
    return { stage: 'review', nextAgent: 'factory-reviewer', reason: 'implementação concluída sem review.md' };
  }
  if (!(await exists(join(work, 'qa-report.md')))) {
    return { stage: 'qa', nextAgent: 'factory-qa', reason: 'revisão concluída sem qa-report.md' };
  }
  if (!(await approved(join(work, 'qa-report.md')))) {
    return { stage: 'qa-blocked', nextAgent: 'factory-developer', reason: 'QA ainda não está aprovado' };
  }
  if (!(await approved(join(work, 'acceptance.md')))) {
    return { stage: 'acceptance', nextAgent: 'factory-acceptance', reason: 'aceite ainda não está aprovado' };
  }
  if (!(await exists(join(work, 'documentation.md')))) {
    return { stage: 'documentation', nextAgent: 'factory-documentation', reason: 'documentação da entrega ainda não existe' };
  }
  return { stage: 'done', nextAgent: null, reason: 'entrega concluída e documentada' };
}

export { allActionsClosed, hasMarkdown };
