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
  const starts = [];
  if (engineIds.includes('claude-code')) starts.push('/factory-new no Claude Code');
  if (engineIds.includes('codex')) starts.push('factory-new no Codex');
  if (engineIds.includes('pi-agent')) starts.push('/factory-new no Pi Agent');
  context.io.log(`Próximo passo: ${starts.join(' ou ')}.`);
  return 0;
}
