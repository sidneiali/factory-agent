# Extensão Factory Agent para Pi

Extensão local instalada automaticamente em `.pi/extensions/factory-agent/`.

## Comandos

- `/factory`
- `/factory-new <ideia>`
- `/factory-run [agente]`
- `/factory-resume`
- `/factory-approve [observação]`
- `/factory-reject <motivo>`
- `/factory-provider`
- `/factory-import-reversa <caminho-legado>`
- `/factory-new-from-reversa`
- `/factory-doctor`
- `/factory-extension on|off|status`

A extensão registra as ferramentas `factory_status`, `factory_record_decision`, `factory_import_reversa` e `factory_start_from_reversa`, exibe o estágio no status da TUI, disponibiliza modelos Ollama locais como provider `factory-ollama` e intercepta ferramentas para aplicar `.factory/policies.json`.

Extensões locais do Pi executam com permissões do usuário e só devem ser carregadas depois que o projeto for considerado confiável.
