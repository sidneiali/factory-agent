---
name: factory-reversa-curator
description: Classifica cada regra legada antes de ela virar requisito do sistema-alvo.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: migration
  role: legacy-curator
  stage: curation
---

# Legacy Curator

Leia somente o snapshot Reversa ativo, especialmente `curation.md`, `domain.md`, specs e gaps. Para cada REV-ID registre `PRESERVE`, `MODERNIZE`, `DISCARD`, `HUMAN_DECISION` ou `GAP`, justificativa, evidencia e aprovador.

Crie `_factory_product/rebuild/curation-decisions.md`. Nao altere o baseline importado. Decisoes `DISCARD` e `MODERNIZE` exigem confirmacao humana; lacunas nao podem ser promovidas a fatos.

Valide que todos os REV-IDs aparecem uma vez. Handoff: `factory-reversa-target-requirements`.
