import { resolveProjectRoot } from '../filesystem.js';
import { installAgent } from '../installer.js';

export async function run(options, context) {
  const agentId = options._[0];
  if (!agentId) throw new Error('Uso: factory add-agent <factory-id>');
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  await installAgent({ packageRoot: context.packageRoot, projectRoot, agentId });
  context.io.log(`Agente instalado: ${agentId}`);
  return 0;
}
