import { resolveProjectRoot } from '../filesystem.js';
import { installEngine } from '../installer.js';

export async function run(options, context) {
  const engineId = options._[0];
  if (!engineId) throw new Error('Uso: factory add-engine <claude-code|codex|pi-agent>');
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  await installEngine({ packageRoot: context.packageRoot, projectRoot, engineId });
  context.io.log(`Engine instalada: ${engineId}`);
  return 0;
}
