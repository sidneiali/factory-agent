# Configuração

A instalação mantém arquivos determinísticos em `.factory/`. Caminhos e campos principais são validados pela CLI.

## Arquivos

```text
.factory/
├── state.json            projeto, pastas, engines, agentes e runtime
├── config.json           gates e limites do workflow
├── providers.json        provider e modelo ativos
├── policies.json         escrita permitida e operações críticas
├── manifest.json         hashes SHA-256 dos arquivos gerenciados
├── created-files.json    inventário para desinstalação segura
├── events.jsonl          log append-only
├── intake.md             ideia fornecida ao workflow direto
└── proposals/            propostas aguardando decisão
```

## `config.json`

```json
{
  "workflow": {
    "requireArchitectureApproval": true,
    "requireImplementationApproval": true,
    "requireQaApproval": true,
    "requireAcceptanceApproval": true
  },
  "limits": {
    "maxRepairLoops": 3,
    "maxOpenQuestions": 5
  }
}
```

Esses valores expressam política compartilhada do projeto. As skills continuam responsáveis por verificar o gate aplicável antes de prosseguir.

## `state.json`

Campos relevantes:

| Campo | Finalidade |
|---|---|
| `version` | Versão instalada. |
| `project` | Nome do projeto. |
| `language` | Idioma dos artefatos. |
| `folders` | Pastas de produto, entrega e operações. |
| `engines` | Engines instaladas. |
| `agents` | Skills instaladas. |
| `activeWork` | Entrega ativa. |
| `runtime` | Agente atual, status, gate e aprovações. |

Não altere `createdFiles` ou o manifesto manualmente: eles sustentam update e uninstall seguros.

## `providers.json`

```json
{
  "active": "ollama",
  "providers": {
    "ollama": {
      "enabled": true,
      "baseUrl": "http://127.0.0.1:11434",
      "model": "",
      "timeoutMs": 120000
    }
  }
}
```

Prefira `factory provider select` em vez de editar esse arquivo.

## `policies.json`

A configuração padrão limita escrita a `.factory`, `_factory_product`, `_factory_delivery` e `_factory_operations`; exige aprovação para exclusão, push, deploy, publicação, dependências, migrações e alteração de aplicação; e proíbe force push, gravação de credenciais e desativação de testes.

## Preferências locais

`.factory/config.user.json` está no `.gitignore` e pode armazenar preferências pessoais sem entrar no versionamento. A versão atual não depende desse arquivo para executar o workflow.
