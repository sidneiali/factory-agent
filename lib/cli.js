import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const commandLoaders = {
  install: () => import('./commands/install.js'),
  status: () => import('./commands/status.js'),
  doctor: () => import('./commands/doctor.js'),
  update: () => import('./commands/update.js'),
  uninstall: () => import('./commands/uninstall.js'),
  'add-agent': () => import('./commands/add-agent.js'),
  'add-engine': () => import('./commands/add-engine.js'),
  provider: () => import('./commands/provider.js'),
  new: () => import('./commands/new.js'),
  run: () => import('./commands/run.js'),
  resume: () => import('./commands/resume.js'),
  approve: () => import('./commands/approve.js'),
  reject: () => import('./commands/reject.js'),
  import: () => import('./commands/import.js'),
};

function parseOptions(args) {
  const options = { _: [] };
  for (const arg of args) {
    if (!arg.startsWith('--')) {
      options._.push(arg);
      continue;
    }
    const [key, ...valueParts] = arg.slice(2).split('=');
    options[key] = valueParts.length > 0 ? valueParts.join('=') : true;
  }
  return options;
}

async function version() {
  const content = await readFile(join(packageRoot, 'package.json'), 'utf8');
  return JSON.parse(content).version;
}

function help(currentVersion) {
  return `Factory Agent v${currentVersion}

Uso: factory <comando> [opções]

Comandos:
  factory install       Instala estado, políticas e agentes no projeto
  factory status        Mostra o estágio físico e o próximo agente
  factory doctor        Verifica integridade da instalação
  factory update        Atualiza somente arquivos não customizados
  factory add-agent     Adiciona uma skill: factory add-agent <id>
  factory add-engine    Adiciona uma engine: factory add-engine <id>
  factory provider      Lista, seleciona e testa providers de modelo
  factory new           Inicia workflow: factory new "ideia"
  factory run           Executa o próximo agente com o provider ativo
  factory resume        Retoma o estado físico do workflow
  factory approve       Aprova e aplica uma proposta nova
  factory reject        Rejeita a proposta pendente
  factory import        Importa artefatos externos: factory import reversa
  factory uninstall     Remove somente arquivos intactos criados pela ferramenta

Opções comuns:
  --root=<path>                 Raiz do projeto alvo
  --engines=claude-code,codex,pi-agent   Engines da instalação
  --project=<nome>              Nome do projeto
  --json                        Saída estruturada quando disponível

Fluxo inicial após instalar: /factory-new (ou factory-new no Codex)`;
}

export async function runCli(args, io = console) {
  const [command, ...rest] = args;
  const currentVersion = await version();

  if (!command || command === '--help' || command === '-h') {
    io.log(help(currentVersion));
    return 0;
  }
  if (command === '--version' || command === '-v') {
    io.log(currentVersion);
    return 0;
  }

  const loader = commandLoaders[command];
  if (!loader) {
    io.error(`Comando desconhecido: ${command}`);
    io.error('Execute "factory --help" para ver os comandos.');
    return 1;
  }

  const module = await loader();
  return module.run(parseOptions(rest), {
    io,
    cwd: process.cwd(),
    packageRoot,
    version: currentVersion,
  });
}

export { parseOptions };
