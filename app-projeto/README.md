# Web II - Equipamentos

Sistema de gerenciamento de solicitações de manutenção de equipamentos, desenvolvido para a disciplina de Desenvolvimento Web II.

O sistema permite que clientes registrem solicitações de manutenção e acompanhem o andamento do serviço, enquanto funcionários realizam orçamento, manutenção, redirecionamento, gerenciamento de cadastros e finalização das solicitações.

O projeto foi organizado utilizando componentes Angular separados por responsabilidade, com telas específicas para clientes, funcionários, solicitações, manutenção, categorias, relatórios e demais funcionalidades do sistema.

## Tecnologias

- **Frontend:** Angular 21
- **Linguagem:** TypeScript
- **Componentes visuais:** PrimeNG
- **Estilização:** Tailwind CSS
- **Backend:** Spring Boot
- **Banco de dados:** PostgreSQL
- **Ambiente:** Docker / WSL
- **Gerenciamento de dependências:** npm
- **Controle de versão:** Git e GitHub

## Funcionalidades

- Cadastro de clientes
- Login de usuários
- Área do cliente
- Área do funcionário
- Abertura de solicitações de manutenção
- Visualização das solicitações
- Controle dos estados das solicitações
- Orçamento de serviços
- Aprovação de orçamento
- Rejeição de orçamento
- Pagamento de serviços
- Efetuar manutenção
- Redirecionamento de manutenção
- Finalização de solicitações
- Gerenciamento de funcionários
- Gerenciamento de categorias de equipamentos
- Consulta de receitas por período
- Consulta de receitas por categoria

## Fluxo de uma solicitação

Uma solicitação de manutenção pode passar por diferentes estados durante seu processamento.

Os estados utilizados no projeto são:

- `ABERTA`
- `ORÇADA`
- `APROVADA`
- `REJEITADA`
- `REDIRECIONADA`
- `ARRUMADA`
- `PAGA`
- `FINALIZADA`

Uma nova solicitação é registrada inicialmente no estado `ABERTA`.

Quando um funcionário informa o valor do orçamento, a solicitação passa para o estado `ORÇADA`.

O cliente pode aprovar ou rejeitar o orçamento apresentado.

Quando o orçamento é aprovado, a solicitação passa para o estado `APROVADA`.

Caso seja rejeitado, a solicitação passa para o estado `REJEITADA`.

Uma solicitação aprovada pode seguir para a etapa de manutenção.

Caso seja necessário transferir o serviço para outro funcionário, a solicitação pode assumir o estado `REDIRECIONADA`.

Após a realização da manutenção, o serviço passa para o estado `ARRUMADA`.

Depois da confirmação do pagamento, a solicitação passa para o estado `PAGA`.

Ao término de todo o processo, a solicitação passa para o estado `FINALIZADA`.

## Perfil Cliente

O perfil de cliente possui funcionalidades relacionadas à abertura e ao acompanhamento das solicitações de manutenção.

O cliente pode registrar uma nova solicitação informando os dados do equipamento e o defeito apresentado.

As solicitações são apresentadas com informações como:

- Data e hora
- Descrição do equipamento
- Estado atual
- Ações disponíveis

Dependendo do estado da solicitação, diferentes ações podem ser apresentadas ao cliente.

O cliente também pode visualizar informações relacionadas ao orçamento e confirmar ações durante o fluxo do serviço.

## Perfil Funcionário

O funcionário possui acesso às solicitações que precisam de atendimento e às funções administrativas do sistema.

A área do funcionário permite visualizar e gerenciar as solicitações existentes.

A tela de visualização das solicitações disponibiliza filtros para:

- Todas as solicitações
- Solicitações do dia atual
- Solicitações dentro de um período de datas

As solicitações são apresentadas em ordem de data e hora.

Solicitações redirecionadas são exibidas de acordo com o funcionário responsável pelo atendimento.

As ações disponíveis também dependem do estado atual da solicitação.

## Orçamento

Solicitações no estado `ABERTA` podem receber um orçamento.

A tela permite que o funcionário visualize os dados da solicitação e informe o valor do serviço.

A rota utilizada para acessar a tela de orçamento é:

`/efetuar-orcamento/:id`

O identificador da solicitação é enviado pela URL para indicar qual serviço está sendo orçado.

Exemplo:

`/efetuar-orcamento/5`

Nesse caso, o orçamento está relacionado à solicitação de identificador 5.

## Manutenção

Solicitações aprovadas podem ser encaminhadas para a etapa de manutenção.

Nessa etapa podem ser informados dados como:

- Descrição da manutenção realizada
- Orientações para o cliente
- Funcionário responsável
- Data e hora da manutenção

A rota utilizada para acessar a tela de manutenção é:

`/manutencao`

Solicitações nos estados `APROVADA` e `REDIRECIONADA` podem acessar essa etapa a partir da área do funcionário.

## Redirecionamento de manutenção

Caso o funcionário responsável não possa realizar determinado serviço, a manutenção pode ser encaminhada para outro funcionário.

O redirecionamento permite selecionar outro funcionário como destino da solicitação.

O processo de redirecionamento deve manter informações como:

- Funcionário de origem
- Funcionário de destino
- Data e hora
- Estado da solicitação
- Histórico do redirecionamento

Após o redirecionamento, a solicitação passa para o estado `REDIRECIONADA`.

## Finalização de solicitação

Depois que o serviço é concluído e o pagamento é confirmado, a solicitação pode ser finalizada pelo funcionário.

A finalização representa o encerramento do fluxo de atendimento.

Após a finalização, a solicitação passa para o estado:

`FINALIZADA`

## Gerenciamento de categorias

O sistema possui uma área responsável pelo gerenciamento das categorias dos equipamentos.

A rota utilizada é:

`/funcionario/categorias`

Entre as categorias utilizadas nos dados iniciais estão:

- Notebook
- Desktop
- Impressora
- Mouse
- Teclado

O gerenciamento de categorias permite:

- Listar categorias
- Cadastrar novas categorias
- Editar categorias existentes
- Desativar categorias
- Ativar categorias

A desativação é utilizada no lugar da exclusão definitiva dos registros.

## Gerenciamento de funcionários

O sistema possui uma tela específica para gerenciamento de funcionários.

A rota utilizada é:

`/funcionario/lista-funcionarios`

Cada funcionário possui informações como:

- Nome
- E-mail
- Data de nascimento
- Senha
- Situação ativa ou inativa

A interface permite:

- Listar funcionários
- Cadastrar funcionários
- Editar funcionários
- Desativar funcionários
- Reativar funcionários

O sistema também verifica regras relacionadas à desativação dos funcionários.

## Relatórios de receitas

O perfil funcionário possui acesso às telas relacionadas às receitas obtidas pela empresa.

A seleção dos relatórios é realizada através da opção de receitas presente na área do funcionário.

Ao selecionar a opção de receitas, o usuário pode escolher entre:

- Receita por período
- Receita por categoria

## Receita por período

O relatório de receita por período permite informar:

- Data inicial
- Data final

As duas datas podem ser utilizadas para limitar o período apresentado.

Os resultados são agrupados por dia.

A tela apresenta informações como:

- Data
- Quantidade de serviços
- Receita obtida
- Receita total

A rota utilizada é:

`/funcionario/receitas/periodo`

## Receita por categoria

O relatório por categoria apresenta a receita acumulada agrupada de acordo com a categoria do equipamento.

A tela apresenta informações como:

- Categoria do equipamento
- Quantidade de serviços
- Receita obtida
- Receita total

A rota utilizada é:

`/funcionario/receitas/categoria`

Entre as categorias apresentadas estão:

- Notebook
- Desktop
- Impressora
- Mouse
- Teclado

No estágio atual do protótipo, os relatórios podem utilizar dados fictícios para demonstração das telas.

A geração definitiva dos relatórios em PDF será integrada conforme a evolução do projeto.

## Rotas principais

As principais rotas disponíveis no projeto são:

`/auth/login` - Login

`/auth/cadastro` - Cadastro de cliente

`/cliente` - Área do cliente

`/funcionario` - Área do funcionário

`/funcionario/categorias` - Gerenciamento de categorias

`/funcionario/lista-funcionarios` - Gerenciamento de funcionários

`/funcionario/login-funcionario` - Página inicial do funcionário

`/funcionario/receitas/periodo` - Relatório de receita por período

`/funcionario/receitas/categoria` - Relatório de receita por categoria

`/efetuar-orcamento/:id` - Efetuar orçamento

`/manutencao` - Efetuar manutenção

## Organização do projeto

A aplicação Angular está localizada na pasta:

`app-projeto/`

A estrutura principal da aplicação está organizada da seguinte forma:

```text
app-projeto/
└── src/
    └── app/
        ├── auth/
        │   ├── cadastro/
        │   ├── err/
        │   └── login/
        │
        ├── cliente/
        │   ├── cliente-orcamento/
        │   └── cliente-solicitacao/
        │
        ├── efetuar-orcamento/
        │
        ├── funcionario/
        │   ├── categorias/
        │   ├── lista-funcionarios/
        │   ├── login-funcionario/
        │   ├── manutencao/
        │   ├── relatorio-categorias/
        │   ├── relatorio-periodo/
        │   └── solicitacoes/
        │
        └── shared/
            ├── models/
            └── services/
```

## Models compartilhados

A pasta `shared/models` contém estruturas de dados utilizadas em diferentes partes da aplicação.

Os models ajudam a manter uma representação padronizada dos dados utilizados pelos componentes.

Entre os dados utilizados pelo sistema estão:

- Cliente
- Endereço
- Funcionário
- Solicitação
- Estado da solicitação
- Histórico da solicitação

O histórico permite representar as alterações ocorridas durante o processo de manutenção.

## Services compartilhados

A pasta `shared/services` contém serviços utilizados por diferentes componentes.

O serviço de solicitações é utilizado para centralizar operações relacionadas às solicitações durante o desenvolvimento do protótipo.

A utilização de services permite separar a lógica relacionada aos dados da lógica presente nas telas.

Também existe integração relacionada ao preenchimento automático de endereço através do CEP.

## ViaCEP

O cadastro de clientes possui integração com a API ViaCEP.

A consulta é realizada utilizando o CEP informado pelo usuário.

O objetivo é auxiliar no preenchimento automático dos dados de endereço.

Mesmo utilizando o preenchimento automático, os dados completos do endereço fazem parte do cadastro do cliente.

## Docker

O repositório possui arquivos de configuração para utilização de Docker.

Entre os arquivos utilizados estão:

- `Dockerfile`
- `docker-compose.yml`

O ambiente Docker permite organizar os serviços utilizados pelo projeto.

O banco de dados utilizado pelo projeto é PostgreSQL.

A porta normalmente utilizada pelo PostgreSQL é:

`5432`

A aplicação Angular utiliza normalmente:

`4200`

A API Spring Boot utiliza normalmente:

`8080`

## Como rodar o projeto

### Pré-requisitos

Para executar o projeto é necessário possuir:

- Node.js
- npm
- Angular CLI
- Git
- Docker, caso seja utilizado o ambiente com containers

Para instalar o Angular CLI globalmente:

```bash
npm install -g @angular/cli
```

## Instalação

Entre na pasta da aplicação:

```bash
cd app-projeto
```

Instale as dependências:

```bash
npm install
```

## Servidor de desenvolvimento

Execute:

```bash
ng serve
```

Depois acesse no navegador:

`http://localhost:4200/`

A aplicação recarrega automaticamente quando alterações são realizadas e salvas durante o desenvolvimento.

## Build de produção

Para gerar uma versão de produção:

```bash
ng build
```

O Angular realizará a compilação da aplicação e criará os arquivos necessários para distribuição.

## Verificação do projeto

Antes de enviar alterações para o repositório, é recomendado executar:

```bash
ng serve
```

É importante verificar se o projeto compila sem erros.

Também devem ser testadas manualmente as telas e rotas relacionadas às alterações realizadas.

## Git

Para verificar os arquivos modificados:

```bash
git status
```

Para verificar a branch atual:

```bash
git branch
```

Para atualizar o repositório local:

```bash
git pull origin master
```

Antes de enviar alterações, a equipe deve verificar se o código local está sincronizado com o repositório remoto.

## Status atual

O projeto encontra-se em desenvolvimento.

As funcionalidades estão sendo implementadas de forma incremental de acordo com os requisitos definidos para o sistema.

Algumas partes da aplicação ainda utilizam dados fictícios para demonstração do protótipo.

A integração completa entre frontend, backend e banco de dados será realizada durante as próximas etapas do desenvolvimento.

## Equipe 7

| RA | Nome |
|---|---|
| GRR20250215 | Paulo Roberto Rocha Wojciski |
| GRR20254293 | João Guilherme Terlecki Pereira |
| GRR20254788 | Thales Cercal |
| GRR20253136 | Fabricio Renan Plautz |
| GRR20254201 | Fernando Augusto Bueno Canquerini |
| GRR20251192 | Matheus Gabriel Lino e Silva |