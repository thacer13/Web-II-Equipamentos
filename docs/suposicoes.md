# Suposições adotadas pela equipe

Pontos que o enunciado não define e a forma como a equipe decidiu tratá-los.

## Acesso e sessão

- O usuário de cada operação é sempre o da sessão. Nenhuma tela envia o id do cliente ou do
  funcionário logado; a API ignora qualquer tentativa de informar outro.
- Quando um cliente tenta ver ou alterar a solicitação de outro cliente, a API responde
  "registro não encontrado", sem revelar que a solicitação existe.
- Recarregar a página mantém o usuário logado enquanto a sessão do servidor for válida.

## Autocadastro

- A senha de quatro dígitos é gerada pelo servidor, enviada por e-mail e armazenada como
  SHA-256 com salt. A tela nunca mostra a senha.
- CPF, telefone e CEP são guardados só com dígitos; o e-mail é guardado em minúsculas.
- CPF ou e-mail já cadastrados impedem o cadastro.

## Solicitações

- A data e a hora de abertura e de cada mudança de estado são as do servidor, nunca as do navegador.
- Equipamento: 3 a 150 caracteres. Defeito: 10 a 2000 caracteres. Só categorias ativas podem
  ser escolhidas.
- O valor do orçamento deve ser maior que zero, com no máximo duas casas decimais e até
  R$ 99.999.999,99.
- O motivo da rejeição é obrigatório (3 a 1000 caracteres).
- O resgate de um serviço rejeitado leva a solicitação de volta para APROVADA, registrando
  o resgate no histórico.

## Visibilidade para funcionários (RF013)

- A listagem inclui todas as solicitações, independentemente do estado, exceto as
  REDIRECIONADAS para outro funcionário, conforme o RF013.
- Uma solicitação REDIRECIONADA aparece apenas para o funcionário indicado como destino.
- A mesma regra vale para abrir os detalhes diretamente pelo endereço: um redirecionamento
  para outro funcionário responde "registro não encontrado".
- A visibilidade na listagem e nos detalhes não concede permissão para executar ações.
  Orçamento, manutenção, redirecionamento e finalização continuam sujeitos às validações
  de estado e de responsabilidade no backend.

## Concorrência e histórico

- Se dois funcionários orçarem a mesma solicitação ao mesmo tempo, vale o primeiro; o segundo
  recebe uma mensagem pedindo para atualizar a página. O mesmo vale para ações simultâneas
  do cliente (por exemplo, aprovar e rejeitar ao mesmo tempo).
- Cada mudança de estado grava exatamente um registro de histórico na mesma transação. Se o
  histórico não puder ser gravado, a mudança de estado é desfeita.

## Remoções

- Funcionários, clientes e categorias não são apagados do banco: são desativados, para não
  perder o histórico das solicitações que os referenciam.
- Um funcionário não pode desativar o próprio usuário.

## Relatórios

- A receita considera somente solicitações pagas, pela data do pagamento.
- Os relatórios são gerados em PDF no navegador.
- Os valores são calculados pela API a partir dos pagamentos registrados no banco.

## Pagamento

- O pagamento é uma confirmação registrada no sistema, sem integração com banco, cartão ou gateway externo.
- O pagamento só é permitido após a conclusão da manutenção e fica registrado com data e hora.

## Filtros e datas

- Os filtros HOJE, PERÍODO e TODAS são aplicados na lista de solicitações do funcionário na interface Angular.
- As datas e os valores são apresentados ao usuário no formato brasileiro, preservando os formatos usados na API e no banco.

