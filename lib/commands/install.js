import { parseEngineIds } from '../engines.js';
import { resolveProjectRoot } from '../filesystem.js';
import { installProject } from '../installer.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const engineIds = parseEngineIds(options.engines, projectRoot);
  const result = await installProject({
    packageRoot: context.packageRoot,
    projectRoot,
    version: context.version,
    projectName: options.project ? String(options.project) : undefined,
    engineIds,
  });
  context.io.log(`Factory Agent instalado em ${projectRoot}`);
  context.io.log(`Engines: ${result.state.engines.join(', ')}`);
  context.io.log(`Agentes: ${result.state.agents.length}`);
  context.io.log('Próximo passo: /factory-new (Claude Code) ou factory-new (Codex).');
  return 0;
}
