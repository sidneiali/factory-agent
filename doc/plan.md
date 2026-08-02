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
- [ ] Enviar o commit para `origin/main`.
- [ ] Publicar no npm e validar o pacote público.
