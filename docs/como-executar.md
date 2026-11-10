# Como executar o sistema

O sistema tem três partes: banco PostgreSQL 18, API Spring Boot (Java 21) na porta 8080 e
frontend Angular 21 na porta 4200. Abra o navegador em `http://localhost:4200`.

## Opção 1: Docker (recomendada)

Pré-requisito: Docker com Docker Compose.

```bash
docker compose up -d --build
docker exec -it manutencao_app bash

# dentro do container
cd webprojeto && ./mvnw spring-boot:run          # API em http://localhost:8080
# em outro terminal: docker exec -it manutencao_app bash
cd app-projeto && npm install && npx ng serve --host 0.0.0.0   # http://localhost:4200
```

No Docker a API roda com `SPRING_SQL_INIT_MODE=always`, então ao iniciar ela cria as tabelas
(`schema.sql`) e carrega os dados de teste (`data.sql`). Os dois scripts podem ser executados
várias vezes sem duplicar dados.

## Opção 2: na máquina

Pré-requisitos: Java 21, Node.js 24 e PostgreSQL 18 (ou só o banco pelo Docker:
`docker compose up -d database`).

1. Crie o banco `manutencao_db` com o usuário `dev_user` / senha `dev_password`
   (o `docker compose up -d database` já faz isso).
2. Suba a API aplicando o schema e os dados de teste:

   ```bash
   cd webprojeto
   SPRING_SQL_INIT_MODE=always ./mvnw spring-boot:run
   ```

   Nas execuções seguintes `./mvnw spring-boot:run` basta, mas usar `SPRING_SQL_INIT_MODE=always`
   sempre é seguro e mantém o banco atualizado quando o schema muda.
3. Suba o frontend:

   ```bash
   cd app-projeto
   npm install
   npx ng serve
   ```

### Variáveis de ambiente da API

| Variável | Padrão | Uso |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/manutencao_db` | conexão com o banco |
| `DB_USER` / `DB_PASS` | `dev_user` / `dev_password` | usuário do banco |
| `SPRING_SQL_INIT_MODE` | `never` | `always` aplica `schema.sql` e `data.sql` ao iniciar |
| `MAIL_USER` / `MAIL_PASS` | — | conta Gmail (senha de app) que envia a senha do autocadastro |

Sem `MAIL_USER`/`MAIL_PASS` o sistema funciona, mas o e-mail com a senha do autocadastro não é enviado.

## Dados de teste

Todas as contas usam a senha `1234`.

| Perfil | E-mails |
|---|---|
| Funcionário | `maria.funcionario@example.com`, `mario.funcionario@example.com` |
| Cliente | `joao.cliente@example.com`, `jose.cliente@example.com`, `joana.cliente@example.com`, `joaquina.cliente@example.com` |

Categorias iniciais: Notebook, Desktop, Impressora, Mouse e Teclado.

## Testes

```bash
cd webprojeto && ./mvnw test        # testes da API
cd app-projeto && npx ng test       # testes do Angular
```

Para conferir se estados e histórico das solicitações estão consistentes no banco:

```bash
psql -h localhost -U dev_user -d manutencao_db -f docs/verificar-integridade.sql
```

Todas as colunas, exceto `solicitacoes`, devem dar 0.
