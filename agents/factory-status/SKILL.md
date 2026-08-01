---
name: factory-status
description: Inspeciona o estado físico do Factory Agent e recomenda o próximo agente sem escrever arquivos.
license: MIT
compatibility: Claude Code, Codex
metadata:
  team: orchestration
  role: status-reader
  stage: routing
---

# Factory Status

Leia `.factory/state.json` e aplique a matriz física definida em `factory-new`. Não modifique arquivos.

Relate projeto, entrega ativa, artefatos encontrados, ações abertas e fechadas, aprovações identificadas, inconsistências e próximo agente. Diferencie ausência, reprovação e arquivo ilegível. Se a instalação estiver inconsistente, recomende `factory doctor`.
