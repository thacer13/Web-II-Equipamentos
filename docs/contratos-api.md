## 1. Convenções gerais

- Endereço base da API: `http://localhost:8080/api`.
- Comunicação: requisições HTTP com dados em JSON.
- Autenticação: sessão HTTP com cookie `JSESSIONID`.
- Perfis: `CLIENTE` e `FUNCIONARIO`.
- O Angular utiliza `withCredentials: true` nas requisições autenticadas.
- A identidade do usuário autenticado é obtida pela sessão, não por parâmetros informados pelo frontend.
- Datas e horários: formato ISO 8601 na comunicação com a API.
- Filtros de datas: formato `aaaa-mm-dd`.
- Valores monetários: números decimais, como `250.00`.
- Estados das solicitações: valores definidos no enum `EstadoSolicitacao`.
- Mensagens de erro: objeto JSON com o atributo `mensagem`.

### Códigos de resposta HTTP

| Código | Significado |
|---|---|
| 200 | Requisição executada com sucesso |
| 201 | Registro criado com sucesso |
| 204 | Operação concluída sem conteúdo na resposta |
| 400 | Dados inválidos ou campos obrigatórios não preenchidos |
| 401 | Usuário não autenticado |
| 403 | Usuário sem permissão para executar a operação |
| 404 | Registro inexistente ou não acessível ao usuário |
| 409 | Conflito de estado ou de dados |

## 2. Estados das solicitações

O sistema utiliza os seguintes estados:

- `ABERTA`
- `ORÇADA`
- `APROVADA`
- `REJEITADA`
- `REDIRECIONADA`
- `ARRUMADA`
- `PAGA`
- `FINALIZADA`

As transições permitidas são:

1. `ABERTA` para `ORÇADA`.
2. `ORÇADA` para `APROVADA`.
3. `ORÇADA` para `REJEITADA`.
4. `REJEITADA` para `APROVADA`, quando o cliente resgata o serviço.
5. `APROVADA` para `ARRUMADA`.
6. `APROVADA` para `REDIRECIONADA`.
7. `REDIRECIONADA` para `REDIRECIONADA`, permitindo novos redirecionamentos.
8. `REDIRECIONADA` para `ARRUMADA`.
9. `ARRUMADA` para `PAGA`.
10. `PAGA` para `FINALIZADA`.

As regras de transição estão definidas em `EstadoSolicitacao.java`.

Antes de realizar uma alteração de estado, o backend verifica se a transição é permitida.

### Regras de alteração de estado

- Uma solicitação nova sempre começa no estado `ABERTA`.
- O orçamento somente pode ser registrado para solicitações abertas.
- Apenas o cliente responsável pode aprovar, rejeitar ou resgatar o serviço.
- A manutenção somente pode ser concluída quando a solicitação estiver aprovada ou redirecionada.
- O funcionário não pode redirecionar uma solicitação para si mesmo.
- Uma solicitação pode ser redirecionada várias vezes.
- O pagamento somente pode ser confirmado após a manutenção.
- A finalização somente pode ocorrer após o pagamento.
- Toda alteração de estado deve ser registrada no histórico.
- O backend deve validar as permissões independentemente das verificações realizadas no Angular.

## 3. Autenticação e cadastro

### POST /api/auth/login

Perfil: Público.

Finalidade: autenticar um usuário.

Corpo da requisição:

```json
{
  "email": "usuario@example.com",
  "senha": "1234"
}
```

Resposta de sucesso: dados de identificação do usuário, incluindo ID, nome, e-mail e perfil.

O backend valida as credenciais e cria uma sessão HTTP.

### POST /api/auth/logout

Perfil: Usuário autenticado.

Finalidade: encerrar a sessão atual.

Resposta esperada: HTTP 204.

### GET /api/auth/session

Finalidade: consultar o estado da sessão do usuário.

Permite que o frontend identifique se existe uma sessão válida.

### GET /api/auth/csrf

Finalidade: disponibilizar as informações necessárias à proteção CSRF das requisições.

### POST /api/clientes

Perfil: Público.

Requisito: RF001.

Finalidade: realizar o autocadastro de um cliente.

Corpo da requisição:

```json
{
  "cpf": "12345678909",
  "nome": "João da Silva",
  "email": "joao@example.com",
  "telefone": "41999999999",
  "cep": "80000000",
  "logradouro": "Rua Exemplo",
  "numero": "100",
  "complemento": "Apartamento 10",
  "bairro": "Centro",
  "cidade": "Curitiba",
  "estado": "PR"
}
```

Regras:

- CPF e e-mail devem ser únicos.
- Os campos obrigatórios devem ser validados.
- O endereço completo deve ser armazenado.
- O Angular utiliza a API ViaCEP para auxiliar no preenchimento do endereço.
- O backend gera uma senha numérica de quatro dígitos.
- A senha é armazenada utilizando hash SHA-256 com salt.
- A senha gerada é enviada por e-mail ao cliente.
- O cadastro retorna HTTP 201 quando realizado com sucesso.
- Conflitos de CPF ou e-mail retornam HTTP 409.

## 4. Gerenciamento de usuários

### GET /api/usuarios

Perfil: Funcionário.

Finalidade: consultar usuários cadastrados.

A resposta contém informações de identificação, sem expor senhas, hashes ou salts.

### GET /api/usuarios/{id}

Perfil: Funcionário.

Finalidade: consultar um usuário específico.

### POST /api/usuarios

Perfil: Funcionário.

Finalidade: realizar cadastro administrativo de usuário.

O autocadastro público é realizado pelo endpoint `/api/clientes`.

### POST /api/usuarios/login

Perfil: Público.

Finalidade: disponibilizar uma rota legada de autenticação.

### PUT /api/usuarios/{id}

Perfil: Usuário autenticado.

Finalidade: atualizar as informações permitidas da própria conta.

O backend verifica se o usuário autenticado possui autorização para modificar o registro.

### DELETE /api/usuarios/{id}

Perfil: Funcionário.

Finalidade: realizar a desativação lógica do usuário conforme as regras implementadas.

A remoção lógica preserva os registros relacionados, evitando problemas de integridade referencial.

## 5. Solicitações de manutenção — Cliente

### GET /api/solicitacoes/cliente

Perfil: Cliente.

Requisito: RF003.

Finalidade: listar as solicitações pertencentes ao cliente autenticado.

As solicitações são apresentadas em ordem crescente de data e hora.

A resposta contém informações como:

- ID da solicitação.
- Data e hora.
- Descrição do equipamento.
- Descrição do defeito.
- Categoria.
- Estado atual.
- Valor orçado, quando existente.

### GET /api/solicitacoes/cliente/{id}

Perfil: Cliente.

Requisitos: RF005 e RF008.

Finalidade: consultar os detalhes completos de uma solicitação.

A resposta inclui o histórico das alterações.

O backend verifica se a solicitação pertence ao cliente autenticado.

### POST /api/solicitacoes

Perfil: Cliente.

Requisito: RF004.

Finalidade: abrir uma solicitação de manutenção.

Corpo da requisição:

```json
{
  "descricaoEquipamento": "Notebook Dell",
  "categoriaId": 1,
  "descricaoDefeito": "O equipamento não liga."
}
```

Regras:

- A descrição do equipamento deve ser preenchida.
- A categoria informada deve existir e estar ativa.
- A descrição do defeito deve ser válida.
- A data e hora são definidas pelo servidor.
- A solicitação começa no estado `ABERTA`.
- O histórico inicial é registrado.
- A criação utiliza transação para manter a consistência dos dados.

### POST /api/solicitacoes/{id}/aprovacao

Perfil: Cliente.

Requisito: RF006.

Finalidade: aprovar o orçamento de uma solicitação.

Regras:

- A solicitação deve pertencer ao cliente autenticado.
- O estado atual deve ser `ORÇADA`.
- O novo estado será `APROVADA`.
- A aprovação será registrada no histórico.

### POST /api/solicitacoes/{id}/rejeicao

Perfil: Cliente.

Requisito: RF007.

Finalidade: rejeitar um orçamento.

Corpo da requisição:

```json
{
  "motivo": "O valor do serviço ficou acima do esperado."
}
```

Regras:

- A solicitação deve estar no estado `ORÇADA`.
- O motivo da rejeição é obrigatório.
- O novo estado será `REJEITADA`.
- O motivo será registrado no histórico.

### POST /api/solicitacoes/{id}/resgate

Perfil: Cliente.

Requisito: RF009.

Finalidade: resgatar uma solicitação rejeitada.

Regras:

- A solicitação deve estar no estado `REJEITADA`.
- O novo estado será `APROVADA`.
- A alteração será registrada no histórico.

### POST /api/solicitacoes/{id}/pagamento

Perfil: Cliente.

Requisito: RF010.

Finalidade: confirmar o pagamento da manutenção.

Regras:

- A solicitação deve pertencer ao cliente autenticado.
- O estado atual deve ser `ARRUMADA`.
- O orçamento precisa possuir um valor válido.
- O pagamento será confirmado no sistema.
- A data e hora do pagamento serão registradas.
- O novo estado será `PAGA`.
- A operação será registrada no histórico.

O sistema realiza o registro da confirmação de pagamento, sem integração com instituições financeiras.

## 6. Solicitações de manutenção — Funcionário

### GET /api/solicitacoes/abertas

Perfil: Funcionário.

Requisito: RF011.

Finalidade: listar solicitações com estado `ABERTA`.

As solicitações são apresentadas em ordem crescente de data e hora.

A resposta inclui os dados necessários à identificação do equipamento e do cliente.

### GET /api/solicitacoes/funcionario

Perfil: Funcionário.

Requisito: RF013.

Finalidade: listar solicitações disponíveis ao funcionário.

A listagem considera as regras de visibilidade das solicitações redirecionadas.

No Angular, são disponibilizados os filtros:

- `HOJE`
- `PERÍODO`
- `TODAS`

Os estados também são apresentados com cores específicas na interface.

### GET /api/solicitacoes/funcionario/{id}

Perfil: Funcionário.

Requisitos: RF012 e RF014.

Finalidade: consultar os detalhes de uma solicitação para atendimento.

A resposta contém informações da solicitação, do cliente e do histórico.

O backend verifica as regras de acesso aplicáveis.

### POST /api/solicitacoes/{id}/orcamento

Perfil: Funcionário.

Requisito: RF012.

Finalidade: registrar o orçamento de uma solicitação.

Corpo da requisição:

```json
{
  "valor": 250.00
}
```

Regras:

- A solicitação deve estar no estado `ABERTA`.
- O valor deve ser positivo.
- O valor monetário deve possuir precisão adequada.
- O funcionário responsável pelo orçamento será registrado.
- A data e hora do orçamento serão armazenadas.
- O novo estado será `ORÇADA`.
- A alteração será registrada no histórico.

### POST /api/solicitacoes/{id}/manutencao

Perfil: Funcionário.

Requisito: RF014.

Finalidade: registrar a conclusão da manutenção.

Corpo da requisição:

```json
{
  "descricaoManutencao": "Foi realizada a substituição da fonte de alimentação.",
  "orientacoesCliente": "Evitar utilizar carregadores incompatíveis."
}
```

Regras:

- A solicitação deve estar `APROVADA` ou `REDIRECIONADA`.
- Os dois campos são obrigatórios.
- O funcionário precisa ter autorização para realizar a manutenção.
- O novo estado será `ARRUMADA`.
- A data, o funcionário e as informações da manutenção serão registrados no histórico.

### POST /api/solicitacoes/{id}/redirecionamento

Perfil: Funcionário.

Requisito: RF015.

Finalidade: transferir a responsabilidade da manutenção para outro funcionário.

Corpo da requisição:

```json
{
  "funcionarioDestinoId": 2
}
```

Regras:

- A solicitação deve estar `APROVADA` ou `REDIRECIONADA`.
- O funcionário de destino deve existir e estar ativo.
- O funcionário não pode redirecionar a solicitação para si mesmo.
- O funcionário de origem precisa possuir autorização.
- O novo estado será `REDIRECIONADA`.
- O funcionário de destino passa a ser o responsável.
- A alteração será registrada no histórico.
- O histórico deve identificar o funcionário de origem e o de destino.
- Novos redirecionamentos são permitidos conforme as regras do sistema.

### POST /api/solicitacoes/{id}/finalizacao

Perfil: Funcionário.

Requisito: RF016.

Finalidade: finalizar uma solicitação após o pagamento.

Regras:

- A solicitação deve estar no estado `PAGA`.
- O funcionário deve possuir autorização para finalizar.
- O novo estado será `FINALIZADA`.
- A data, a hora e o funcionário responsável serão registrados.
- A alteração será armazenada no histórico.

## 7. Cadastro de categorias

### GET /api/categorias

Requisitos: RF004 e RF017.

Finalidade: listar categorias de equipamentos.

Para o cadastro de solicitações, o cliente utiliza as categorias ativas.

### POST /api/categorias

Perfil: Funcionário.

Requisito: RF017.

Finalidade: cadastrar uma nova categoria.

O backend valida os dados e verifica possíveis duplicações.

### PUT /api/categorias/{id}

Perfil: Funcionário.

Requisito: RF017.

Finalidade: atualizar os dados de uma categoria existente.

### DELETE /api/categorias/{id}

Perfil: Funcionário.

Requisito: RF017.

Finalidade: desativar uma categoria.

A desativação lógica preserva as referências às solicitações anteriores.

## 8. Cadastro de funcionários

### GET /api/funcionarios

Perfil: Funcionário.

Requisito: RF018.

Finalidade: listar funcionários cadastrados.

### GET /api/funcionarios/{id}

Perfil: Funcionário.

Requisito: RF018.

Finalidade: consultar os dados de um funcionário.

### POST /api/funcionarios

Perfil: Funcionário.

Requisito: RF018.

Finalidade: cadastrar um novo funcionário.

O sistema valida os dados obrigatórios e a unic