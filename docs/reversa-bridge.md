# Reversa Bridge

O Reversa Bridge consome a documentacao operacional produzida pelo Reversa e inicia a reconstrucao de um sistema novo sem modificar o legado.

## Fluxo

```text
legado -> /reversa -> saida Reversa -> factory import reversa
       -> curadoria -> requisitos-alvo -> arquitetura-alvo
       -> dados -> plano -> codigo -> QA -> paridade -> cutover
```

O Factory Agent nao instala nem executa o Reversa. Finalize a extracao na ferramenta externa antes de importar.

## Importacao

Instale o Factory Agent em uma raiz separada para o sistema-alvo:

```bash
factory install --root=/projetos/novo-sistema --engines=pi-agent --project=NovoSistema
factory import reversa --source=/projetos/sistema-legado --root=/projetos/novo-sistema
factory new --from-reversa --root=/projetos/novo-sistema
factory status --root=/projetos/novo-sistema
```

O detector le `.reversa/state.json` ou `.reversa/config.toml` para resolver a pasta de saida. Tambem aceita a propria pasta de saida como `--source`.

## Requisitos da extracao

- `inventory.md`;
- `domain.md`;
- `architecture.md`;
- ao menos uma spec `sdd/*.md`.

`confidence-report.md` e `gaps.md` sao recomendados e produzem avisos quando ausentes.

## Snapshot

```text
_factory_product/imports/reversa/<import-id>/
├── import-manifest.json
├── validation-report.md
├── legacy-baseline.md
├── curation.md
├── traceability.md
└── source/
```

O manifesto registra origem, versao detectada, timestamp, tamanho, confianca e SHA-256. Somente Markdown, JSON, YAML e TOML sao importados. Links simbolicos nao sao seguidos.

## Curadoria

Cada REV-ID comeca como `HUMAN_DECISION` e deve receber uma decisao:

| Decisao | Uso |
|---|---|
| `PRESERVE` | comportamento obrigatorio no novo sistema |
| `MODERNIZE` | intencao preservada com desenho novo |
| `DISCARD` | nao sera levado, com aprovacao e justificativa |
| `HUMAN_DECISION` | bloqueado aguardando decisao humana |
| `GAP` | evidencia insuficiente |

Nenhuma regra vira requisito-alvo sem curadoria.

## Agentes

O fluxo acrescenta importador, curador, requisitos-alvo, arquiteto-alvo, dados, paridade, cutover e auditor de rastreabilidade. A cadeia esperada e:

```text
REV-ID -> decisao -> TARGET-RF -> ADR -> acao -> codigo -> teste -> paridade
```

## Pi Agent

```text
/factory-import-reversa /projetos/sistema-legado
/factory-new-from-reversa
/factory-run
```

As ferramentas `factory_import_reversa` e `factory_start_from_reversa` sempre pedem confirmacao. Elas chamam o mesmo adapter usado pela CLI.

## Ollama

O runtime direto inclui o snapshot no contexto verificado do agente. Selecione um modelo de chat e execute o fluxo normalmente:

```bash
factory provider select ollama --model=meu-modelo
factory run
factory approve
```

## Seguranca

- origem e saida Reversa sao somente leitura;
- origem e alvo precisam estar em arvores separadas;
- paths inseguros e links simbolicos sao recusados ou ignorados;
- o snapshot nao e alterado pelos agentes de reconstrucao;
- deploy, migracao real e corte permanecem sujeitos a gates separados.
