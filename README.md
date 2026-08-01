# Factory Agent

Fábrica de software multiagente que conduz uma ideia por requisitos, arquitetura, planejamento, desenvolvimento, revisão, QA, aceite, documentação e manutenção.

A inteligência dos agentes é distribuída como skills Markdown e executada pela engine já presente no ambiente. O Factory Agent suporta Claude Code, Codex e Pi Agent, além de um runtime direto para modelos Ollama locais. Ele não solicita nem armazena chaves de LLM.

## Requisitos

- Node.js 20 ou superior;
- Claude Code, Codex ou Pi Agent para executar as skills;
- Ollama opcional para o provider local e o runtime direto.

## Uso local

```bash
node bin/factory.js --help
node bin/factory.js install --root=/caminho/do/projeto --engines=claude-code,codex,pi-agent --project=MeuProjeto
node bin/factory.js provider models ollama --root=/caminho/do/projeto
node bin/factory.js status --root=/caminho/do/projeto
node bin/factory.js doctor --root=/caminho/do/projeto
```

Como pacote instalado:

```bash
factory install --engines=pi-agent --project=MeuProjeto
factory provider select ollama --model=nome-do-modelo
factory provider test ollama
factory new "ideia da aplicação"
factory run
factory approve
factory resume
```

Após instalar, execute `/factory-new` no Claude Code ou Pi Agent, ou `factory-new` no Codex. No runtime direto, use `factory new`, `factory run` e os gates `factory approve`/`factory reject`.

## Fluxo

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

Manutenção:

- `factory-support`: intake e classificação;
- `factory-bug`: triagem sem correção;
- `factory-bug-fix`: reprodução, causa raiz, gates e prova vermelho → verde.

## Comandos

| Comando | Função |
|---|---|
| `factory install` | Instala estado, políticas, entradas e skills |
| `factory status` | Detecta estágio físico e próximo agente |
| `factory doctor` | Verifica estado, manifesto, engines e arquivos |
| `factory update` | Atualiza arquivos intactos e preserva customizações |
| `factory add-agent <id>` | Adiciona ou restaura um agente |
| `factory add-engine <id>` | Adiciona Claude Code, Codex ou Pi Agent |
| `factory provider ...` | Lista, seleciona e testa providers/modelos |
| `factory new "ideia"` | Inicia um workflow direto |
| `factory run [agente]` | Executa o próximo agente pelo provider ativo |
| `factory resume` | Retoma pelo estado físico |
| `factory approve` | Aprova e aplica artefatos novos da proposta |
| `factory reject <motivo>` | Rejeita a proposta pendente |
| `factory uninstall` | Remove somente arquivos intactos criados pela ferramenta |

## Artefatos no projeto alvo

```text
.factory/             estado, providers, propostas, políticas, eventos e manifesto
.pi/extensions/       extensão local do Pi Agent
.pi/skills/           skills específicas do Pi Agent
_factory_product/     brief, requisitos, arquitetura e ADRs
_factory_delivery/    planos, ações, revisão, QA, aceite e documentação
_factory_operations/  suporte e bugs
```

## Segurança

- instalação não sobrescreve arquivos de entrada existentes;
- atualizações usam SHA-256 e preservam customizações;
- desinstalação preserva arquivos modificados;
- exclusão, push, deploy, publicação, dependências e migrações exigem aprovação;
- no Pi Agent, a extensão intercepta `bash`, `write` e `edit`, bloqueando caminhos sensíveis e solicitando confirmação para operações de risco;
- o runtime Ollama só aplica propostas após `factory approve` e não sobrescreve arquivos existentes;
- a extensão e a CLI não constituem um sandbox do sistema operacional.

## Desenvolvimento

```bash
npm test
npm run check
```

A arquitetura e requisitos estão em `docs/product/`.

## Pi Agent e Ollama

A instalação `--engines=pi-agent` cria `.pi/extensions/factory-agent/` e `.pi/skills/`. Este repositório também contém um wrapper local em `.pi/extensions/factory-agent/index.ts`, permitindo usar e desenvolver a extensão no próprio projeto. Depois de confiar no projeto, use `/reload` no Pi se a extensão ainda não estiver carregada.

A extensão registra os comandos `/factory-*`, as ferramentas `factory_status` e `factory_record_decision`, mostra o estágio na TUI e disponibiliza modelos de chat do Ollama como provider `factory-ollama`. Modelos exclusivamente de embedding não são registrados como chat.

O endpoint padrão é `http://127.0.0.1:11434` e pode ser alterado com:

```bash
factory provider select ollama --base-url=http://127.0.0.1:11434 --model=meu-modelo
```

## Origem conceitual

O projeto foi inspirado por padrões observados no [sandeco/reversa](https://github.com/sandeco/reversa), especialmente skills portáveis, artefatos operacionais, retomada por estado físico e gates humanos. A implementação do Factory Agent é independente e focada em criação de aplicações.

## Licença

MIT. Consulte `LICENSE`.
