Controle de Manutenção de Equipamentos

Sobre o projeto

O projeto Controle de Manutenção de Equipamentos tem como objetivo desenvolver uma aplicação web para o gerenciamento de solicitações de manutenção de equipamentos.

O sistema possui dois perfis de acesso:

Cliente

Funcionário

O cliente pode cadastrar solicitações de manutenção, acompanhar o andamento do serviço e consultar informações relacionadas às suas solicitações.

O funcionário pode visualizar solicitações, realizar orçamentos, registrar manutenções, redirecionar serviços e finalizar atendimentos.

Tecnologias utilizadas

Angular

TypeScript

HTML

CSS / Tailwind CSS

Java

Spring Boot

API REST

PostgreSQL

Git e GitHub

(mais coisas..)
Estrutura do projeto

Web-II-Equipamentos/
│
├── app-projeto/        # Front-end Angular
├── []         # Back-end Spring Boot
├── []         # Arquivos relacionados ao banco de dados
└── README.md

Funcionalidades

Entre as funcionalidades previstas no sistema estão:

Autocadastro de clientes;

Login de clientes e funcionários;

Cadastro de solicitações de manutenção;

Consulta das solicitações do cliente;

Orçamento de serviços;

Aprovação ou rejeição de orçamento;

Registro da manutenção realizada;

Redirecionamento de solicitações entre funcionários;

Finalização de serviços;

Gerenciamento de categorias;

Gerenciamento de funcionários;

Relatórios.

[] Indique quais dessas funcionalidades já estão implementadas.

Como executar o projeto

Pré-requisitos

Antes de executar o projeto, é necessário possuir instalado:

Node.js

npm

Angular CLI

Java JDK 17

PostgreSQL

Git

Clonar o repositório

git clone []
cd Web-II-Equipamentos

Executar o front-end

Entre na pasta do projeto Angular:

cd app-projeto

Instale as dependências:

npm install

Execute o projeto:

ng serve

Depois, acesse no navegador:

http://localhost:4200

Executar o back-end

[]

Informe aqui o nome da pasta do back-end e o comando realmente utilizado pela equipe para iniciar o Spring Boot.

Banco de dados

O projeto utiliza PostgreSQL.

[]

Adicione aqui:

nome do banco;

forma de criação do banco;

arquivo SQL utilizado, se houver;

configurações necessárias para conexão;

dados de teste que podem ser utilizados.

Não coloque senhas pessoais ou credenciais reais no README.

Rotas do front-end

[]

Liste somente as rotas que realmente existem no arquivo app.routes.ts.

Exemplo:

/                 Página inicial
/auth/login       Login
/auth/cadastro    Cadastro
/cliente          Área do cliente

Organização da equipe

[]

Adicione os integrantes da equipe e, se necessário, suas responsabilidades no projeto.

Controle de versão

O projeto utiliza Git e GitHub para controle de versão.

Antes de iniciar alterações, recomenda-se atualizar a branch utilizada pela equipe:

git pull

Para verificar os arquivos alterados:

git status