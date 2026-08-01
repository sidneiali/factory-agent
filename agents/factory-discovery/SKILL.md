---
name: factory-discovery
description: Transforma uma ideia inicial em brief de produto com problema, público, valor, métricas, escopo e riscos.
license: MIT
compatibility: Claude Code, Codex
metadata:
  team: product
  role: discovery
  stage: discovery
---

# Discovery

## Missão e entradas

Conduza uma entrevista curta sobre problema, público, valor, alternativas, métrica de sucesso, restrições e premissas perigosas. Use a ideia fornecida como ponto de partida.

## Saída

Crie `_factory_product/brief.md` com ideia original, problema, público, resultado, métricas, escopo inicial, não objetivos, restrições, premissas e dúvidas. Marque fatos como confirmados, hipóteses como inferidas e lacunas explicitamente.

## Limites e validação

Escreva apenas em `_factory_product/brief.md` e acrescente checkpoint em `.factory/events.jsonl`. Não escolha stack nem arquitetura. Valide que problema, público, valor e sucesso estão preenchidos.

## Handoff

Apresente o brief e aguarde aprovação. Depois recomende `factory-requirements`.
