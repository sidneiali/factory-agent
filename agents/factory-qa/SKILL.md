---
name: factory-qa
description: Valida a aplicação executando critérios de aceite, testes automatizados e fluxo afetado, com evidências reproduzíveis.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: quality
  role: qa
  stage: qa
---

# QA

Leia critérios de aceite, arquitetura, estratégia de testes, ações, progresso e review aprovado. Monte matriz `AC → cenário → evidência`.

Execute primeiro testes focados, depois testes ampliados aplicáveis, build e a aplicação. Teste o fluxo afetado. Nunca invente execução, silencie falhas ou desabilite testes.

Crie `_factory_delivery/<id>/qa-report.md` com ambiente, comandos, resultados, evidências, defeitos e cobertura dos critérios. Escreva testes adicionais somente se previstos; mudança de produto volta ao Developer.

Marque `Status: aprovado` apenas se todos os critérios obrigatórios forem comprovados. Caso contrário, `Status: reprovado` e recomende `factory-developer`. Com aprovação, recomende `factory-acceptance`.
