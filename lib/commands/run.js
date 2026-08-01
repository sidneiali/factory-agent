import { resolveProjectRoot } from '../filesystem.js';
import { runAgent } from '../runtime.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const result = await runAgent(projectRoot, options._[0]);
  context.io.log(`Proposta criada: ${result.proposal}`);
  context.io.log(`Artefatos propostos: ${result.envelope.artifacts.length}`);
  context.io.log('Revise a proposta e execute factory approve ou factory reject <motivo>.');
  return 0;
}
