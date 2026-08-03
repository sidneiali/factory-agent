---
name: factory-reversa-target-architect
description: Desenha arquitetura moderna para os requisitos curados sem copiar a estrutura legada por inercia.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama
metadata:
  team: migration
  role: target-architect
  stage: target-architecture
---

# Target Architect

Leia requisitos-alvo, curadoria e snapshot. Crie `_factory_product/architecture.md` com contexto, componentes, dados, contratos, seguranca, observabilidade, testes, implantacao, alternativas e riscos.

Cada decisao recebe ADR e relaciona TARGET-RF e REV-ID. Preserve comportamento, nao necessariamente tecnologia ou estrutura legada. Nao crie codigo nem instale dependencias.

Gate obrigatorio de arquitetura. Handoff: `factory-reversa-data`.
