# Workflow

O workflow é orientado por artefatos. `.factory/state.json` guarda contexto operacional, mas a retomada recalcula o próximo agente a partir dos arquivos presentes.

## Fluxo principal

```text
factory-discovery
  -> factory-requirements
  -> factory-architect
  -> factory-plan
  -> factory-developer
  -> factory-reviewer
  -> factory-qa
  -> factory-acceptance
  -> factory-documentation
```

## Fluxo de reconstrucao Reversa

```text
factory-reversa-curator
  -> factory-reversa-target-requirements
  -> factory-reversa-target-architect
  -> factory-reversa-data
  -> factory-plan -> developer -> reviewer -> qa
  -> factory-reversa-parity -> factory-reversa-cutover
  -> acceptance -> documentation
```

O fluxo comeca somente depois de `factory import reversa` e `factory new --from-reversa`. Consulte [Reversa Bridge](reversa-bridge.md).

## Estágios físicos

| Evidência atual | Próximo agente |
|---|---|
| sem `_factory_product/brief.md` | `factory-discovery` |
| brief sem `requirements.md` | `factory-requirements` |
| requisitos sem `architecture.md` | `factory-architect` |
| produto definido, sem entrega ativa | `factory-plan` |
| sem `roadmap.md` ou `actions.md` | `factory-plan` |
| `actions.md` com checkbox aberto | `factory-developer` |
| ações fechadas, sem `review.md` | `factory-reviewer` |
| revisão sem `qa-report.md` | `factory-qa` |
| QA não aprovado | `factory-developer` |
| QA aprovado, aceite ausente ou não aprovado | `factory-acceptance` |
| aceite aprovado, sem `documentation.md` | `factory-documentation` |
| documentação presente | concluído |

Aprovação em QA e aceite é detectada por `status:` ou `resultado:` com valor `approved` ou `aprovado`.

## Artefatos

```text
_factory_product/
├── brief.md
├── requirements.md
├── architecture.md
└── adrs/

_factory_delivery/<work-id>/
├── roadmap.md
├── actions.md
├── review.md
├── qa-report.md
├── acceptance.md
└── documentation.md

_factory_operations/
├── support/
└── bugs/
```

## Gates

Os gates existem antes de decisões de arquitetura, implementação, operações críticas, aceite e aplicação de propostas. Uma decisão deve ser expressa por uma pessoa e registrada; o agente não aprova em nome do usuário.

No runtime direto, cada `run` termina em `awaiting-approval`. Somente `approve` aplica a proposta. No Pi, a extensão também pede confirmação para ferramentas classificadas como críticas.

## Retomada

`factory resume` sincroniza o runtime com o estágio físico sem ignorar uma proposta pendente. Checkboxes de `actions.md` precisam existir e todos devem estar fechados para a revisão começar.

## Ciclos de reparo

Falha de revisão, QA ou aceite retorna ao responsável apropriado. O limite padrão de reparos é três; falhas não devem ser silenciadas nem contornadas com desativação de testes.
