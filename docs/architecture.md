# Arquitetura

## Visão geral

O Factory Agent separa regras determinísticas de orquestração da inteligência dos agentes.

```text
CLI
  -> comandos
      -> instalador, estado, manifesto e workflow
      -> runtime direto -> ModelProvider -> Ollama

Engines hospedeiras
  -> skills Markdown
  -> ferramentas da engine
  -> artefatos físicos e gates

Pi Agent
  -> extensão local
  -> comandos, ferramentas, status e policy guard
```

## Componentes

| Componente | Responsabilidade |
|---|---|
| `bin/factory.js` | Ponto de entrada executável. |
| `lib/cli.js` | Parse de opções, ajuda e despacho de comandos. |
| `lib/installer.js` | Instalação não destrutiva de estado, skills e engines. |
| `lib/manifest.js` | Hashes e classificação intacto, modificado ou ausente. |
| `lib/state.js` | Leitura, validação e escrita atômica do estado. |
| `lib/workflow.js` | Inferência do estágio por artefatos físicos. |
| `lib/runtime.js` | Contexto, execução, propostas, aprovação e rejeição. |
| `lib/providers/` | Contrato de inferência e implementação Ollama. |
| `lib/engines.js` | Catálogo e detecção de engines. |
| `templates/pi-extension/` | Extensão TypeScript instalada no Pi Agent. |
| `agents/` | Contratos especializados em Markdown. |

## Decisões

- JavaScript ESM e Node.js 20+;
- nenhuma dependência de runtime;
- JSON para estado e Markdown para conhecimento operacional;
- escrita atômica para estado e manifestos;
- SHA-256 para preservar customizações;
- engines e providers como conceitos independentes;
- retomada determinada por evidência física;
- propostas de modelo separadas de aplicação em disco.

## Fluxo de instalação

1. resolver raiz e engines;
2. criar pastas administrativas e de artefatos;
3. copiar somente destinos ausentes;
4. instalar skills universais e espelhos;
5. instalar entrada ou extensão da engine;
6. persistir estado, arquivos criados e manifesto.

## Fluxo do runtime direto

1. reconciliar estágio físico;
2. carregar skill, provider, intake e contexto limitado;
3. solicitar envelope JSON ao modelo;
4. validar agente, área e caminho de cada artefato;
5. salvar proposta e abrir gate;
6. após aprovação, garantir que todos os destinos são novos;
7. criar arquivos, registrar evento e liberar o próximo estágio.

## Limitações

- Claude Code e Codex aplicam políticas conforme os recursos da própria engine;
- Pi intercepta ferramentas conhecidas, sem sandbox completo;
- o runtime direto não edita arquivos existentes;
- qualidade e aderência ao envelope variam entre modelos Ollama;
- deploy, observabilidade, scheduler e interface web estão fora do MVP.

Para requisitos detalhados, consulte [Requisitos do produto](product/requirements.md) e [Contrato dos agentes](product/agent-contract.md).
