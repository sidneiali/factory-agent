import { resolveProjectRoot } from '../filesystem.js';
import { rejectProposal } from '../runtime.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const gate = await rejectProposal(projectRoot, options._.join(' '));
  context.io.log(`Proposta rejeitada: ${gate.proposal}`);
  return 0;
}
