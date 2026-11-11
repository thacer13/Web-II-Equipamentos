# Como executar o sistema de Manutenção de Equipamentos

## 1. Tecnologias e requisitos

- Frontend: Angular 21, TypeScript, PrimeNG e Tailwind CSS.
- Backend: Spring Boot 4.1.2, Java 17 e Spring JDBC (`JdbcTemplate`).
- Banco: PostgreSQL 18. O projeto também pode funcionar com uma versão compatível, após validação.
- Ferramentas utilizadas na execução e nos testes: PowerShell, Maven Wrapper, Node.js 24 e npm 11.
- Portas padrão: PostgreSQL 5432, API 8080 e Angular 4200.
- Docker é opcional. O projeto também pode ser executado diretamente no Windows.

## 2. Executar diretamente no Windows (sem Docker)

### 2.1 Preparar o PostgreSQL

1. Verificar se o serviço PostgreSQL está iniciado e aceita conexões.
2. Criar, caso ainda não existam, o banco `manutencao_db` e um usuário com permissão sobre esse banco.
3. Guardar a senha do banco apenas no ambiente local. A instalação e a recuperação do PostgreSQL não fazem parte do código da aplicação.
4. Em um banco de testes novo e vazio, a primeira execução da API pode aplicar `schema.sql` e `data.sql` com a opção `SPRING_SQL_INIT_MODE=always`.
5. Em um banco com dados que precisam ser preservados, usar `SPRING_SQL_INIT_MODE=never` até conferir os scripts e o conteúdo existente. Não apagar nem recriar a instância por causa de erros de conexão.

Arquivos de inicialização: `webprojeto/src/main/resources/schema.sql` e `webprojeto/src/main/resources/data.sql`.

### 2.2 Iniciar o backend

Na pasta `webprojeto`, executar no PowerShell:

```powershell
$env:DB_URL = 'jdbc:postgresql://localhost:5432/manutencao_db'
$env:DB_USER = 'dev_user'
$env:DB_PASS = Read-Host 'Senha do PostgreSQL'
$env:SPRING_SQL_INIT_MODE = 'always'
.\mvnw.cmd spring-boot:run
```

A opção `always` acima é destinada **somente à primeira carga de um banco de testes apropriado**. Nas demais execuções, substituí-la por `never`, quando a estrutura e os dados já estiverem configurados.

Para um PostgreSQL instalado em outra porta, alterar apenas a porta na variável `DB_URL` (por exemplo, 5433). `DB_USER` deve ser um usuário existente no banco.

A API estará disponível em `http://localhost:8080/api` após iniciar sem erros.

### 2.3 Iniciar o frontend

Abrir outro PowerShell na pasta `app-projeto` e executar:

```powershell
npm ci
npm start
```

Abrir `http://localhost:4200`. O frontend precisa da API na porta 8080 para acessar as funcionalidades integradas.

### 2.4 Envio de e-mail

O requisito RF001 prevê o envio da senha temporária por e-mail. Para testá-lo, configure as variáveis na mesma sessão do PowerShell que inicia o backend:

```powershell
$env:MAIL_USER = 'seu-email-remetente@gmail.com'
$env:MAIL_PASS = Read-Host 'Senha de aplicativo do e-mail'
```

Use uma credencial válida de aplicativo da conta remetente. Não grave a senha em arquivos versionados ou no ZIP.

Sem uma configuração SMTP funcional, o requisito RF001 não está validado integralmente, mesmo que os formulários e o banco funcionem.

## 3. Execução usando Docker (opcional)

A raiz do repositório contém `docker-compose.yml` e `Dockerfile`. O Compose inicia o PostgreSQL e o contêiner de desenvolvimento; não inicia automaticamente a API nem o Angular.

1. Na raiz do projeto, crie o arquivo local de variáveis:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Edite `.env` e substitua os valores de exemplo pelas credenciais SMTP válidas para testar o cadastro com envio de e-mail. Se não for testar esse fluxo, deixe `MAIL_USER` e `MAIL_PASS` vazios. O arquivo `.env` é ignorado pelo Git e não deve ser enviado no ZIP.
3. Inicie os contêineres:

   ```powershell
   docker compose up -d --build
   ```

4. Em um terminal, abra o shell do contêiner e inicie a API:

   ```powershell
   docker compose exec app bash
   cd /workspace/webprojeto
   ./mvnw spring-boot:run
   ```

5. Em outro terminal, abra um novo shell do contêiner e inicie o Angular:

   ```powershell
   docker compose exec app bash
   cd /workspace/app-projeto
   npm install
   npm start
   ```

A aplicação fica disponível em `http://localhost:4200` e a API em `http://localhost:8080`. Como o Compose define `SPRING_SQL_INIT_MODE=always`, use esse banco apenas para desenvolvimento e demonstração; para preservar um banco local existente, prefira a execução sem Docker e confira a configuração de inicialização antes de iniciar a API.

## 4. Dados iniciais de demonstração

O `data.sql` possui 2 funcionários (Maria e Mário), 4 clientes (João, José, Joana e Joaquina), 5 categorias iniciais (Notebook, Desktop, Impressora, Mouse e Teclado) e 24 solicitações demonstrativas distribuídas entre diferentes estados, com históricos.

Usuários de demonstração:

- Funcionários: `maria.funcionario@example.com`, `mario.funcionario@example.com`.
- Clientes: `joao.cliente@example.com`, `jose.cliente@example.com`, `joana.cliente@example.com`, `joaquina.cliente@example.com`.
- Senha das contas demonstrativas: `1234`.

Essas contas são fictícias e destinadas a ambiente de teste. Não devem ser utilizadas em ambiente público.

## 5. Compilação, testes e conferência

### Backend

Na pasta `webprojeto`:

```powershell
.\mvnw.cmd clean test
```

### Frontend

Na pasta `app-projeto`:

```powershell
npm ci
npm run build -- --configuration development
npm run build
```

### Integridade do banco

Na raiz do repositório, com PostgreSQL funcionando e as tabelas carregadas:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -p 5432 -U dev_user -d manutencao_db -f 'docs/verificar-integridade.sql'
```

Todos os campos de problemas de integridade devem estar em zero; a coluna `solicitacoes` deve mostrar a quantidade de solicitações cadastradas. Para outra porta, modificar `-p`.

**Importante:** passar nos builds e testes automatizados não substitui testar os 10 requisitos mínimos no navegador Firefox, da tela até o PostgreSQL.

## 6. Documentação complementar

- `app-projeto/README.md`: visão geral do projeto.
- `docs/contratos-api.md`: endpoints, estados e regras da API.
- `docs/suposicoes.md`: decisões adotadas quando o enunciado não detalha o comportamento; o script de entrega gera também `suposicoes.odt`.
- `docs/integrantes.txt`: relação dos integrantes com GRR e e-mail.
- `docs/validacao.md`: resultados registrados e procedência da validação funcional.
- `docs/conferencia-entrega.md`: checklist e conteúdo do pacote de entrega.
