# Registro de Validação — Sistema de Manutenção de Equipamentos

**Disciplina:** Desenvolvimento Web II  
**Instituição:** Universidade Federal do Paraná (UFPR) — TADS  
**Data:** 11/11/2026  
**Projeto:** Sistema de Manutenção de Equipamentos

## 1. Objetivo

Registrar os resultados das verificações de compilação, dos testes automatizados e da validação funcional do sistema. Os resultados dos testes funcionais apresentados neste documento foram informados pela equipe responsável pelo projeto.

## 2. Ambiente e tecnologias

O sistema utiliza Angular no frontend, Java 17 com Spring Boot no backend e PostgreSQL como banco de dados relacional. A comunicação entre frontend e backend ocorre por meio de uma API REST com requisições HTTP e dados em JSON.

## 3. Compilação e testes automatizados

| Verificação | Resultado |
| --- | --- |
| Compilação do backend com Maven | Aprovada (`BUILD SUCCESS`) |
| Testes automatizados do backend | 118 executados, 0 falhas, 0 erros, 0 ignorados |
| Build Angular de desenvolvimento | Aprovado (`Application bundle generation complete`) |
| Build Angular de produção | Aprovado (`Application bundle generation complete`) |
| Auditoria de dependências de produção (`npm audit --omit=dev`) | 0 vulnerabilidades após a atualização local |

A compilação de produção do Angular apresentou avisos de compatibilidade de módulos CommonJS, sem impedir a geração dos arquivos. A auditoria completa do npm ainda indicou vulnerabilidades em dependências de desenvolvimento; portanto, o resultado de zero vulnerabilidades se refere especificamente à auditoria de produção.

## 4. Validação funcional

 Os requisitos funcionais abaixo foram testados e aprovados na aplicação integrada.

| Requisito | Funcionalidade validada | Resultado informado |
| --- | --- | --- |
| RF001 | Autocadastro de clientes, validações, endereço por CEP e envio da senha | Aprovado |
| RF002 | Login, identificação do perfil e acesso às funcionalidades autorizadas | Aprovado |
| RF003 | Página inicial do cliente e listagem das próprias solicitações | Aprovado |
| RF004 | Abertura de solicitação e registro do estado inicial | Aprovado |
| RF005 | Visualização do orçamento e dos dados da solicitação | Aprovado |
| RF006 | Aprovação do orçamento e atualização do estado | Aprovado |
| RF007 | Rejeição do orçamento com justificativa | Aprovado |
| RF008 | Visualização dos detalhes e histórico da solicitação | Aprovado |
| RF009 | Resgate de solicitação rejeitada | Aprovado |
| RF010 | Confirmação do pagamento e registro da data e hora | Aprovado |
| RF011 | Listagem de solicitações abertas para funcionários | Aprovado |
| RF012 | Elaboração de orçamento pelo funcionário | Aprovado |
| RF013 | Listagem, filtros e identificação visual dos estados | Aprovado |
| RF014 | Registro da manutenção e das orientações ao cliente | Aprovado |
| RF015 | Redirecionamento de solicitação para outro funcionário | Aprovado |
| RF016 | Finalização de solicitação paga | Aprovado |
| RF017 | Cadastro, consulta, atualização e desativação de categorias | Aprovado |
| RF018 | Cadastro, consulta, atualização e desativação de funcionários | Aprovado |
| RF019 | Consulta de receitas por período e geração de PDF | Aprovado |
| RF020 | Consulta de receitas por categoria e geração de PDF | Aprovado |
