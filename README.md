# Sistema de Manutenção de Equipamentos

## Visão geral

Este projeto implementa um sistema web para gestão de solicitações de manutenção de equipamentos, com foco em dois perfis de usuários: cliente e funcionário.

O objetivo principal é permitir que clientes registrem solicitações de manutenção, acompanhem o andamento do serviço e paguem o orçamento aprovado, enquanto funcionários gerenciam orçamentos, manutenção, redirecionamento, categorias, funcionários e relatórios financeiros.

A solução está separada em frontend, backend e persistência:

- Frontend em Angular
- Backend em Spring Boot
- Banco de dados PostgreSQL
- Infraestrutura para execução em Docker/Compose

## Contexto e requisitos do projeto

O sistema foi planejado conforme os requisitos da disciplina de Desenvolvimento Web II e contempla o fluxo completo de atendimento para reparos e manutenção de equipamentos.

### Perfis de usuário

#### Cliente
- Realiza cadastro e login
- Acessa sua área pessoal
- Abre solicitações de manutenção
- Visualiza o status da solicitação
- Aprova ou rejeita orçamento
- Efetua pagamento quando necessário
- Acompanha o histórico da manutenção

#### Funcionário
- Acessa painel administrativo
- Visualiza solicitações em fila
- Registra orçamentos
- Realiza manutenção do equipamento
- Redireciona a solicitação para outro funcionário
- Finaliza o atendimento
- Administra categorias e funcionários
- Consulta relatórios de receitas por período e por categoria

## Fluxo de negócio

Uma solicitação passa pelos seguintes estados principais:

- ABERTA
- ORÇADA
- APROVADA
- REJEITADA
- REDIRECIONADA
- ARRUMADA
- PAGA
- FINALIZADA

### Fluxo principal

1. O cliente abre uma solicitação informando equipamento e defeito.
2. O funcionário emite um orçamento.
3. O cliente aprova ou rejeita o orçamento.
4. Se aprovado, o serviço segue para manutenção.
5. O funcionário responsável executa a manutenção.
6. Caso necessário, a solicitação pode ser redirecionada para outro funcionário.
7. O cliente realiza o pagamento das despesas.
8. O funcionário finaliza a solicitação.

## Regras de negócio e critérios relevantes

Algumas regras seguem o contrato de API e as suposições do projeto:

- O cliente só pode acessar e alterar suas próprias solicitações.
- Funcionários só podem atuar sobre solicitações permitidas pelo perfil e pela responsabilidade atual.
- Categorias são desativadas em vez de removidas permanentemente.
- O valor do orçamento precisa ser maior que zero.
- O motivo da rejeição é obrigatório.
- O histórico de transições da solicitação deve ser registrado em transação com a mudança de estado.
- O banco registra as datas e horas no servidor, não no navegador.
- A autenticação mantém a identificação do usuário na sessão HTTP.

## Arquitetura do sistema

### Frontend

Local: `app-projeto/`

- Angular 21
- TypeScript
- PrimeNG
- Tailwind CSS
- Rotas por perfil
- Componentes específicos para cliente, funcionário, manutenção e relatórios

### Backend

Local: `webprojeto/`

- Spring Boot 4.1.2
- Java 17
- Spring Web MVC
- Spring Security
- Spring JDBC (`JdbcTemplate`) para PostgreSQL
- APIs REST para autenticação, categorias, funcionários, solicitações e relatórios

### Banco de dados

- PostgreSQL
- Estrutura de tabelas para clientes, funcionários, categorias, solicitações, histórico e relatórios
- Scripts SQL de schema e dados iniciais em `webprojeto/src/main/resources/`

### Infraestrutura

- Docker Compose para banco e ambiente de execução
- Container para aplicação completa com Angular e Spring Boot

## Estrutura do repositório

```text
.
├── app-projeto/             # Frontend Angular
├── webprojeto/              # Backend Spring Boot
├── docs/                    # Documentação complementar
├── docker-compose.yml       # Infraestrutura do projeto
├── Dockerfile               # Ambiente de execução
├── README.md                # Documentação principal do projeto
├── LICENSE                  # Licença
└── scripts/                 # Scripts auxiliares
```

## Documentação do projeto

A documentação específica do sistema está organizada em arquivos dedicados:

- [`docs/como-executar.md`](docs/como-executar.md) — instruções de execução
- [`docs/contratos-api.md`](docs/contratos-api.md) — contratos e regras de transição da API
- [`docs/suposicoes.md`](docs/suposicoes.md) e [`docs/suposicoes.odt`](docs/suposicoes.odt) — decisões de negócio e suposições
- [`docs/integrantes.txt`](docs/integrantes.txt) — integrantes, GRRs e e-mails (conferir preenchimento antes de entregar)
- [`docs/validacao.md`](docs/validacao.md) — evidências de compilação e validações pendentes
- [`app-projeto/README.md`](app-projeto/README.md) — visão do frontend e do fluxo da aplicação

## Como executar o projeto

A execução sem Docker é suportada e foi a alternativa escolhida para os testes locais. São necessários Java 17, Node.js 24, npm e PostgreSQL funcionando. O banco padrão é `manutencao_db` e a API utiliza a porta 8080.

Para iniciar o sistema e preparar um banco **de testes**, veja o passo a passo completo em [`docs/como-executar.md`](docs/como-executar.md). O documento também explica como configurar variáveis de ambiente sem expor senhas e como executar a alternativa opcional com Docker.

Endereços padrão:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080/api`

## Dados de teste e ambiente padrão

O projeto já inclui dados iniciais e credenciais de teste para validação rápida, com usuários de cliente e funcionário.

Exemplos de usuários cadastrados:

- Funcionário: `maria.funcionario@example.com`, `mario.funcionario@example.com`
- Cliente: `joao.cliente@example.com`, `jose.cliente@example.com`, `joana.cliente@example.com`, `joaquina.cliente@example.com`

A senha padrão para contas de teste é:

- `1234`

## Funcionalidades principais

- Cadastro de clientes
- Login e sessão por perfil
- Abertura e acompanhamento de solicitações
- Orçamento de serviços
- Aprovação e rejeição de orçamento
- Manutenção e redirecionamento
- Pagamento do serviço
- Finalização do atendimento
- Gestão de categorias
- Gestão de funcionários
- Relatórios de receitas por período e por categoria

## Validação e testes

Em 11/11/2026, a equipe executou `mvnw.cmd clean test`, com **118 testes Java aprovados e nenhuma falha**, e os builds Angular de desenvolvimento e produção, ambos concluídos. Essas verificações **não comprovam os testes completos de interface e banco**, que precisam ser realizados com a aplicação em execução no Firefox.

A relação dos testes efetuados, verificações pendentes e precauções está em [`docs/validacao.md`](docs/validacao.md). A integridade dos registros de histórico pode ser conferida pelo script [`docs/verificar-integridade.sql`](docs/verificar-integridade.sql) em um banco de testes funcional.

## Observações finais

Este projeto representa um sistema completo de manutenção de equipamentos com regras de negócio bem definidas, controle de acessos por perfil e fluxo de operação voltado à operação real de uma assistência técnica ou empresa de manutenção.

A estrutura adotada mantém separação clara entre cliente, funcionário, backend e banco de dados, permitindo evolutividade, manutenção e integração com novos módulos.
