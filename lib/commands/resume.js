import { resolveProjectRoot } from '../filesystem.js';
import { resumeWorkflow } from '../runtime.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const { state, physical } = await resumeWorkflow(projectRoot);
  const result = { status: state.runtime?.status, pendingGate: state.runtime?.pendingGate, ...physical };
  if (options.json) context.io.log(JSON.stringify(result, null, 2));
  else {
    context.io.log(`Runtime: ${result.status}`);
    context.io.log(`Estágio físico: ${result.stage}`);
    context.io.log(`Próximo agente: ${result.nextAgent || 'nenhum'}`);
    if (result.pendingGate) context.io.log(`Gate pendente: ${result.pendingGate.proposal}`);
  }
  return 0;
}
