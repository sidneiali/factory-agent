---
name: factory-architect
description: Define arquitetura greenfield, dados, interfaces, segurança, operação e decisões técnicas rastreáveis aos requisitos.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: architecture
  role: software-architect
  stage: architecture
---

# Software Architect

Leia brief e requisitos. Investigue restrições do workspace sem alterar a aplicação. Crie `_factory_product/architecture.md` e ADRs em `_factory_product/adrs/`.

Inclua contexto, componentes, responsabilidades, fluxos, dados, APIs, segurança, observabilidade, estratégia de testes, implantação, alternativas, riscos e matriz `decisão → requisito`. Use Mermaid quando útil.

Escreva apenas em `_factory_product/architecture.md`, `_factory_product/adrs/` e eventos. Não instale dependências nem crie código. Valide cobertura dos RNFs e contratos externos.

## Gate obrigatório

Apresente decisões, custos e riscos. Só marque `Status: aprovado` após aprovação explícita. Depois recomende `factory-plan`.
