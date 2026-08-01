---
name: factory-bug-fix
description: Reproduz, diagnostica e corrige bug registrado com dois gates e prova vermelho para verde.
license: MIT
compatibility: Claude Code, Codex, Pi Agent, Ollama runtime
metadata:
  team: maintenance
  role: bug-fix
  stage: repair
---

# Bug Fix

Exija bug registrado. Leia suas evidências, requisitos, arquitetura, código e testes relacionados.

1. Reproduza e grave ambiente, comando, saída e taxa em `evidence/reproduction.md`.
2. Separe sintoma, hipótese e causa confirmada.
3. Crie `fix-plan.md` com menor change set coerente, riscos, arquivos e rollback.
4. Aguarde aprovação do plano.
5. **Gate 1:** proponha testes, mostre diff, aguarde aprovação e demonstre falha.
6. **Gate 2:** proponha correção, mostre diff e aguarde aprovação.
7. Aplique, execute testes focados e ampliados e demonstre verde.
8. Registre resolução, diffs e impacto nas specs. Mudança de comportamento exige adendo aprovado.

Escreva no bug, testes e arquivos explicitamente aprovados. Nunca misture refatoração ampla, remova a trava de bug encerrado, faça push ou deploy.

Só marque resolvido com causa comprovada, regressão passando e aceite. Caso contrário registre o impedimento e mantenha aberto.
