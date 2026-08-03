# Uso

O Factory Agent oferece dois modos de execução que compartilham o mesmo estado e os mesmos artefatos.

## Engine hospedeira

Após `factory install`, abra o projeto na engine selecionada.

| Engine | Entrada inicial | Skills |
|---|---|---|
| Claude Code | `/factory-new` | `.agents/skills/` e `.claude/skills/` |
| Codex | `factory-new` | `.agents/skills/` |
| Pi Agent | `/factory-new` | `.agents/skills/` |

A engine lê a skill do próximo agente, executa ferramentas disponíveis e respeita gates e limites de escrita.

### Pi Agent

```text
/factory
/factory-new Criar uma API de tarefas
/factory-run
/factory-resume
/factory-approve
/factory-reject motivo
/factory-provider
/factory-doctor
/factory-extension on|off|status
```

A extensão também registra `factory_status` e `factory_record_decision`.

## Runtime direto com Ollama

Configure um modelo de chat já instalado:

```bash
factory provider models ollama
factory provider select ollama --model=meu-modelo
factory provider test ollama
```

Inicie e avance:

```bash
factory new "Criar uma API de tarefas"
factory run
```

`factory run` cria uma proposta JSON em `.factory/proposals/`; ele não aplica os artefatos imediatamente. Revise a proposta e escolha:

```bash
factory approve
# ou
factory reject "A proposta precisa detalhar autenticação"
```

Depois, recalcule o estágio:

```bash
factory resume
factory status
```

### Opções de início

```bash
factory new "Nova ideia" --work=002-api
factory new "Recomeçar" --restart
```

`--restart` substitui o workflow ativo, mas não remove artefatos existentes. O identificador de entrega padrão é `001-mvp`.

## Manutenção

- `factory-support`: recebe e classifica solicitações;
- `factory-bug`: registra e investiga um defeito sem corrigi-lo;
- `factory-bug-fix`: reproduz, identifica causa raiz, obtém aprovação e comprova vermelho para verde.

## Retomada segura

O comando `resume` confronta o estado persistido com brief, requisitos, arquitetura, plano, ações, revisão, QA, aceite e documentação. Se houver proposta pendente, ela continua aguardando `approve` ou `reject`.
