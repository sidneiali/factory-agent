# Factory Agent — Requisitos do MVP

## Objetivo

Coordenar agentes especializados para transformar uma ideia em software validado e manter o produto por meio de suporte e correção de bugs.

## Usuários

- Pessoa desenvolvedora usando Claude Code ou Codex.
- Responsável de produto que aprova requisitos, arquitetura e aceite.

## Requisitos funcionais

- **RF-001:** instalar skills e arquivos de entrada sem sobrescrever conteúdo existente.
- **RF-002:** detectar Claude Code e Codex no projeto ou ambiente.
- **RF-003:** persistir configuração, estado, políticas e arquivos criados em `.factory/`.
- **RF-004:** iniciar e retomar um projeto pela presença dos artefatos físicos.
- **RF-005:** conduzir discovery, requisitos, arquitetura, planejamento, desenvolvimento, revisão, QA, aceite e documentação.
- **RF-006:** exigir aprovação antes de arquitetura, implementação e aceite.
- **RF-007:** registrar progresso em log append-only.
- **RF-008:** receber solicitações de suporte e convertê-las em conhecimento, feature ou bug.
- **RF-009:** registrar bugs sem corrigi-los durante a triagem.
- **RF-010:** corrigir bugs com prova vermelho → verde e aprovação do change set.
- **RF-011:** exibir status e diagnóstico da instalação.
- **RF-012:** atualizar arquivos intactos sem sobrescrever customizações locais.
- **RF-013:** desinstalar somente arquivos comprovadamente criados pela ferramenta.

## Requisitos não funcionais

- **RNF-001 — Segurança:** nenhuma exclusão, push, deploy ou instalação de dependência é automática.
- **RNF-002 — Portabilidade:** Node.js 20+ em Windows, Linux e macOS.
- **RNF-003 — Auditabilidade:** artefatos textuais e eventos versionáveis.
- **RNF-004 — Resiliência:** retomada não depende apenas de um campo de status.
- **RNF-005 — Extensibilidade:** novos agentes e engines podem ser adicionados sem alterar o orquestrador central.
- **RNF-006 — Testabilidade:** operações de filesystem recebem raiz explícita e são testáveis em pasta temporária.
- **RNF-007 — Menor privilégio:** cada agente declara áreas permitidas de escrita.

## Fora do escopo inicial

- Interface web.
- Scheduler remoto ou execução distribuída.
- Chamada direta a APIs de LLM.
- Deploy automático.
- Marketplace de agentes.
- Engenharia reversa e migração de legado.

## Critérios de aceite

1. A CLI executa `install`, `status`, `doctor`, `update`, `add-agent`, `add-engine` e `uninstall`.
2. Uma instalação em pasta vazia cria estado válido e skills para a engine selecionada.
3. Arquivo de entrada preexistente não é sobrescrito.
4. O status detecta corretamente o próximo agente a partir dos artefatos.
5. Update preserva uma skill customizada.
6. Uninstall não remove arquivo modificado pelo usuário.
7. Testes automatizados e fluxo temporário terminam com sucesso.
