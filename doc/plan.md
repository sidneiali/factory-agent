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

---

# Plano aprovado — Pi Agent e Ollama

Aprovado pelo usuário em 2026-08-01.

## Premissas

- Pi Agent será uma engine hospedeira oficial, com extensão local em `.pi/extensions/factory-agent/`.
- As skills serão instaladas também em `.pi/skills/` e continuarão universais em `.agents/skills/`.
- Ollama poderá ser usado diretamente pelo runtime ou como provider ativo do Pi Agent.
- Nenhuma instalação de Ollama ou download de modelo será automático.
- Políticas de ferramentas serão aplicadas tecnicamente pela extensão do Pi.

## Etapas

- [x] Atualizar requisitos, arquitetura e contratos para Pi Agent e providers.
- [x] Criar abstração de providers e cliente Ollama configurável.
- [x] Implementar runtime de workflow e comandos `new`, `run`, `resume`, `approve` e `reject`.
- [x] Adicionar detecção e instalação da engine Pi Agent.
- [x] Implementar extensão TypeScript do Pi com comandos, ferramentas, status e persistência.
- [x] Implementar proteção de arquivos e comandos nos eventos de ferramentas do Pi.
- [x] Integrar o modelo ativo do Pi e o provider Ollama ao workflow.
- [x] Adicionar e atualizar testes automatizados.
- [x] Validar CLI, extensão Pi e integração Ollama disponível localmente.
- [x] Atualizar documentação, revisar Git e efetuar commit.

---

# Plano aprovado — documentação e remoção da referência Reversa

Aprovado pelo usuário em 2026-08-01.

## Premissas

- A documentação será própria do Factory Agent, em português do Brasil.
- O Reversa será usado apenas como referência de organização e cobertura temática, sem cópia literal de identidade ou conteúdo.
- A documentação será navegável por Markdown e configuração MkDocs, sem instalar dependências novas.
- O diretório local `reversa/` será removido definitivamente somente após a documentação e seus links serem validados.

## Etapas

- [x] Inventariar a documentação do Reversa e confrontá-la com o comportamento atual do Factory Agent.
- [x] Criar a estrutura documental e a navegação do Factory Agent.
- [x] Documentar instalação, uso, CLI, configuração, engines, providers, workflow e segurança.
- [x] Documentar arquitetura, solução de problemas e contribuição.
- [x] Validar exemplos, links internos, testes automatizados e execução da CLI.
- [x] Remover definitivamente o diretório `reversa/` e sua regra no `.gitignore`.
- [x] Criar o registro da alteração, revisar Git e efetuar commit.


---

# Plano aprovado — publicação GitHub e npm

Aprovado pelo usuário em 2026-08-02.

## Premissas

- O repositório público é `https://github.com/sidneiali/factory-agent`.
- O usuário npm autenticado é `sidnei_ali`.
- O pacote público será `@sidnei_ali/factory-agent`, mantendo o comando global `factory`.
- Nenhuma credencial será gravada ou exibida pelo projeto.

## Etapas

- [x] Atualizar metadados do pacote e instruções de instalação via npm e npx.
- [x] Validar testes, conteúdo do pacote e instalação em pasta temporária.
- [x] Criar o registro da publicação, revisar Git e efetuar commit.
- [x] Enviar o commit para `origin/main`.
- [ ] Publicar no npm e validar o pacote público.

Impedimento: o registry recusou a publicação com `E403` porque a conta exige autenticação de dois fatores ou token granular com bypass de 2FA. A publicação permanece pendente até o usuário concluir esse gate diretamente no terminal.

---

# Plano aprovado — corrigir colisões de skills no Pi Agent

Aprovado pelo usuário em 2026-08-02.

## Premissas

- `.agents/skills/` continuará como diretório universal e já é descoberto pelo Pi Agent.
- Instalações novas do Pi não criarão o espelho redundante `.pi/skills/`.
- O update removerá somente cópias legadas intactas; customizações serão preservadas e deixarão de ser gerenciadas.
- A correção será publicada como `@sidnei_ali/factory-agent@0.2.1`.

## Etapas

- [x] Remover a duplicação de skills em novas instalações do Pi Agent.
- [x] Migrar cópias legadas no update sem remover customizações.
- [x] Adicionar testes de instalação e migração da colisão.
- [x] Atualizar versão e documentação.
- [x] Executar testes, aplicação, empacotamento e validação temporária.
- [x] Criar registro da correção, revisar Git e efetuar commit.
- [x] Enviar a correção para `origin/main`.
- [ ] Publicar e validar `@sidnei_ali/factory-agent@0.2.1`.

Impedimento: o registry recusou `npm publish` com `E404`, indicando ausência de permissão ou autenticação para o escopo `@sidnei_ali` nesta sessão.

---

# Plano aprovado — Reversa Bridge 0.3.0

Aprovado pelo usuário em 2026-08-03.

## Premissas

- O Reversa permanece uma ferramenta externa e não será instalado nem executado automaticamente.
- A importação lê o legado e os artefatos Reversa sem modificá-los.
- O sistema-alvo deve ficar em uma raiz separada ou receber apenas um snapshot imutável da origem.
- Toda regra importada exige decisão `PRESERVE`, `MODERNIZE`, `DISCARD`, `HUMAN_DECISION` ou `GAP`.
- Pi Agent e runtime Ollama compartilharão o mesmo adapter e os mesmos artefatos.

## Etapas

- [x] Atualizar requisitos, arquitetura e contratos do Reversa Bridge.
- [x] Implementar detector, validador e snapshot SHA-256 dos artefatos Reversa.
- [x] Implementar comandos `factory import reversa` e `factory new --from-reversa`.
- [x] Criar agentes de importação, curadoria, requisitos-alvo, dados, paridade e cutover.
- [x] Integrar comandos e ferramentas do Reversa Bridge à extensão Pi.
- [x] Integrar o snapshot ao contexto do runtime Ollama.
- [x] Implementar rastreabilidade `REV-SPEC → decisão → requisito → código → teste`.
- [x] Adicionar fixtures e testes automatizados do fluxo completo.
- [x] Validar CLI, Pi Agent, empacotamento e integração em pastas temporárias.
- [x] Atualizar documentação e versão para `0.3.0`.
- [x] Criar registro da alteração, revisar Git e efetuar commit.
- [ ] Enviar para `origin/main` e publicar quando a autenticação npm permitir.

## Checkpoint de contexto — 2026-08-03 19:32

Estado atual:

- Reversa Bridge implementado em `lib/integrations/`, CLI, workflow, 8 skills e extensão Pi.
- Documentação e versão `0.3.0` atualizadas.
- 28 testes automatizados aprovados; 22 skills validadas.
- Fluxo temporário `install → import reversa → new --from-reversa → status → doctor` aprovado.
- Extensão carregada pelo Pi Agent e pacote de 68 arquivos validado.
- Ollama local respondeu à descoberta com 6 modelos; duas execuções reais de chat expiraram por timeout. O runtime com resposta Ollama simulada foi aprovado.

Arquivos centrais envolvidos:

- `lib/integrations/reversa-detection.js`
- `lib/integrations/reversa-snapshot.js`
- `lib/integrations/reversa.js`
- `lib/commands/import.js`
- `lib/workflow.js`
- `templates/pi-extension/factory-agent/`
- `agents/factory-reversa-*/`
- `test/reversa-integration.test.js`
- `docs/reversa-bridge.md`

Próximo passo seguro: marcar as validações e documentação já concluídas, criar o registro obrigatório da versão `0.3.0`, revisar todo o diff, executar validação final, efetuar commit e push. A publicação npm permanece condicionada à autenticação do escopo.


