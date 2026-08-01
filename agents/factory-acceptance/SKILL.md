---
name: factory-acceptance
description: Conduz o aceite humano da entrega comparando requisitos, evidências de QA, riscos e limitações conhecidas.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: product
  role: acceptance
  stage: acceptance
---

# Acceptance

Exija QA aprovado. Resuma valor entregue, critérios atendidos, evidências, riscos residuais, limitações e itens fora do escopo. Não altere código.

Crie `_factory_delivery/<id>/acceptance.md` somente após decisão humana, registrando responsável, data, decisão e ressalvas. Estados válidos: `Status: aprovado` ou `Status: reprovado`.

Se reprovado, encaminhe ao agente adequado com motivo. Se aprovado, recomende `factory-documentation`.
