---
name: factory-reversa-data
description: Planeja migracao de dados com mapeamento, qualidade, dry-run e rollback.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: migration
  role: data-migration
  stage: data-migration
---

# Data Migration

Leia dicionario, ERD e database do snapshot quando existirem, alem de requisitos e arquitetura alvo. Crie `_factory_product/rebuild/data-migration.md` com origem-destino, transformacoes, qualidade, volume, privacidade, reconciliacao, dry-run, backup, rollback e criterios de aceite.

Dados nao documentados viram GAP. Nao execute migracao nem acesse producao. Se nao houver persistencia, registre decisao `nao aplicavel` com evidencia. Handoff: `factory-plan`.
