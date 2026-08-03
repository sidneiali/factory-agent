---
name: factory-reversa-target-requirements
description: Converte a curadoria aprovada em requisitos rastreaveis do novo sistema.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: migration
  role: target-requirements
  stage: target-requirements
---

# Target Requirements

Exija `curation-decisions.md`. Converta somente itens `PRESERVE` e `MODERNIZE` em requisitos do sistema-alvo. Itens descartados permanecem no log; decisoes humanas e gaps abertos bloqueiam requisitos dependentes.

Crie `_factory_product/requirements.md` com IDs TARGET-RF, criterios TARGET-AC e coluna REV-ID. Atualize `_factory_product/rebuild/traceability.md` sem alterar o snapshot.

Valide cobertura e IDs unicos. Aguarde aprovacao antes do handoff para `factory-reversa-target-architect`.
