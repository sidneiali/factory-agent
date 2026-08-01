# Contrato de agentes do Factory Agent

Cada `SKILL.md` deve conter front matter com `name`, `description`, `license`, `compatibility` e metadata de `team`, `role` e `stage`.

## Seções obrigatórias

1. Missão e limite de responsabilidade.
2. Entradas obrigatórias.
3. Artefatos de saída.
4. Áreas permitidas para escrita.
5. Validações obrigatórias.
6. Gates humanos.
7. Condições de parada.
8. Regras de retomada.
9. Handoff para o próximo agente.
10. Formato do relatório final.

## Regras globais

- Ler `.factory/state.json` antes de resolver pastas.
- Não declarar sucesso sem evidência da validação.
- Não sobrescrever decisão humana sem registrar nova aprovação.
- Não executar exclusão, push, deploy, publicação ou instalação sem aprovação explícita.
- Separar fatos verificados, inferências e lacunas.
- Gravar artefatos de produto em `_factory_product/`.
- Gravar entregas em `_factory_delivery/<work-id>/`.
- Gravar suporte e bugs em `_factory_operations/`.
- Código da aplicação só pode ser alterado pelo Developer ou Bug Fix dentro de um plano aprovado.
- Quando executado pelo Pi Agent, usar apenas ferramentas ativas e respeitar respostas de bloqueio da extensão.
- Respostas destinadas ao runtime direto devem usar o envelope estruturado de ações, sem comandos embutidos em texto livre.
- O provider selecionado não altera responsabilidades, gates nem áreas de escrita do agente.

## Handoff padrão

Todo agente deve terminar informando:

- artefatos criados ou alterados;
- validações executadas e resultados;
- dúvidas ou riscos pendentes;
- próximo agente recomendado;
- gate necessário para prosseguir.
