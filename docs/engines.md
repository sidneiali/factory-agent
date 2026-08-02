# Engines

Engines hospedam as skills e fornecem modelo, contexto e ferramentas. Elas são diferentes de providers: um provider oferece inferência ao runtime direto; uma engine conduz a sessão agêntica.

## Compatibilidade

| ID | Engine | Entrada criada | Destino das skills | Ativação inicial |
|---|---|---|---|---|
| `claude-code` | Claude Code | `CLAUDE.md` | `.agents/skills/` e `.claude/skills/` | `/factory-new` |
| `codex` | Codex | `AGENTS.md` | `.agents/skills/` | `factory-new` |
| `pi-agent` | Pi Agent | extensão local | `.agents/skills/` e `.pi/skills/` | `/factory-new` |

## Detecção

A CLI procura o comando da engine e marcadores no projeto:

- Claude Code: comando `claude` ou pasta `.claude`;
- Codex: comando `codex` ou `AGENTS.md`;
- Pi Agent: comando `pi` ou pasta `.pi`.

A seleção explícita evita ambiguidades:

```bash
factory install --engines=claude-code,codex,pi-agent
factory add-engine pi-agent
```

## Skills universais

`.agents/skills/` é a fonte instalada comum. Os espelhos existem quando a engine exige localização própria. Todas as skills seguem o mesmo contrato de responsabilidade, evidência, gate e handoff.

## Pi Agent

A instalação copia `.pi/extensions/factory-agent/`. A extensão:

- registra comandos `/factory-*`;
- expõe `factory_status` e `factory_record_decision`;
- mostra estágio e próximo agente na TUI;
- intercepta `bash`, `write` e `edit` para aplicar políticas;
- registra modelos de chat do Ollama como provider `factory-ollama` quando disponível;
- ignora modelos identificados como embedding.

Projetos locais só devem ser confiados depois de revisão. A extensão opera com as permissões do usuário e não isola o sistema operacional.

## Múltiplas engines

É possível instalar todas simultaneamente. Arquivos de entrada existentes são preservados, portanto uma integração manual pode ser necessária caso o projeto já possua `CLAUDE.md` ou `AGENTS.md`.
