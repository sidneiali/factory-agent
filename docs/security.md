# Segurança

O Factory Agent aplica segurança em camadas, mas não substitui controle de acesso do sistema operacional, revisão humana ou isolamento por container.

## Instalação e ciclo de vida

- arquivos preexistentes não são sobrescritos;
- o manifesto registra SHA-256 dos arquivos gerenciados;
- update altera apenas arquivos ainda intactos e restaura ausentes;
- uninstall remove apenas arquivos intactos criados pela ferramenta;
- caminhos são normalizados e confinados à raiz do projeto.

## Operações críticas

A política padrão exige aprovação para:

- exclusão;
- `git push`;
- deploy e publicação;
- instalação de dependências;
- migração de banco de dados;
- alteração de arquivos existentes da aplicação.

Force push, gravação de credenciais e desativação de testes são proibidos automaticamente.

## Extensão Pi

A extensão intercepta chamadas conhecidas de `bash`, `write` e `edit`. Ela bloqueia caminhos sensíveis, restringe escrita pelo agente atual e solicita confirmação para comandos classificados como risco.

Caminhos como `.git`, `.env`, `node_modules`, `.pi/extensions`, `.pi/skills`, `.factory/policies.json` e `.factory/manifest.json` recebem proteção adicional.

!!! warning
    A interceptação depende das ferramentas conhecidas pela extensão. Um processo externo ou uma ferramenta não gerenciada pode escapar dessa camada. Use permissões mínimas e revise projetos antes de confiar neles.

## Runtime direto

O modelo não recebe autorização para executar comandos. Ele devolve uma proposta estruturada que é validada antes de ser persistida. A aprovação:

- aceita apenas caminhos relativos permitidos;
- recusa qualquer arquivo já existente;
- cria artefatos somente depois de decisão humana.

## Segredos

Não grave tokens, senhas ou chaves nos arquivos do Factory Agent. O Ollama local usa o marcador interno `ollama-local` apenas para compatibilidade com a API OpenAI do Pi; ele não representa uma credencial externa.

## Prática recomendada

Antes de uma alteração relevante:

1. mantenha o projeto em Git;
2. verifique `git status`;
3. revise plano e proposta;
4. execute testes focados e depois a suíte aplicável;
5. revise `git diff` antes de commit, push ou deploy.
