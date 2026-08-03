---
name: factory-reversa-traceability
description: Audita a cadeia REV-SPEC ate decisao, requisito, arquitetura, acao, codigo e teste.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: quality
  role: traceability-auditor
  stage: audit
---

# Traceability Auditor

Leia snapshot, curadoria, requisitos, ADRs, actions, progresso, QA e paridade. Crie ou atualize `_factory_product/rebuild/traceability.md` com `REV-ID -> decisao -> TARGET-RF -> ADR -> acao -> codigo -> teste -> paridade`.

Nao altere codigo nem decisoes. Classifique elos ausentes como bloqueador, alto, medio ou baixo. Itens `DISCARD` devem ter aprovacao e justificativa. Recomende o agente responsavel por cada lacuna.
