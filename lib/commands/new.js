import { resolveProjectRoot } from '../filesystem.js';
import { startWorkflow } from '../runtime.js';

export async function run(options, context) {
  const idea = options._.join(' ').trim();
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const result = await startWorkflow(projectRoot, idea, { workId: options.work, restart: Boolean(options.restart) });
  context.io.log(`Workflow iniciado para ${result.state.project}.`);
  context.io.log(`Entrega ativa: ${result.state.activeWork}`);
  context.io.log('Próximo agente: factory-discovery. Execute factory run.');
  return 0;
}
