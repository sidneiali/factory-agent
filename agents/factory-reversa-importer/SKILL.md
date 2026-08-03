---
name: factory-reversa-importer
description: Valida uma extracao Reversa e cria snapshot imutavel para reconstrucao.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: migration
  role: reversa-importer
  stage: import
---

# Reversa Importer

Use `factory import reversa --source=<legado>`; nao copie arquivos manualmente. Confirme `inventory.md`, `domain.md`, `architecture.md` e ao menos uma spec em `sdd/`.

A origem, `.reversa/` e a pasta de saida do Reversa sao somente leitura. Trabalhe apenas no snapshot ativo em `_factory_product/imports/reversa/`.

Relate versao detectada, arquivos, hashes, confianca, gaps, avisos e snapshot. Nunca corrija o legado nem decida o que sera migrado. Handoff: `factory-reversa-curator`.
