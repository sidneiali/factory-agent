# Agentes

Cada agente é uma skill Markdown com missão, entradas, saídas, áreas de escrita, validações, gates, condições de parada, retomada e handoff.

## Produto e entrega

| Agente | Responsabilidade principal |
|---|---|
| `factory-new` | Entrada e orientação para iniciar um projeto. |
| `factory-discovery` | Converte a ideia em brief verificável e perguntas abertas. |
| `factory-requirements` | Define requisitos funcionais, não funcionais e critérios de aceite. |
| `factory-architect` | Define arquitetura, fronteiras, riscos e ADRs. |
| `factory-plan` | Decompõe uma entrega em roadmap e ações verificáveis. |
| `factory-developer` | Implementa somente ações aprovadas e mantém evidências. |
| `factory-reviewer` | Revisa correção, escopo, segurança e manutenção. |
| `factory-qa` | Executa estratégia de testes e produz relatório de QA. |
| `factory-acceptance` | Confronta critérios de aceite com evidências. |
| `factory-documentation` | Consolida documentação da entrega concluída. |

## Operações

| Agente | Responsabilidade principal |
|---|---|
| `factory-status` | Explica estágio físico, impedimentos e próximo agente. |
| `factory-support` | Recebe solicitações e classifica conhecimento, feature ou bug. |
| `factory-bug` | Registra sintomas, impacto, evidências e hipótese sem corrigir. |
| `factory-bug-fix` | Reproduz, identifica causa raiz, corrige e prova vermelho para verde. |

## Contrato comum

Todo agente deve:

1. ler `.factory/state.json` e os artefatos físicos;
2. distinguir fatos verificados, inferências e lacunas;
3. escrever apenas nas áreas permitidas;
4. não declarar sucesso sem validação;
5. respeitar aprovação humana e operações proibidas;
6. terminar com arquivos afetados, testes, riscos, próximo agente e gate.

Código da aplicação só pode ser alterado por `factory-developer` ou `factory-bug-fix`, dentro de trabalho planejado e aprovado.

## Portabilidade

As mesmas skills são instaladas em `.agents/skills/` e, quando necessário, espelhadas para a engine. Trocar engine ou provider não altera responsabilidades, gates nem critérios de conclusão.
