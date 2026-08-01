import { diagnose } from '../diagnostics.js';
import { resolveProjectRoot } from '../filesystem.js';

export async function run(options, context) {
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const result = await diagnose(projectRoot);
  if (options.json) context.io.log(JSON.stringify(result, null, 2));
  else {
    for (const check of result.checks) {
      const marker = check.level === 'ok' ? 'OK' : check.level === 'warning' ? 'AVISO' : 'ERRO';
      context.io.log(`[${marker}] ${check.name}${check.path ? ` (${check.path})` : ''}: ${check.message}`);
    }
    context.io.log(result.ok ? 'Diagnóstico concluído sem erros.' : 'Diagnóstico encontrou erros.');
  }
  return result.ok ? 0 : 1;
}
