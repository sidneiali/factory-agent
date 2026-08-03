# Referência da CLI

## Sintaxe

```bash
factory <comando> [argumentos] [--opcao=valor]
```

Opções usam o formato `--chave=valor`. Argumentos sem `--` são posicionais.

## Opções comuns

| Opção | Efeito |
|---|---|
| `--root=<path>` | Define a raiz do projeto alvo; o padrão é o diretório atual. |
| `--json` | Solicita saída estruturada quando o comando oferece suporte. |
| `--help`, `-h` | Mostra ajuda geral. |
| `--version`, `-v` | Mostra a versão. |

## Comandos de ciclo de vida

| Comando | Uso | Descrição |
|---|---|---|
| `install` | `factory install --engines=pi-agent --project=Nome` | Instala estado, políticas e agentes. |
| `status` | `factory status [--json]` | Mostra estágio físico e próximo agente. |
| `doctor` | `factory doctor [--json]` | Verifica estado, manifesto, engines e arquivos. |
| `update` | `factory update` | Atualiza intactos, restaura ausentes e preserva modificados. |
| `add-agent` | `factory add-agent factory-qa` | Instala ou restaura uma skill conhecida. |
| `add-engine` | `factory add-engine pi-agent` | Adiciona uma engine suportada. |
| `import` | `factory import reversa --source=/legado` | Valida e cria snapshot imutavel de uma extracao Reversa. |
| `uninstall` | `factory uninstall` | Remove apenas arquivos intactos registrados no manifesto. |

## Provider

```bash
factory provider list [--json]
factory provider models ollama [--json]
factory provider select ollama --model=nome --base-url=http://127.0.0.1:11434 --timeout=120000
factory provider test ollama [--json]
```

No comando `select`, `--base-url`, `--model` e `--timeout` são opcionais. Atualmente, `ollama` é o único provider direto suportado.

## Workflow direto

| Comando | Uso | Descrição |
|---|---|---|
| `new` | `factory new "ideia" [--work=id] [--restart]` | Inicializa o workflow e a entrega ativa. |
| `new --from-reversa` | `factory new --from-reversa [--work=id]` | Inicia reconstrucao pelo snapshot Reversa ativo. |
| `run` | `factory run [factory-agente]` | Executa o próximo agente e cria uma proposta. |
| `approve` | `factory approve` | Aplica somente artefatos novos da proposta pendente. |
| `reject` | `factory reject <motivo>` | Rejeita a proposta sem aplicar artefatos. |
| `resume` | `factory resume [--json]` | Reconcilia runtime e artefatos físicos. |

Solicitar manualmente um agente diferente do próximo estágio físico produz erro. Uma nova execução também é recusada enquanto houver gate pendente.

## Códigos de saída

A CLI retorna `0` em sucesso. Comando desconhecido, diagnóstico com erro e exceções operacionais retornam código diferente de zero pelo ponto de entrada.
