# Web II - Equipamentos

Sistema de gerenciamento de solicitações de manutenção de equipamentos, desenvolvido para a disciplina de Web II. Permite que clientes abram solicitações de reparo e que funcionários gerenciem todo o fluxo: orçamento, aprovação, manutenção, redirecionamento e finalização.

## Tecnologias

- **Frontend:** Angular 21 + PrimeNG + Tailwind CSS
- **Backend:** Spring Boot
- **Ambiente:** Docker / WSL

## Funcionalidades

- Cadastro e login de clientes e funcionários
- Abertura de solicitações de manutenção
- Orçamento e aprovação/rejeição pelo cliente
- Efetuar manutenção (RF014): descrição do serviço, orientações ao cliente, registro de data/hora e funcionário responsável
- Redirecionar manutenção para outro funcionário (RF015), com histórico de redirecionamentos
- Gerenciamento de funcionários (cadastro, edição, ativação/desativação)
- Gerenciamento de categorias de equipamentos
- Relatórios por categoria e por período

## Como rodar o projeto

### Pré-requisitos

- Node.js e npm
- Angular CLI (`npm install -g @angular/cli`)
- Docker (caso rode em container)

### Instalação

```bash
cd app-projeto
npm install
```

### Servidor de desenvolvimento

```bash
ng serve
```

Acesse `http://localhost:4200/`. A aplicação recarrega automaticamente ao salvar alterações.

### Build de produção

```bash
ng build
```



## Estrutura do projeto

app-projeto/
  src/app/
    - auth/         Login e cadastro
    - cliente/       Telas do cliente
    - funcionario/   Telas do funcionário (manutenção, redirecionamento, categorias, etc.)
    - shared/        Services e models compartilhados


## Equipe 7

| RA | Nome |
|---|---|
| GRR20250215 | Paulo Roberto Rocha Wojciski |
| GRR20254293 | João Guilherme Terlecki Pereira |
| GRR20254788 | Thales Cercal |
| GRR20253136 | Fabricio Renan Plautz |
| GRR20254201 | Fernando Augusto Bueno Canquerini |
| GRR20251192 | Matheus Gabriel Lino e Silva |