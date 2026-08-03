# Factory Agent

[![npm](https://img.shields.io/npm/v/@sidnei_ali/factory-agent.svg)](https://www.npmjs.com/package/@sidnei_ali/factory-agent)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Fábrica de software multiagente orientada por especificações, evidências e aprovação humana.**

O Factory Agent conduz uma ideia por descoberta, requisitos, arquitetura, planejamento, desenvolvimento, revisão, QA, aceite e documentação. As mesmas regras cobrem suporte, triagem e correção de bugs, além da reconstrução rastreável de sistemas documentados pelo Reversa.

A CLI administra instalação, estado, integridade e retomada. A inteligência especializada fica em skills Markdown portáveis, executadas por Claude Code, Codex ou Pi Agent. Para operação totalmente local, o runtime direto integra modelos do Ollama sem solicitar ou armazenar chaves de LLM.

## Por que usar

- **Estado físico verificável:** o próximo agente é derivado dos artefatos existentes, não apenas de uma flag.
- **Gates humanos:** propostas críticas só são aplicadas após aprovação explícita.
- **Instalação não destrutiva:** arquivos existentes e customizações locais são preservados.
- **Agentes especializados:** cada etapa possui entradas, saídas e áreas de escrita definidas.
- **Portabilidade:** o mesmo projeto pode usar Claude Code, Codex, Pi Agent e Ollama.
- **Engenharia reversa com curadoria:** documentação legada vira insumo rastreável, nunca requisito automático.

## Requisitos

- Node.js 20 ou superior;
- Claude Code, Codex ou Pi Agent para executar as skills; ou
- Ollama opcional para o runtime local direto.

O Factory Agent não instala engines, Ollama ou modelos automaticamente.

## Instalação

Sem instalação global:

```bash
npx @sidnei_ali/factory-agent --help
npx @sidnei_ali/factory-agent install --engines=pi-agent --project=MeuProjeto
```

Como comando global:

```bash
npm install --global @sidnei_ali/factory-agent
factory --version
```

Para desenvolver a partir do repositório:

```bash
git clone https://github.com/sidneiali/factory-agent.git
cd factory-agent
npm test
node bin/factory.js --help
```

## Início rápido

### Com Claude Code, Codex ou Pi Agent

Instale os adaptadores e as skills no projeto alvo:

```bash
factory install \
  --root=/caminho/do/projeto \
  --engines=claude-code,codex,pi-agent \
  --project=MeuProjeto
```

Inicie o workflow pela engine escolhida:

| Engine | Comando inicial |
|---|---|
| Claude Code | `/factory-new` |
| Codex | `factory-new` |
| Pi Agent | `/factory-new` |

Depois, acompanhe o estado físico:

```bash
factory status --root=/caminho/do/projeto
factory doctor --root=/caminho/do/projeto
```

### Com Ollama local

Com o servidor Ollama já instalado e iniciado:

```bash
factory install --engines=pi-agent --project=MeuProjeto
factory provider models ollama
factory provider select ollama --model=nome-do-modelo --timeout=120000
factory provider test ollama
factory new "Criar uma aplicação para controlar tarefas"
factory run
factory approve
factory resume
```

`factory run` cria uma proposta. `factory approve` aplica somente artefatos novos; `factory reject <motivo>` rejeita a proposta sem aplicá-la.

## Workflow principal

```text
discovery
  → requirements
  → architecture
  → plan
  → developer
  → reviewer
  → qa
  → acceptance
  → documentation
```

Fluxos de manutenção:

- `factory-support`: intake e classificação;
- `factory-bug`: triagem e reprodução, sem correção;
- `factory-bug-fix`: causa raiz, plano aprovado e prova vermelho → verde.

## Engines e runtime

| Integração | Como funciona | Entrada principal |
|---|---|---|
| Claude Code | Skills e comandos Markdown instalados no projeto | `/factory-new` |
| Codex | Skills universais e comandos compatíveis | `factory-new` |
| Pi Agent | Skills universais, extensão local, ferramentas e TUI | `/factory-new` |
| Ollama | Provider local usado pelo runtime direto e pelo Pi | `factory run` |

A instalação do Pi cria `.pi/extensions/factory-agent/` e usa exclusivamente as skills universais em `.agents/skills/`, evitando cópias concorrentes. A extensão registra comandos `/factory-*`, ferramentas de estado e decisão, e modelos de chat Ollama disponíveis no ambiente.

O endpoint padrão do Ollama é `http://127.0.0.1:11434`. Para alterá-lo:

```bash
factory provider select ollama \
  --base-url=http://127.0.0.1:11434 \
  --model=meu-modelo \
  --timeout=120000
```

## Reversa Bridge

O Reversa Bridge transforma uma saída de engenharia reversa em insumo controlado para um sistema novo. O Reversa permanece externo: o Factory Agent não o instala, não o executa e nunca modifica o legado.

```bash
factory install --root=/novo-sistema --engines=pi-agent --project=NovoSistema
factory import reversa --source=/sistema-legado --root=/novo-sistema
factory new --from-reversa --root=/novo-sistema
factory status --root=/novo-sistema
```

Durante a importação, o Factory Agent:

1. valida os artefatos obrigatórios do Reversa;
2. cria um snapshot imutável com hashes SHA-256;
3. preserva evidências, confiança, gaps e identificadores `REV-*`;
4. mantém origem legada e sistema-alvo em árvores separadas;
5. exige uma decisão para cada regra importada:
   - `PRESERVE`;
   - `MODERNIZE`;
   - `DISCARD`;
   - `HUMAN_DECISION`;
   - `GAP`;
6. mantém rastreabilidade até requisito-alvo, ADR, ação, código, teste e evidência de paridade.

Detalhes em [Reversa Bridge](docs/reversa-bridge.md).

## Comandos principais

| Comando | Função |
|---|---|
| `factory install` | Instala estado, políticas, adaptadores e skills |
| `factory status` | Detecta o estágio físico e o próximo agente |
| `factory doctor` | Verifica estado, manifesto, engines e arquivos |
| `factory update` | Atualiza intactos, restaura ausentes e preserva customizações |
| `factory add-agent <id>` | Adiciona ou restaura uma skill conhecida |
| `factory add-engine <id>` | Adiciona Claude Code, Codex ou Pi Agent |
| `factory provider ...` | Lista, seleciona e testa providers e modelos |
| `factory new "ideia"` | Inicia um workflow direto |
| `factory run [agente]` | Executa o próximo agente pelo provider ativo |
| `factory approve` | Aprova e aplica artefatos novos da proposta |
| `factory reject <motivo>` | Rejeita a proposta pendente |
| `factory resume` | Reconcilia runtime e artefatos físicos |
| `factory import reversa --source=<legado>` | Importa um snapshot Reversa |
| `factory new --from-reversa` | Inicia reconstrução pelo snapshot ativo |
| `factory uninstall` | Remove somente arquivos intactos criados pela ferramenta |

Consulte a [referência completa da CLI](docs/cli.md).

## Estrutura instalada no projeto

```text
.factory/              estado, providers, propostas, políticas, eventos e manifesto
.pi/extensions/        extensão local do Pi Agent
.agents/skills/        skills universais compartilhadas pelas engines
_factory_product/      brief, requisitos, arquitetura, ADRs e imports Reversa
_factory_delivery/     planos, ações, revisão, QA, aceite e documentação
_factory_operations/   suporte, bugs e evidências operacionais
```

## Segurança e limites

- instalação não sobrescreve arquivos de entrada existentes;
- atualizações usam SHA-256 e preservam customizações;
- desinstalação preserva arquivos modificados;
- exclusão, deploy, publicação, dependências e migrações exigem aprovação;
- legado e snapshots importados são tratados como somente leitura;
- o runtime direto não sobrescreve arquivos existentes;
- a extensão Pi intercepta ferramentas conhecidas, mas não constitui um sandbox do sistema operacional;
- nenhuma migração real, operação destrutiva ou instalação de modelo é executada automaticamente.

Leia a [política de segurança](docs/security.md) antes de usar o projeto em ambientes sensíveis.

## Documentação

- [Visão geral](docs/index.md)
- [Instalação](docs/installation.md)
- [Guia de uso](docs/usage.md)
- [Referência da CLI](docs/cli.md)
- [Configuração](docs/configuration.md)
- [Engines e providers](docs/engines.md)
- [Workflow](docs/workflow.md)
- [Agentes](docs/agents.md)
- [Reversa Bridge](docs/reversa-bridge.md)
- [Segurança](docs/security.md)
- [Solução de problemas](docs/troubleshooting.md)

Se MkDocs estiver disponível:

```bash
mkdocs serve
```

## Desenvolvimento

```bash
npm test
npm run check
npm pack --dry-run
```

Os contratos de produto e arquitetura ficam em [`docs/product/`](docs/product/).

## Origem conceitual

O projeto foi inspirado por padrões observados no [sandeco/reversa](https://github.com/sandeco/reversa), especialmente skills portáveis, artefatos operacionais, retomada por estado físico e gates humanos. A implementação do Factory Agent é independente e voltada à criação e reconstrução segura de aplicações.

## Licença

MIT. Consulte [LICENSE](LICENSE).
