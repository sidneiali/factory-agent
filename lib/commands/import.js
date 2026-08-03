import { resolveProjectRoot } from '../filesystem.js';
import { importReversa } from '../integrations/reversa.js';

export async function run(options, context) {
  const adapter = options._[0];
  if (adapter !== 'reversa') throw new Error('Uso: factory import reversa --source=<legado> [--root=<sistema-alvo>]');
  if (!options.source) throw new Error('Informe --source=<caminho do sistema legado>.');
  const projectRoot = resolveProjectRoot(options.root, context.cwd);
  const result = await importReversa({ source: options.source, targetRoot: projectRoot });
  context.io.log(`Reversa importado: ${result.record.id}`);
  context.io.log(`Snapshot: ${result.record.snapshot}`);
  context.io.log(`Arquivos: ${result.manifest.files.length}; specs: ${result.manifest.validation.specs}.`);
  context.io.log('Proximo passo: factory new --from-reversa');
  return 0;
}
