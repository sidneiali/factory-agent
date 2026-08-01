# Estudo para uma fábrica de software multiagente baseada no Reversa

## 1. Objetivo

Este documento analisa o clone local do projeto [sandeco/reversa](https://github.com/sandeco/reversa) e propõe como reutilizar seus padrões para construir uma ferramenta focada no ciclo completo de criação e manutenção de software.

A ferramenta proposta deve receber uma ideia ou necessidade e coordenar agentes especializados para produzir requisitos, arquitetura, planejamento, código, testes, entrega, suporte e correções, com estado persistente, rastreabilidade e aprovações humanas.

## 2. Base analisada

- Repositório: `https://github.com/sandeco/reversa.git`
- Clone local: `reversa/`
- Branch verificada: `main`
- Commit analisado: `4f574679399b7b4e567ba751baee3ac6849f7872`
- Versão declarada no pacote: `1.2.57`
- Runtime: Node.js `>=18.20.2`
- Licença: MIT

Esta análise foi feita a partir do código, templates, skills e documentação presentes no clone local. Não representa uma auditoria de segurança completa nem valida todos os fluxos em todas as engines suportadas.

## 3. Conclusão principal

O Reversa não é apenas uma ferramenta de engenharia reversa. O repositório já contém uma base considerável para projetos novos e evolução de software:

- `/reversa-new`: transforma uma ideia em ideação, personas, PRD e specs SDD;
- `/reversa-forward`: conduz requisitos, esclarecimento, plano, tarefas, auditoria, código e sincronização;
- `/reversa-coding`: executa tarefas e mantém progresso e impactos;
- `/reversa-debugger` e `/reversa-debugger-fix`: registram, investigam e corrigem defeitos;
- agentes de qualidade: refatoração, modularização, desacoplamento, otimização, simplificação, padronização e remoção de código morto;
- time de documentação e agentes de migração.

Portanto, o caminho mais eficiente não é reconstruir tudo do zero. A recomendação é criar um produto derivado conceitualmente dessa arquitetura, colocando o fluxo **greenfield e de entrega contínua** no centro e removendo o acoplamento semântico à engenharia reversa.

## 4. Como o Reversa funciona

### 4.1 Instalador fino, inteligência nas skills

A CLI em `reversa/bin/reversa.js` apenas distribui comandos como `install`, `update`, `status`, `uninstall`, `add-agent` e `add-engine`.

O instalador:

1. detecta engines de IA disponíveis;
2. pergunta quais agentes serão instalados;
3. copia skills para os diretórios esperados por cada engine;
4. cria o arquivo de entrada da engine;
5. cria estado, configuração, templates e manifestos;
6. registra hashes SHA-256 para atualizações seguras.

A inteligência dos workflows não está implementada como um backend de agentes em Node.js. Ela está majoritariamente descrita em arquivos `SKILL.md`, interpretados pela engine hospedeira, como Claude Code, Codex, Cursor ou Gemini CLI.

Consequências desse modelo:

- o pacote não precisa armazenar chaves de LLM;
- o produto aproveita a engine já instalada;
- cada agente é portável e auditável como texto;
- a qualidade do cumprimento do protocolo depende da engine hospedeira;
- não há, no núcleo verificado, um scheduler próprio garantindo concorrência, isolamento ou limites de custo.

### 4.2 Instalação em múltiplas engines

`reversa/lib/installer/detector.js` mantém um catálogo de engines, seus arquivos de entrada e seus diretórios de skills. Entre as engines previstas estão Claude Code, Codex, Cursor, Gemini CLI, Windsurf, Kiro, Opencode, Cline, Roo Code, GitHub Copilot, Aider e Amazon Q.

Esse padrão deve ser preservado: o domínio dos agentes não deve depender de uma engine específica.

### 4.3 Estado persistente e retomada

O template `reversa/templates/state.json` guarda:

- versão;
- projeto e usuário;
- idiomas;
- modo de resposta;
- pastas de saída;
- fase atual;
- etapas concluídas e pendentes;
- checkpoints;
- engines e agentes instalados;
- arquivos criados.

Skills específicas acrescentam estados de workflow, como `newproject_progress`. Os artefatos físicos também são usados para determinar o estágio real. Em `/reversa-forward`, por exemplo, a presença de `requirements.md`, `roadmap.md` e `actions.md`, além dos checkboxes das ações, determina o próximo agente.

Essa combinação é valiosa:

- estado JSON para preferências e checkpoints;
- arquivos Markdown para contratos legíveis;
- estado físico dos artefatos para evitar confiar apenas em metadados possivelmente desatualizados.

### 4.4 Segurança de escrita

`reversa/lib/installer/policy.js` centraliza as pastas graváveis. O `Writer` evita sobrescrever arquivos durante a instalação, registra arquivos criados e gera um manifesto de hashes.

A política original protege o legado. Para uma fábrica de software, ela deve evoluir para uma política por fase:

- agentes de produto e arquitetura escrevem somente nos artefatos de projeto;
- desenvolvimento pode alterar apenas arquivos previstos no plano aprovado;
- QA escreve testes e relatórios dentro do escopo aprovado;
- operações destrutivas, publicação e deploy exigem gate explícito;
- suporte é somente leitura até um incidente ser convertido em tarefa ou bug aprovado.

### 4.5 Pipeline greenfield existente

O agente `reversa-new` já implementa dois modos:

- **guiado:** pausa entre agentes e exige `CONTINUAR`;
- **expresso:** concentra perguntas em uma entrevista e segue até o código.

Fluxo verificado:

```text
Ideator
  → Researcher
  → Drafter
  → Spec SDD
  → Requirements
  → Plan
  → To-Do
  → Coding
```

Os artefatos incluem brief, ideação, personas, PRD, specs SDD, requisitos, roadmap, investigação, ações e progresso.

### 4.6 Evolução por feature

O `reversa-forward` atua como roteador e não como executor. Ele detecta o estado físico da feature e indica o próximo skill:

```text
requirements
  → clarify?
  → plan
  → to-do
  → audit?
  → quality?
  → coding
  → add?
  → sync?
```

Esse padrão separa bem:

- orquestração;
- produção de artefatos;
- implementação;
- auditoria;
- convergência da documentação.

### 4.7 Desenvolvimento rastreável

O `reversa-coding` consome `actions.md`, respeita dependências, marca ações concluídas e grava `progress.jsonl` em formato append-only.

Também produz:

- `legacy-impact.md`, com arquivos e componentes afetados;
- `regression-watch.md`, com comportamentos que precisam permanecer verdadeiros.

Em greenfield, o agente usa PRD e specs SDD como âncora. Isso já atende parcialmente ao produto proposto.

### 4.8 Correção de bugs com gates

O `reversa-debugger-fix` define um processo robusto:

1. seleção do bug;
2. mitigação, quando necessária;
3. reprodução e coleta de evidência;
4. causa raiz com estado epistemológico;
5. avaliação do risco;
6. plano visual antes de alterar código;
7. gate para testes falhando;
8. gate para o change set;
9. prova de testes passando;
10. veredito sobre impacto nas specs;
11. fechamento segundo política definida.

É um dos componentes mais reutilizáveis para a futura ferramenta.

## 5. Lacunas em relação à fábrica de software desejada

Mesmo com os fluxos existentes, há lacunas para transformar o projeto em uma plataforma centrada em criação de aplicações:

1. **Identidade do produto:** nomes, pastas e contratos ainda são orientados ao Reversa e ao legado.
2. **Arquiteto greenfield dedicado:** arquitetura aparece em specs e planejamento, mas o ciclo novo precisa de uma etapa explícita para decisões arquiteturais, C4, ADRs, dados, APIs e atributos de qualidade.
3. **QA como gate obrigatório:** auditoria e qualidade são opcionais no caminho feliz; para entrega de software, testes e critérios de aceite devem formar um gate formal.
4. **Entrega e DevOps:** falta um ciclo central explícito de build, empacotamento, CI, ambientes, release e deploy.
5. **Suporte operacional:** bugs são bem cobertos, mas falta intake de suporte, base de conhecimento, incidentes, problemas e solicitações de serviço.
6. **Observabilidade:** faltam contratos centrais para logs, métricas, traces, SLOs e verificação pós-entrega.
7. **Governança de custo:** as skills mencionam custo em debates, mas não há um orçamento global verificado para tokens, tempo e tentativas.
8. **Execução isolada:** o modelo depende das ferramentas da engine hospedeira; uma versão mais segura deve oferecer sandbox ou container opcional.
9. **Concorrência determinística:** marcações de paralelismo aparecem no planejamento, mas não foi verificado um executor próprio que garanta execução paralela e reconciliação de resultados.
10. **Contratos estruturados:** muitos acordos vivem apenas em Markdown; dados críticos também deveriam ter schemas JSON validados.

## 6. Produto proposto

Nome provisório: **Software Factory Agent**.

### 6.1 Princípios

1. Specification-driven development.
2. Humano no controle de decisões irreversíveis.
3. Estado persistente e retomável.
4. Artefatos legíveis e versionáveis.
5. Evidência antes de conclusão.
6. Separação entre propor, aprovar e executar.
7. Agentes independentes da engine.
8. Menor privilégio para arquivos e comandos.
9. Rastreabilidade ponta a ponta.
10. Nenhum agente declara sucesso sem validação registrada.

### 6.2 Times e agentes

#### Orquestração

- **Factory Orchestrator:** detecta estado, roteia tarefas, mantém checkpoints e gates.
- **Project Manager:** organiza backlog, dependências, riscos, marcos e releases.

#### Produto e requisitos

- **Discovery:** transforma a ideia em problema, resultado esperado e restrições.
- **Requirements Engineer:** cria requisitos funcionais e não funcionais.
- **Product Analyst:** personas, jornadas, métricas e priorização.
- **Clarifier:** resolve ambiguidades e registra premissas.

#### Arquitetura

- **Software Architect:** arquitetura, componentes, integrações e atributos de qualidade.
- **Data Architect:** modelo de dados, migrações, retenção e privacidade.
- **API Designer:** contratos externos, versionamento e compatibilidade.
- **Security Architect:** ameaças, controles e requisitos de segurança.

#### Construção

- **Technical Planner:** converte arquitetura em roadmap e tarefas atômicas.
- **Developer:** implementa ações aprovadas.
- **Code Reviewer:** revisa correção, legibilidade e aderência à arquitetura.
- **Refactor Agent:** melhora estrutura sem mudança intencional de comportamento.

#### Qualidade

- **QA Analyst:** estratégia, cenários e critérios de aceite.
- **Test Engineer:** testes unitários, integração, contrato e ponta a ponta.
- **Security Tester:** análise estática, dependências e testes de segurança autorizados.
- **Acceptance Agent:** valida requisitos contra evidências de execução.

#### Entrega e operação

- **DevOps:** build, CI, containers e configuração de ambientes.
- **Release Manager:** versão, changelog, pacote e aprovação da entrega.
- **Observability Agent:** logs, métricas, traces, dashboards e alertas.
- **Documentation Agent:** documentação técnica, operacional e de usuário.

#### Manutenção

- **Support Agent:** intake, classificação e respostas baseadas em evidências.
- **Incident Agent:** mitigação, timeline e comunicação.
- **Bug Triage:** registro, deduplicação, severidade e rastreabilidade.
- **Bug Fix:** reprodução, causa raiz, testes e correção aprovada.
- **Problem Manager:** identifica causas recorrentes e ações preventivas.

### 6.3 Workflow principal

```text
INTAKE
  → DISCOVERY
  → REQUIREMENTS
  → ARCHITECTURE
  → PLANNING
  → IMPLEMENTATION
  → CODE_REVIEW
  → QA
  → ACCEPTANCE
  → RELEASE
  → OPERATIONS
  → SUPPORT / INCIDENT / BUG_FIX
```

Retornos controlados devem ser permitidos. Exemplo: QA pode devolver para implementação, mas deve registrar motivo, evidência, responsável e novo checkpoint.

### 6.4 Gates mínimos

| Gate | Condição para avançar |
|---|---|
| Requisitos | Critérios de aceite, escopo e dúvidas registrados |
| Arquitetura | Decisões, riscos e contratos aprovados |
| Planejamento | Tarefas testáveis, dependências e arquivos previstos |
| Implementação | Código e testes focados executados |
| Revisão | Sem bloqueios críticos abertos |
| QA | Critérios de aceite comprovados por evidência |
| Release | Build reproduzível, changelog e rollback definidos |
| Deploy | Aprovação explícita e ambiente identificado |
| Bug fix | Reprodução vermelho → correção → regressão verde |

## 7. Estrutura sugerida

```text
.factory/
├── state.json
├── config.toml
├── config.user.toml
├── active-work.json
├── policies/
│   ├── filesystem.json
│   ├── commands.json
│   └── approvals.json
├── context/
├── checkpoints/
├── manifests/
└── logs/

_factory_product/
├── brief.md
├── vision.md
├── personas.md
├── prd.md
├── requirements/
├── architecture/
├── adrs/
├── data/
├── interfaces/
├── risks/
└── traceability/

_factory_delivery/
└── <feature-id>/
    ├── requirements.md
    ├── architecture-delta.md
    ├── test-strategy.md
    ├── roadmap.md
    ├── actions.md
    ├── progress.jsonl
    ├── review.md
    ├── qa-report.md
    ├── release.md
    └── evidence/

_factory_operations/
├── support/
├── incidents/
├── bugs/
├── problems/
└── knowledge-base/
```

## 8. Arquitetura técnica recomendada

### 8.1 Primeira versão

Manter o padrão comprovado do clone:

- CLI Node.js;
- skills Markdown independentes da engine;
- JSON para estado e eventos;
- TOML para configuração;
- Markdown para artefatos humanos;
- schemas JSON para contratos críticos;
- hashes SHA-256 para detectar customizações;
- Git como trilha de mudanças.

### 8.2 Componentes da CLI

```text
CLI
├── Engine Detector
├── Installer
├── Skill Registry
├── Policy Engine
├── State Validator
├── Artifact Validator
├── Manifest Manager
├── Status Reporter
└── Update/Uninstall Manager
```

A CLI não precisa chamar LLM diretamente no MVP. Isso preserva a compatibilidade com o modelo do Reversa e evita armazenar credenciais. Uma API própria de modelos pode ser considerada depois, quando houver necessidade comprovada de scheduler, custos centralizados e execução remota.

### 8.3 Estado e eventos

Além do snapshot em `state.json`, recomenda-se um log append-only:

```json
{"ts":"2026-08-01T15:00:00Z","run":"RUN-001","agent":"requirements","work":"FEAT-001","event":"completed","artifacts":["requirements.md"],"evidence":["validation.json"]}
```

O snapshot facilita retomada; o log permite auditoria e reconstrução do histórico.

### 8.4 Contrato de um agente

Cada skill deve declarar:

- identidade e responsabilidade;
- entradas obrigatórias;
- arquivos permitidos para leitura;
- arquivos permitidos para escrita;
- comandos permitidos;
- artefatos de saída;
- validações obrigatórias;
- condições de parada;
- próximo agente possível;
- regras de retomada;
- consumo máximo configurável;
- formato do relatório final.

## 9. Estratégia de reaproveitamento

### Reutilizar quase diretamente

- detector de engines;
- instalador e distribuição de skills;
- writer não destrutivo;
- manifesto SHA-256;
- estado persistente;
- modo guiado e expresso;
- detecção de estágio por artefatos;
- `actions.md` e `progress.jsonl`;
- processo de bug fix com gates;
- padrões de update e uninstall;
- compatibilidade multi-engine.

### Adaptar

- `reversa-new` para ser o fluxo principal;
- `reversa-forward` para incluir arquitetura, QA, aceite e release obrigatórios;
- `reversa-coding` para trabalhar com uma allowlist de arquivos aprovada;
- política de escrita para diferenciar papéis;
- state schema para projetos, features, releases, incidentes e suporte;
- nomenclatura e diretórios, removendo o foco em legado.

### Não levar ao MVP

- discovery reverso completo;
- migração de sistemas legados;
- pricing;
- documentação visual 3D;
- tradutores específicos, como N8N;
- debate multiagente externo;
- execução distribuída.

Esses módulos podem voltar como plugins depois que o ciclo principal estiver estável.

## 10. MVP proposto

### Fase 1 — Fundação

- CLI instalável;
- detecção de engines;
- instalação e atualização segura de skills;
- estado validado por schema;
- política central de arquivos e comandos;
- status e retomada.

### Fase 2 — Da ideia ao plano

- orquestrador;
- discovery;
- requisitos;
- arquiteto;
- planejador;
- gates de aprovação;
- artefatos de produto e arquitetura.

### Fase 3 — Do plano ao código

- desenvolvedor;
- revisor;
- QA;
- execução de testes;
- evidências e rastreabilidade;
- loop controlado de correção.

### Fase 4 — Entrega e manutenção

- release;
- documentação;
- suporte;
- triagem de bugs;
- bug fix com vermelho → verde;
- incidentes básicos.

## 11. Critérios de sucesso do MVP

1. Uma ideia curta resulta em PRD, requisitos e arquitetura aprováveis.
2. O plano possui ações atômicas e dependências verificáveis.
3. O agente de desenvolvimento implementa apenas o escopo aprovado.
4. QA demonstra os critérios de aceite com comandos e resultados registrados.
5. Uma sessão interrompida pode ser retomada sem repetir etapas concluídas.
6. Nenhum deploy, push, exclusão ou instalação ocorre sem autorização explícita.
7. Um bug pode ser registrado, reproduzido, corrigido e fechado com rastreabilidade.
8. Cada requisito pode ser relacionado a arquitetura, tarefa, código, teste e entrega.
9. Customizações locais de skills não são sobrescritas por atualização.
10. O fluxo funciona em pelo menos Claude Code e Codex antes de ampliar engines.

## 12. Riscos e decisões pendentes

### Riscos

- instruções em Markdown podem ser interpretadas de forma diferente entre engines;
- workflows longos podem exceder contexto;
- estado JSON e artefatos físicos podem divergir;
- agentes podem executar comandos além da intenção se a política não for aplicada tecnicamente;
- modo expresso reduz controle humano;
- rastreabilidade pode virar burocracia se os templates forem excessivos.

### Decisões antes da implementação

1. Criar projeto independente ou fazer fork do Reversa?
2. Qual será o nome definitivo?
3. O MVP suportará somente CLI ou também interface web?
4. Quais engines entram na primeira versão?
5. QA será sempre obrigatório ou configurável por nível de risco?
6. A execução de código será local, em container ou selecionável?
7. Quais comandos exigirão aprovação independentemente do modo?
8. Artefatos gerados serão versionados por padrão?

## 13. Recomendação final

Criar um projeto independente, preservando a licença e atribuições aplicáveis, e usar o clone como referência arquitetural. O primeiro incremento deve adaptar o instalador, o estado, o orquestrador greenfield, o ciclo forward e o bug fix.

A diferenciação do novo produto deve estar em quatro pontos:

1. arquitetura greenfield explícita;
2. QA e aceite como gates de primeira classe;
3. entrega, operação e suporte integrados;
4. políticas tecnicamente verificáveis, não apenas instruções textuais.

O Reversa demonstra que a abordagem de **skills portáveis + estado em arquivos + artefatos operacionais + gates humanos** é viável. A nova ferramenta pode partir desse núcleo e reorganizá-lo como uma fábrica de software completa, em vez de uma plataforma centrada na extração de conhecimento legado.

## 14. Evidências consultadas

- `reversa/README.md`
- `reversa/package.json`
- `reversa/bin/reversa.js`
- `reversa/lib/commands/install.js`
- `reversa/lib/installer/detector.js`
- `reversa/lib/installer/writer.js`
- `reversa/lib/installer/manifest.js`
- `reversa/lib/installer/policy.js`
- `reversa/templates/state.json`
- `reversa/templates/config.toml`
- `reversa/agents/reversa-new/SKILL.md`
- `reversa/agents/reversa-forward/SKILL.md`
- `reversa/agents/reversa-coding/SKILL.md`
- `reversa/agents/reversa-debugger-fix/SKILL.md`
