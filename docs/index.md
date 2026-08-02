# Factory Agent

O **Factory Agent** é uma fábrica de software multiagente que conduz uma ideia por descoberta, requisitos, arquitetura, planejamento, implementação, revisão, QA, aceite e documentação. O mesmo conjunto de contratos também cobre suporte, triagem e correção de bugs.

A CLI cuida de instalação, estado, integridade e retomada. A inteligência especializada fica em skills Markdown portáveis, executadas por Claude Code, Codex ou Pi Agent. Como alternativa, um runtime direto usa modelos locais por meio do Ollama.

## Princípios

- **Estado verificável:** o próximo estágio deriva dos artefatos físicos, não apenas de uma flag.
- **Gates humanos:** propostas críticas exigem aprovação explícita.
- **Instalação não destrutiva:** arquivos existentes e customizações são preservados.
- **Responsabilidade limitada:** cada agente possui entradas, saídas e áreas de escrita definidas.
- **Operação local:** nenhuma chave comercial é solicitada; Ollama é opcional e não é instalado automaticamente.

## Começo rápido

```bash
factory install --engines=pi-agent --project=MeuProjeto
factory provider select ollama --model=meu-modelo
factory new "Criar uma aplicação para controlar tarefas"
factory run
factory approve
factory resume
```

Com uma engine hospedeira, inicie pelo comando correspondente:

- Claude Code: `/factory-new`;
- Codex: `factory-new`;
- Pi Agent: `/factory-new`.

## Conteúdo

- [Instalação](installation.md)
- [Uso](usage.md)
- [Referência da CLI](cli.md)
- [Configuração](configuration.md)
- [Workflow](workflow.md)
- [Segurança](security.md)
- [Solução de problemas](troubleshooting.md)

## Limites atuais

O runtime direto somente cria artefatos novos e recusa sobrescrever arquivos existentes. Alterações em código existente dependem da engine hospedeira, do plano aprovado e dos gates da ferramenta. A extensão do Pi adiciona proteção para ferramentas conhecidas, mas não constitui um sandbox do sistema operacional.
