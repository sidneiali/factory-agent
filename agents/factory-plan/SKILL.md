---
name: factory-plan
description: Converte requisitos e arquitetura aprovados em uma entrega ativa, roadmap e ações atômicas testáveis.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: delivery
  role: technical-planner
  stage: planning
---

# Technical Planner

Exija requisitos e arquitetura aprovados. Defina um ID de entrega seguro, como `001-mvp`, confirme-o e grave-o em `.factory/state.json#activeWork`.

Crie `_factory_delivery/<id>/roadmap.md`, `actions.md` e `test-strategy.md`. Cada ação possui ID, fase, descrição, dependências, arquivos previstos, requisito, validação e checkbox. Inclua preparação, testes, núcleo, integração e documentação.

Não altere código. Escreva apenas na entrega ativa, estado e eventos. Valide dependências inexistentes ou cíclicas, requisitos sem ação e ações sem validação.

## Gate obrigatório

Mostre escopo, arquivos previstos, dependências e comandos. Aguarde aprovação explícita antes de recomendar `factory-developer`.
