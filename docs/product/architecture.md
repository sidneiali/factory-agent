# Factory Agent — Arquitetura do MVP

## Visão

O Factory Agent é uma CLI instaladora e mantenedora de skills. A inteligência dos papéis vive em Markdown e é executada pela engine hospedeira. A CLI aplica regras determinísticas de instalação, estado, integridade e diagnóstico.

## Componentes

```text
bin/factory.js
  → lib/cli.js
      ├── commands/install.js
      ├── commands/status.js
      ├── commands/doctor.js
      ├── commands/update.js
      ├── commands/add-agent.js
      ├── commands/add-engine.js
      └── commands/uninstall.js

lib/
├── engines.js       detecção e catálogo de engines
├── installer.js     cópia não destrutiva e arquivos de entrada
├── manifest.js      SHA-256 e classificação intacto/modificado/ausente
├── state.js         leitura, escrita atômica e validação
├── workflow.js      estágio físico e próximo agente
└── filesystem.js    utilitários confinados à raiz do projeto
```

## Diretórios instalados

```text
.factory/
├── state.json
├── config.json
├── policies.json
├── events.jsonl
├── created-files.json
└── manifest.json

.factory_product/
.factory_delivery/
.factory_operations/
.agents/skills/factory-*/
.claude/skills/factory-*/  # quando Claude Code for selecionado
```

## Estado do workflow

O estágio é calculado pela presença dos seguintes artefatos:

```text
sem brief                 → factory-discovery
brief.md                  → factory-requirements
requirements.md           → factory-architect
architecture.md           → factory-plan
roadmap.md sem actions    → factory-plan
roadmap.md + actions      → factory-developer ou factory-reviewer
review.md                 → factory-qa
qa-report aprovado        → factory-acceptance
acceptance aprovado       → factory-documentation
```

Quando `actions.md` tiver checkbox aberto, o próximo agente é desenvolvimento. Com todas as ações fechadas e sem revisão, o próximo é revisão.

## Decisões arquiteturais

- JavaScript ESM para manter o pacote pequeno e sem etapa de compilação.
- Somente APIs nativas do Node.js no MVP; zero dependências de runtime.
- JSON para estado determinístico; Markdown para artefatos operacionais.
- Escrita atômica por arquivo temporário e rename para estado e manifestos.
- Manifesto SHA-256 para preservar customizações.
- Paths normalizados e confinados à raiz para impedir path traversal.
- Skills universais em `.agents/skills`; espelho opcional em `.claude/skills`.

## Segurança

- O instalador só cria arquivos ausentes.
- Merge em arquivos de entrada deve ser solicitado manualmente; no MVP a CLI preserva o existente e informa o usuário.
- Update substitui apenas arquivos cujo hash ainda coincide com o manifesto.
- Uninstall remove apenas arquivos intactos registrados como criados.
- Agentes não recebem autorização implícita para push, deploy, exclusões ou instalação de dependências.

## Limitações conscientes

As políticas descritas nas skills dependem da engine para execução. A CLI garante segurança no próprio ciclo de instalação, mas não atua como sandbox dos comandos executados pela engine.
