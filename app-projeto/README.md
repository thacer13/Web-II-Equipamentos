# Manutenção de Equipamentos

Sistema de controle de manutenção de equipamentos desenvolvido para a disciplina de
Desenvolvimento WEB-II (UFPR - SEPT - TADS). O sistema gerencia solicitações de serviço,
desde a abertura pelo cliente até a finalização pelo funcionário, mantendo o histórico
completo de cada alteração de estado.

## Perfis de acesso

- **Cliente**: abre solicitações, acompanha status, aprova/rejeita orçamentos e paga serviços.
- **Funcionário**: efetua orçamentos, realiza manutenções, redireciona solicitações e gera relatórios.

## Funcionalidades principais

- Autocadastro de clientes com preenchimento automático de endereço via API ViaCEP
- Login unificado (cliente/funcionário identificados automaticamente)
- Fluxo completo de solicitação: aberta → orçada → aprovada/rejeitada → arrumada → paga → finalizada
- Histórico de todas as mudanças de estado, com data/hora e responsável
- Redirecionamento de manutenção entre funcionários
- CRUD de categorias de equipamento e de funcionários
- Relatórios de receita em PDF (por período e por categoria)

## Tecnologias

**Front-end**
- Angular 17+ (componentes standalone)
- Tailwind CSS
- PrimeNG

**Back-end**
- Spring Boot
- API REST
- Banco de dados relacional (PostgreSQL)

## Como rodar o projeto

### Pré-requisitos
- Node.js e Angular CLI
- Java 17+ e Maven
- PostgreSQL

### Front-end
```bash
cd frontend
npm install
ng serve
```
Acesse em `http://localhost:4200`

### Back-end
```bash
cd backend
mvn spring-boot:run
```
API disponível em `http://localhost:8080`

## Estrutura do repositório

```
├── frontend/     # Aplicação Angular
├── backend/      # API Spring Boot
└── docs/         # Documentação e suposições do projeto
```