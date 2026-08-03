import { resolveProjectRoot } from '../filesystem.js';
import { startWorkflow } from '../runtime.js';
import { startFromReversa } from '../integrations/reversa.js';

export async function run(options, context) {
  const idea = options._.join(' ').trim();
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const fromReversa = Boolean(options['from-reversa']);
  const result = fromReversa
    ? await startFromReversa(projectRoot, { workId: options.work, restart: Boolean(options.restart) })
    : await startWorkflow(projectRoot, idea, { workId: options.work, restart: Boolean(options.restart) });
  context.io.log(`Workflow iniciado para ${result.state.project}.`);
  context.io.log(`Entrega ativa: ${result.state.activeWork}`);
  context.io.log(`Próximo agente: ${fromReversa ? 'factory-reversa-curator' : 'factory-discovery'}. Execute factory run.`);
  return 0;
}
