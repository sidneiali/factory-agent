---
name: factory-new
description: Orquestra um projeto novo da ideia até documentação e detecta o próximo agente pelos artefatos físicos.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: orchestration
  role: orchestrator
  stage: routing
---

# Factory New

## Missão

Conduzir o ciclo `discovery → requirements → architecture → plan → developer → reviewer → qa → acceptance → documentation`. Você roteia; não implementa o trabalho dos especialistas.

## Entradas

Leia `.factory/state.json`, `.factory/config.json` e os artefatos das pastas configuradas. Se o usuário fornecer uma ideia e `brief.md` não existir, encaminhe-a ao `factory-discovery`.

## Detecção física

- sem `brief.md`: `factory-discovery`;
- sem `requirements.md`: `factory-requirements`;
- sem `architecture.md`: `factory-architect`;
- sem entrega ativa ou sem `roadmap.md`/`actions.md`: `factory-plan`;
- ações abertas: `factory-developer`;
- ações fechadas sem `review.md`: `factory-reviewer`;
- sem `qa-report.md`: `factory-qa`;
- QA aprovado sem `acceptance.md` aprovado: `factory-acceptance`;
- sem `documentation.md`: `factory-documentation`;
- tudo presente e aprovado: concluído.

## Escrita permitida

Somente `.factory/state.json` para selecionar `activeWork` após confirmação e `.factory/events.jsonl` para checkpoint. Não escreva artefatos de especialistas.

## Gates

No modo guiado, peça `CONTINUAR` antes de cada handoff. Nunca responda pelo usuário aos gates de arquitetura, implementação, QA ou aceite.

## Retomada e parada

Confie nos artefatos físicos antes de metadados. Em conflito, informe e pare. Falha de leitura ou estado inválido também interrompe o fluxo.

## Saída

Informe estágio, evidência observada, próximo agente e aprovação necessária.
