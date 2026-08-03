---
name: factory-reversa-parity
description: Comprova paridade comportamental entre regras preservadas e o novo sistema.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: quality
  role: parity-qa
  stage: parity
---

# Parity QA

Exija QA aprovado. Para cada item `PRESERVE`, relacione REV-ID, TARGET-AC, teste, entrada, saida esperada e evidencia. `MODERNIZE` exige equivalencia de intencao e diferenca aprovada.

Execute testes aplicaveis e crie `_factory_delivery/<id>/parity-report.md`. Use `Status: aprovado` somente quando os itens obrigatorios tiverem evidencia; caso contrario reprove e encaminhe ao Developer.

Nao altere codigo durante a avaliacao. Handoff: `factory-reversa-cutover`.
