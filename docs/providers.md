# Providers

Providers entregam inferência ao runtime direto. A interface `ModelProvider` permite evolução sem acoplar workflow e modelo. A versão atual implementa Ollama.

## Pré-requisitos do Ollama

- serviço Ollama já instalado e iniciado;
- pelo menos um modelo de chat já disponível;
- endpoint acessível pela máquina local.

O Factory Agent não instala Ollama nem baixa modelos.

## Configuração

```bash
factory provider list
factory provider models ollama
factory provider select ollama --model=meu-modelo
factory provider test ollama
```

Endpoint alternativo:

```bash
factory provider select ollama   --base-url=http://127.0.0.1:11434   --model=meu-modelo   --timeout=120000
```

A URL aceita a raiz do Ollama ou sufixo `/v1`; o cliente normaliza o endpoint. O valor de timeout é expresso em milissegundos.

## Execução

`factory run` envia ao modelo:

1. a skill do agente atual;
2. a ideia inicial;
3. o estágio físico;
4. artefatos Markdown e JSON relevantes, limitados a 200 KB.

O modelo deve responder somente com um envelope JSON contendo resumo, artefatos completos e próximo agente. Respostas inválidas são recusadas.

## Segurança das propostas

- `.git`, `.env`, `node_modules` e `.factory` não podem aparecer como artefatos propostos;
- cada agente fica restrito às próprias áreas de escrita;
- o runtime ignora tentativas de produzir estado e eventos que ele mesmo gerencia;
- `approve` recusa qualquer destino já existente;
- `reject` registra o evento e não cria artefatos.

## Ollama dentro do Pi

Quando `.factory/providers.json` habilita Ollama, a extensão Pi consulta `/api/tags` e registra modelos de chat sob `factory-ollama`. Essa integração usa o modelo na sessão do Pi; ela não muda os gates do Factory Agent.

## Diagnóstico

Se `provider test` falhar, confirme o serviço, a URL e o firewall. Se `models` não listar nada, confirme que existe um modelo de chat e que ele não é exclusivamente de embedding.
