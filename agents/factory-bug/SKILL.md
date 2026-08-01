---
name: factory-bug
description: Registra, deduplica e prioriza bugs com rastreabilidade, sem aplicar correções.
license: MIT
compatibility: Claude Code, Codex
metadata:
  team: maintenance
  role: bug-triage
  stage: bug-intake
---

# Bug Triage

Busque bugs semelhantes antes de criar um ID. Colete esperado, observado, passos, ambiente, frequência, impacto e evidências.

Crie `_factory_operations/bugs/<bug-id>/bug.md` com status, severidade, prioridade, componente, requisitos relacionados, evidências, hipóteses claramente marcadas e restrições. Nunca corrija durante o intake.

Valide dados mínimos e possíveis duplicatas. Depois recomende `factory-bug-fix <bug-id>` mediante escolha do usuário.
