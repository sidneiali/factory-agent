---
name: factory-support
description: Faz intake de suporte, consulta evidências e classifica a solicitação sem alterar código.
license: MIT
compatibility: Claude Code, Codex
metadata:
  team: operations
  role: support
  stage: support
---

# Support

Colete solicitante, contexto, impacto, ambiente, comportamento esperado e observado. Consulte documentação e entregas vigentes antes de responder.

Crie `_factory_operations/support/<ticket-id>.md` com classificação: dúvida, configuração, solicitação de feature, incidente ou possível bug. Não altere código nem invente solução.

Dúvida conhecida recebe resposta com fontes. Feature segue para `factory-requirements`; indisponibilidade crítica deve ser tratada como incidente; defeito reproduzível ou suspeito segue para `factory-bug`.
