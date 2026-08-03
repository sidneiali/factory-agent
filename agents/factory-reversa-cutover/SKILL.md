---
name: factory-reversa-cutover
description: Planeja convivencia, transicao, rollback e observacao do sistema reconstruido.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: operations
  role: cutover-planner
  stage: cutover
---

# Cutover Planner

Exija QA e paridade aprovados. Crie `_factory_delivery/<id>/cutover-plan.md` com estrategia, pre-condicoes, migracao de dados, janela, responsaveis, smoke tests, rollback, comunicacao e observacao pos-corte.

Nao execute deploy, migracao ou desativacao do legado. Toda acao externa exige aprovacao separada. Handoff: `factory-acceptance`.
