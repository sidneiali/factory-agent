# Instalação

## Requisitos

- Node.js 20 ou superior;
- uma engine compatível: Claude Code, Codex ou Pi Agent;
- Ollama apenas se o runtime local for utilizado.

O Factory Agent não instala engines, Ollama, modelos ou dependências do projeto alvo.

## Executar pelo npm

Sem instalação global:

```bash
npx @sidnei_ali/factory-agent --help
npx @sidnei_ali/factory-agent install --engines=pi-agent --project=MeuProjeto
```

Para disponibilizar o comando `factory` globalmente:

```bash
npm install --global @sidnei_ali/factory-agent
factory --version
```

## Instalação no projeto alvo

Com o pacote disponível como comando `factory`:

```bash
factory install --engines=pi-agent --project=MeuProjeto
```

Para trabalhar com o código-fonte desta distribuição:

```bash
node bin/factory.js install --root=/caminho/do/projeto --engines=claude-code,codex,pi-agent --project=MeuProjeto
```

As engines são separadas por vírgula. Sem `--engines`, a CLI tenta detectar engines instaladas ou marcadores no projeto; se nenhuma for detectada, usa Codex.

## Estrutura criada

```text
.factory/                         estado, configuração, providers, políticas e manifesto
.agents/skills/factory-*/         skills universais
.claude/skills/factory-*/         espelho quando Claude Code é selecionado
.pi/extensions/factory-agent/     extensão local do Pi Agent
_factory_product/                 brief, requisitos, arquitetura e ADRs
_factory_delivery/                planos, revisão, QA, aceite e documentação
_factory_operations/              suporte e bugs
CLAUDE.md                         entrada do Claude Code, se ausente
AGENTS.md                         entrada do Codex, se ausente
```

## Garantias do instalador

- cria somente arquivos ausentes;
- não substitui `CLAUDE.md` ou `AGENTS.md` preexistentes;
- registra hashes SHA-256 dos arquivos gerenciados;
- permite restaurar arquivos ausentes com `factory update`;
- preserva customizações durante update e uninstall.

## Verificação

```bash
factory status
factory doctor
```

Use `--json` nos comandos que oferecem saída estruturada. No Pi Agent, confie no projeto antes de carregar a extensão local e execute `/reload` se ela ainda não aparecer.

## Adição posterior

```bash
factory add-engine claude-code
factory add-agent factory-support
```

Engines válidas: `claude-code`, `codex` e `pi-agent`.
