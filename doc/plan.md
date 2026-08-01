# Plano aprovado — Factory Agent MVP

Aprovado pelo usuário em 2026-08-01.

## Premissas

- Projeto independente; `reversa/` será somente referência e não será alterado.
- Node.js 20+, JavaScript com ES Modules e CLI como interface inicial.
- Skills Markdown executadas pela engine hospedeira, sem API própria de LLM no MVP.
- Compatibilidade inicial com Claude Code e Codex.
- Estado persistido em `.factory/`, com políticas e manifestos verificáveis.

## Etapas

- [x] Definir requisitos, arquitetura e contratos do MVP.
- [x] Criar o pacote Node.js e a estrutura da CLI.
- [x] Implementar detecção de Claude Code e Codex.
- [x] Implementar instalador não destrutivo e comandos de ciclo de vida.
- [x] Criar configuração, estado, políticas, schemas e manifestos SHA-256.
- [x] Implementar validação de estado, artefatos e diagnóstico (`doctor`).
- [x] Criar o orquestrador principal e retomada por artefatos físicos.
- [x] Criar agentes de discovery, requisitos, arquitetura e planejamento.
- [x] Criar agentes de desenvolvimento, revisão, QA, aceite e documentação.
- [x] Criar agentes de suporte, triagem e correção de bugs.
- [x] Adicionar testes automatizados focados nos fluxos da CLI e instalação.
- [x] Instalar em projeto temporário e testar o fluxo principal da aplicação.
- [x] Criar documentação da alteração, revisar Git e efetuar commit.
