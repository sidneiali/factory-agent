# Contribuição

## Ambiente

- Node.js 20 ou superior;
- Git;
- Pi Agent e Ollama são opcionais para testes de integração local.

A aplicação não possui dependências de runtime. Depois de clonar o repositório:

```bash
npm test
npm run check
node bin/factory.js --help
```

## Estrutura

```text
agents/                         skills Markdown
bin/                            ponto de entrada da CLI
lib/                            comandos e núcleo determinístico
schemas/                        contratos JSON
templates/                      arquivos instalados nos projetos
test/                           testes Node.js
docs/                           documentação do usuário e produto
.pi/extensions/factory-agent/   wrapper local para desenvolvimento
```

## Mudança em comportamento

1. defina o comportamento e preserve APIs existentes quando possível;
2. atualize ou adicione teste focado;
3. mantenha filesystem confinado a uma raiz explícita;
4. valide primeiro o teste focado e depois `npm run check`;
5. execute a CLI no fluxo afetado;
6. atualize documentação e revise o diff.

## Novo agente

1. crie `agents/factory-<id>/SKILL.md`;
2. inclua front matter com nome, descrição, licença, compatibilidade e metadata;
3. declare missão, entradas, saídas, escrita permitida, validações, gates, parada, retomada e handoff;
4. adicione o agente ao catálogo do instalador;
5. teste instalação, update e restauração.

## Nova engine

Atualize o catálogo em `lib/engines.js`, forneça template de entrada ou assets, preserve arquivos preexistentes e cubra detecção e instalação por testes.

## Novo provider

Implemente `ModelProvider`, valide mensagens, normalize erros e registre o ID em `lib/providers/index.js`. Providers não podem enfraquecer gates nem áreas de escrita.

## Documentação

A navegação está em `mkdocs.yml`. Links devem ser relativos e válidos. Se MkDocs estiver disponível:

```bash
mkdocs build --strict
```

A configuração usa o tema integrado `readthedocs` e não exige plugins adicionais.
