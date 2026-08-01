import { resolveProjectRoot } from '../filesystem.js';
import { approveProposal } from '../runtime.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const proposal = await approveProposal(projectRoot);
  context.io.log(`Proposta aprovada: ${proposal.id}`);
  context.io.log(`Artefatos criados: ${proposal.artifacts.map((item) => item.path).join(', ') || 'nenhum'}`);
  return 0;
}
