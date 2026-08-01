import { resolveProjectRoot } from '../filesystem.js';
import { loadState } from '../state.js';
import { detectWorkflow } from '../workflow.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const state = await loadState(projectRoot);
  if (!state) {
    context.io.error('Factory Agent não está instalado neste projeto.');
    return 1;
  }
  const workflow = await detectWorkflow(projectRoot, state);
  const result = { project: state.project, version: state.version, activeWork: state.activeWork, ...workflow };
  if (options.json) context.io.log(JSON.stringify(result, null, 2));
  else {
    context.io.log(`Projeto: ${result.project}`);
    context.io.log(`Estágio: ${result.stage}`);
    context.io.log(`Motivo: ${result.reason}`);
    context.io.log(`Próximo agente: ${result.nextAgent || 'nenhum — fluxo concluído'}`);
  }
  return 0;
}
