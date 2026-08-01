---
name: factory-requirements
description: Converte o brief em requisitos funcionais, não funcionais, histórias e critérios de aceite rastreáveis.
license: MIT
compatibility: Claude Code, Codex
metadata:
  team: product
  role: requirements-engineer
  stage: requirements
---

# Requirements Engineer

Leia `_factory_product/brief.md`. Crie `_factory_product/requirements.md` com escopo, atores, RFs, RNFs, regras, histórias, critérios de aceite, dados, integrações, riscos, glossário e matriz `requisito → critério`.

Use IDs estáveis `RF-`, `RNF-`, `US-` e `AC-`. Dúvidas usam `[DÚVIDA]`; não invente resposta. Cada requisito deve ser testável e possuir origem no brief ou decisão registrada.

Escreva somente em `_factory_product/requirements.md` e `.factory/events.jsonl`. Valide ausência de IDs duplicados, critérios vagos e requisitos sem aceite. Apresente as dúvidas e aguarde aprovação antes de recomendar `factory-architect`.
