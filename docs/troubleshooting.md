# Solução de problemas

## Factory Agent não está instalado

Confirme a presença de `.factory/state.json` na raiz usada pelo comando:

```bash
factory status --root=/caminho/do/projeto
```

Se a raiz estiver correta, execute `factory install`. Não copie apenas o estado manualmente, pois manifesto, políticas e skills também são necessários.

## Engine não detectada

Informe a seleção explicitamente:

```bash
factory install --engines=claude-code,codex,pi-agent
factory add-engine pi-agent
```

Arquivos de entrada existentes são preservados. Verifique se é necessário integrá-los manualmente.

## Extensão Pi não aparece

1. confirme `.pi/extensions/factory-agent/index.ts`;
2. confie no projeto;
3. execute `/reload`;
4. execute `/factory-doctor`.

Use `/factory-extension status` para confirmar se ela está ativa.

## Ollama não conecta

```bash
factory provider test ollama
factory provider models ollama
```

Verifique se o serviço está ativo, se `baseUrl` está correto e se firewall ou proxy bloqueiam o endpoint. O Factory Agent não inicia o serviço automaticamente.

## Nenhum modelo listado

Confirme que existe um modelo de chat instalado. Modelos exclusivamente de embedding são filtrados da integração com o Pi.

## Modelo retornou envelope inválido

O runtime exige JSON puro no formato definido pela skill. Tente um modelo com melhor aderência a saída estruturada ou refine a ideia e os artefatos de contexto. Texto livre e cercas incorretas são recusados.

## Proposta não pode ser aprovada

`factory approve` não sobrescreve arquivos. Se um destino já existir, rejeite a proposta e use uma engine hospedeira para alteração planejada, ou produza uma nova proposta com caminhos ausentes.

## Próximo agente inesperado

Execute:

```bash
factory status --json
factory resume --json
```

Confira nomes dos artefatos, checkboxes de `actions.md` e os campos `status:` ou `resultado:` de QA e aceite.

## Update preservou um arquivo

Isso significa que o hash atual diverge do manifesto. A preservação é intencional. Compare sua customização com o template novo antes de decidir por uma atualização manual.

## Diagnóstico

```bash
factory doctor
npm run check
```

`doctor` valida a instalação no projeto alvo. `npm run check` é destinado ao desenvolvimento do Factory Agent.
