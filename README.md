# Factory Agent

Fábrica de software multiagente que conduz uma ideia por requisitos, arquitetura, planejamento, desenvolvimento, revisão, QA, aceite, documentação e manutenção.

A inteligência dos agentes é distribuída como skills Markdown e executada pela engine já presente no ambiente. O MVP suporta Claude Code e Codex e não solicita nem armazena chaves de LLM.

## Requisitos

- Node.js 20 ou superior;
- Claude Code ou Codex para executar as skills.

## Uso local

```bash
node bin/factory.js --help
node bin/factory.js install --root=/caminho/do/projeto --engines=claude-code,codex --project=MeuProjeto
node bin/factory.js status --root=/caminho/do/projeto
node bin/factory.js doctor --root=/caminho/do/projeto
```

Como pacote instalado:

```bash
factory install --engines=codex --project=MeuProjeto
factory status
factory doctor
factory update
factory uninstall
```

Após instalar, execute `/factory-new` no Claude Code ou `factory-new` no Codex.

## Fluxo

```text
discovery
  → requirements
  → architecture
  → plan
  → developer
  → reviewer
  → qa
  → acceptance
  → documentation
```

Manutenção:

- `factory-support`: intake e classificação;
- `factory-bug`: triagem sem correção;
- `factory-bug-fix`: reprodução, causa raiz, gates e prova vermelho → verde.

## Comandos

| Comando | Função |
|---|---|
| `factory install` | Instala estado, políticas, entradas e skills |
| `factory status` | Detecta estágio físico e próximo agente |
| `factory doctor` | Verifica estado, manifesto, engines e arquivos |
| `factory update` | Atualiza arquivos intactos e preserva customizações |
| `factory add-agent <id>` | Adiciona ou restaura um agente |
| `factory add-engine <id>` | Adiciona Claude Code ou Codex |
| `factory uninstall` | Remove somente arquivos intactos criados pela ferramenta |

## Artefatos no projeto alvo

```text
.factory/             estado, configuração, políticas, eventos e manifesto
_factory_product/     brief, requisitos, arquitetura e ADRs
_factory_delivery/    planos, ações, revisão, QA, aceite e documentação
_factory_operations/  suporte e bugs
```

## Segurança

- instalação não sobrescreve arquivos de entrada existentes;
- atualizações usam SHA-256 e preservam customizações;
- desinstalação preserva arquivos modificados;
- exclusão, push, deploy, publicação, dependências e migrações exigem aprovação;
- a CLI não é um sandbox: a engine hospedeira deve respeitar as políticas instaladas.

## Desenvolvimento

```bash
npm test
npm run check
```

A arquitetura e requisitos estão em `docs/product/`.

## Origem conceitual

O projeto foi inspirado por padrões observados no [sandeco/reversa](https://github.com/sandeco/reversa), especialmente skills portáveis, artefatos operacionais, retomada por estado físico e gates humanos. A implementação do Factory Agent é independente e focada em criação de aplicações.

## Licença

MIT. Consulte `LICENSE`.
