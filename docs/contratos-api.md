# Contratos da API e regras de estado

- **Base:** `http://localhost:8080/api` em execução local (ou outro endereço configurado no ambiente).

- **Sessão:** o login grava `email` e `perfil` (`CLIENTE` ou `FUNCIONARIO`) na sessão HTTP (cookie `JSESSIONID`). O Angular envia todas as requisições com `withCredentials: true`.

- **Identidade:** o usuário é sempre o da sessão. Nenhum endpoint recebe `clienteId` ou `funcionarioId` do usuário logado pela URL ou pelo corpo.

- **Datas:** `LocalDateTime` em ISO 8601 sem indicação de fuso (`2026-11-09T19:17:32`); o horário efetivo depende da configuração do servidor e do banco. Filtros de período usam `aaaa-mm-dd`.

- **Valores:** números JSON em reais (ex.: `250.00`), validados conforme as regras monetárias do backend.

- **Estados:** sempre em maiúsculas e com cedilha em `ORÇADA`, iguais aos gravados no banco.

- **Erros:** corpo `{ "mensagem": "texto para exibir ao usuário" }`.

| Status | Quando |
|---|---|
| 400 | Dados inválidos (tamanho, campo obrigatório, categoria inexistente) |
| 401 | Sem sessão ou sessão sem usuário |
| 403 | Perfil errado ou funcionário que não é o responsável |
| 404 | Registro inexistente **ou de outro cliente** (não revelar que existe) |
| 409 | Estado atual não permite a ação, inclusive quando outro usuário alterou a solicitação antes |

## Estados e transições

```

ABERTA → ORÇADA → APROVADA → ARRUMADA → PAGA → FINALIZADA

            ↓         ↑   ↘

        REJEITADA ────┘    REDIRECIONADA ⟲ → ARRUMADA

```

As transições permitidas são definidas em `model/EstadoSolicitacao.java`. As operações de mudança de estado são validadas no backend antes da atualização.

| De → Para | Quem | Dados obrigatórios | Atualiza em `solicitacao` | Grava em `historico_solicitacao` | RF |
|---|---|---|---|---|---|
| (nova) → ABERTA | Cliente | equipamento 3–150, categoria ativa, defeito 10–2000 | todos os dados iniciais | estado_novo | RF004 |
| ABERTA → ORÇADA | Funcionário | `valor` > 0 | valor_orcamento, funcionario_orcamento_id, data_hora_orcamento | funcionario_id, valor | RF012 |
| ORÇADA → APROVADA | Cliente dono | — | — | valor | RF006 |
| ORÇADA → REJEITADA | Cliente dono | `motivo` 3–1000 | — | motivo | RF007 |
| REJEITADA → APROVADA | Cliente dono | — | — | (resgate) | RF009 |
| APROVADA → ARRUMADA | Funcionário responsável | `descricaoManutencao` e `orientacoesCliente` com 3–2000 caracteres cada | funcionario_atual_id | funcionario_id, descricao_manutencao, orientacoes_cliente | RF014 |
| APROVADA → REDIRECIONADA | Funcionário responsável | `funcionarioDestinoId` ativo e diferente de si | funcionario_atual_id = destino | funcionario_id (origem), funcionario_destino_id | RF015 |
| REDIRECIONADA → REDIRECIONADA | Funcionário destino atual | idem acima | funcionario_atual_id = novo destino | idem acima | RF015 |
| REDIRECIONADA → ARRUMADA | Funcionário destino atual | idem APROVADA → ARRUMADA | funcionario_atual_id | idem | RF014 |
| ARRUMADA → PAGA | Cliente dono | — | data_hora_pagamento | valor | RF010 |
| PAGA → FINALIZADA | Funcionário | — | funcionario_finalizacao_id, data_hora_finalizacao | funcionario_id | RF016 |

**Funcionário responsável por uma ação** = `funcionario_atual_id` se preenchido; senão `funcionario_orcamento_id`. A listagem RF013 não é limitada ao responsável: inclui todas as solicitações, exceto as `REDIRECIONADA` cujo destino (`funcionario_atual_id`) não seja o funcionário logado. A API valida separadamente a responsabilidade para cada ação. Os filtros HOJE, PERÍODO e TODAS são realizados no componente Angular da listagem.

### Regras para toda transição

1. Mudança de estado e registro no histórico acontecem na **mesma transação** (`@Transactional`).

2. Todo registro do histórico grava `estado_anterior` e `estado_novo`. O `data_hora` vem do banco, nunca do navegador.

3. Para identificar alterações concorrentes de estado, o `UPDATE` confere o estado esperado:

   `UPDATE solicitacao SET estado = ? ... WHERE id = ? AND estado = ?`. Se nenhuma linha for alterada, responder **409**. Essa validação do estado não substitui o controle do funcionário responsável em ações concorrentes.

4. Ações de cliente usam a solicitação do cliente da sessão; se for de outro cliente, responder **404**.

## Endpoints
### Autenticação e cadastro

| Método e rota | Perfil | Corpo | Resposta | RF |
|---|---|---|---|---|
| `POST /auth/login` | público | `{ email, senha }` | `UsuarioResponse { id, nome, email, perfil }` |  |
| `POST /auth/logout` | logado | — | 204 |  |
| `GET /auth/session` | logado/sessão | — | estado da sessão |  |
| `GET /auth/csrf` | público/sessão | — | token CSRF |  |
| `POST /clientes` | público | `{ cpf, nome, email, telefone, cep, logradouro, numero, complemento?, bairro, cidade, estado }` | 201 `UsuarioResponse` | RF001 |

O cadastro normaliza CPF, telefone e CEP para dígitos e o e-mail para minúsculas.

CPF e e-mail já cadastrados retornam `409`. A senha de quatro dígitos é gerada

no servidor, armazenada como SHA-256 com salt e enviada ao e-mail informado.

`complemento` é opcional e limitado a 100 caracteres; quando informado pelo

ViaCEP ou pelo cliente, é persistido junto ao endereço.

### Usuários

| Método e rota | Perfil | Regra |
|---|---|---|
| `GET /usuarios`, `GET /usuarios/{id}` | Funcionário | Retorna somente dados de identificação; nunca hash, salt ou senha |
| `POST /usuarios` | Funcionário | Cadastro administrativo; o cadastro público é `POST /clientes` |
| `POST /usuarios/login` | Público | Alias legado de autenticação |
| `PUT /usuarios/{id}` | Logado | Só permite atualizar a própria conta; outro titular recebe `404` |
| `DELETE /usuarios/{id}` | Funcionário | Desativa logicamente; não permite desativar a própria conta |

O `DELETE` marca `cliente.ativo = FALSE`; não remove cliente, usuário, endereço,

solicitações nem histórico. Contas desativadas não podem autenticar nem criar ou

consultar solicitações como cliente. O esquema inclui `cliente.ativo`, com

migração idempotente em `webprojeto/src/main/resources/schema.sql`.

### Solicitações — cliente

| Método e rota | Corpo | Resposta | RF | Tarefa |
|---|---|---|---|---|
| `GET /solicitacoes/cliente` | — | `SolicitacaoResumo[]` por data/hora crescente | RF003 |  |
| `GET /solicitacoes/cliente/{id}` | — | `SolicitacaoDetalhe` | RF005, RF008 |  |
| `POST /solicitacoes` | `{ descricaoEquipamento, categoriaId, descricaoDefeito }` | 201 `SolicitacaoResumo` | RF004 |  |
| `POST /solicitacoes/{id}/aprovacao` | — | `SolicitacaoResumo` | RF006 | T19 |
| `POST /solicitacoes/{id}/rejeicao` | `{ motivo }` | `SolicitacaoResumo` | RF007 |  T26 |
| `POST /solicitacoes/{id}/resgate` | — | `SolicitacaoResumo` | RF009 |  T28 |
| `POST /solicitacoes/{id}/pagamento` | — | `SolicitacaoResumo` | RF010 |  T29 |

### Solicitações — funcionário

| Método e rota | Corpo | Resposta | RF | Tarefa |
|---|---|---|---|---|
| `GET /solicitacoes/abertas` | — | `SolicitacaoAberta[]`: todas em ABERTA, por data/hora crescente | RF011 |  T13 |
| `GET /solicitacoes/funcionario` | — | `SolicitacaoResumo[]`: todas, exceto redirecionadas para outro funcionário | RF013 | T30, T31; filtros HOJE, PERÍODO e TODAS aplicados na interface Angular |
| `GET /solicitacoes/funcionario/{id}` | — | `SolicitacaoParaFuncionario`: detalhes completos, exceto redirecionadas para outro funcionário | RF012, RF014 |  T15 |
| `POST /solicitacoes/{id}/orcamento` | `{ valor }` | `SolicitacaoResumo` | RF012 |  T15 |
| `POST /solicitacoes/{id}/manutencao` | `{ descricaoManutencao, orientacoesCliente }` | `SolicitacaoResumo` | RF014 |  T32 |
| `POST /solicitacoes/{id}/redirecionamento` | `{ funcionarioDestinoId }` | `SolicitacaoResumo` | RF015 |  T33 |
| `POST /solicitacoes/{id}/finalizacao` | — | `SolicitacaoResumo` | RF016 |  T34 |

### Cadastros e relatórios (funcionário)
As rotas abaixo estão implementadas no backend. A validação integrada no navegador permanece separada da verificação do código.

| Método e rota | Uso | RF | Tarefa |
|---|---|---|---|
| `GET /categorias` | Lista categorias; o cliente recebe só as ativas | RF004, RF017 |  T21 |
| `POST /categorias`, `PUT /categorias/{id}`, `DELETE /categorias/{id}` | CRUD; `DELETE` só desativa | RF017 | T21 |
| `GET /funcionarios`, `GET /funcionarios/{id}` | Listagem e consulta de funcionários | RF018 |  T23 |
| `POST /funcionarios`, `PUT /funcionarios/{id}`, `DELETE /funcionarios/{id}` | Cadastro, edição e desativação lógica (com proteção contra autoexclusão e remoção do último funcionário ativo) | RF018 |  T23 |
| `POST /funcionarios/{id}/redefinir-senha` | Redefine e envia senha temporária ao funcionário | RF018 |  |
| `GET /relatorios/receitas?inicio=&fim=` | Funcionário; datas opcionais `aaaa-mm-dd`; retorna pagamentos agrupados pela data efetiva de pagamento | RF019 |  T35 |
| `GET /relatorios/receitas-categoria` | Funcionário; pagamentos efetivos agrupados por categoria de equipamento | RF020 | T36 |

O relatório RF019 soma `valor_orcamento` uma vez para cada solicitação com

`data_hora_pagamento` preenchida e agrupa pela data desse timestamp. Assim,

pagamentos continuam contabilizados após a solicitação passar de `PAGA` para

`FINALIZADA`; solicitações apenas orçadas ou marcadas como pagas sem timestamp

não entram no resultado. `inicio` é inclusivo e `fim` inclui o dia inteiro.

Sem datas, retorna todo o histórico de pagamentos. Quando somente `inicio` ou somente `fim` é informado, aplica-se apenas o limite correspondente.

O relatório RF020 usa os mesmos critérios de pagamento e agrupa cada solicitação

paga pela categoria associada no banco, somando seu orçamento uma única vez.

Categorias sem pagamentos efetivos não aparecem; categorias inativas com

pagamentos históricos permanecem no relatório. A tabela e o PDF consomem os

mesmos agregados retornados pela API.

## Formatos de resposta

```jsonc
// SolicitacaoResumo

{

  "id": 1,

  "dataHora": "2026-11-09T19:17:32",

  "descricaoEquipamento": "Notebook Dell",

  "descricaoDefeito": "Não liga",

  "categoriaEquipamento": "Notebook",

  "estado": "ORÇADA",

  "precoOrcado": 250.00        // null enquanto não orçada

}

// SolicitacaoAberta (página inicial do funcionário)

{

  "id": 21,

  "dataHora": "2026-10-02T15:15:00",

  "cliente": "João",

  "descricaoEquipamento": "Notebook Samsung Book",

  "categoriaEquipamento": "Notebook",

  "descricaoDefeito": "Superaquecimento"

}

// SolicitacaoDetalhe = SolicitacaoResumo + historico

{

  "...": "...",

  "historico": [

    {

      "dataHora": "2026-11-10T09:00:00",

      "estadoAnterior": "ABERTA",

      "estado": "ORÇADA",

      "funcionario": "Maria",          // null em ações do cliente

      "funcionarioDestino": null,      // preenchido em REDIRECIONADA

      "valor": 250.00,

      "motivo": null,                  // preenchido em REJEITADA

      "descricaoManutencao": null,     // preenchido em ARRUMADA

      "orientacoesCliente": null

    }

  ]

}

```

O texto exibido no histórico (por exemplo, "Orçamento de R$ 250,00") é montado no Angular a partir desses campos.
