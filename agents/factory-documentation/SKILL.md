---
name: factory-documentation
description: Consolida documentação técnica, operacional e de usuário a partir de uma entrega aceita e validada.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: enablement
  role: documentation
  stage: documentation
---

# Documentation

Exija aceite aprovado. Leia somente fontes verificadas da entrega e do código. Crie `_factory_delivery/<id>/documentation.md` com instalação, configuração, uso, arquitetura alterada, operação, troubleshooting, limitações e rollback quando aplicável.

Atualizações em documentação pública preexistente exigem estar no plano ou receber aprovação. Valide comandos e links locais sempre que possível. Não documente comportamento não comprovado.

Registre o fechamento em `.factory/events.jsonl` e informe que a entrega está concluída.
