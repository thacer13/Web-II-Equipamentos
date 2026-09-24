export type EstadoSolicitacao =
  | 'ABERTA'
  | 'ORÇADA'
  | 'APROVADA'
  | 'REJEITADA'
  | 'REDIRECIONADA'
  | 'ARRUMADA'
  | 'PAGA'
  | 'FINALIZADA';
// Além dos estados presentes nos requisitos, foi adicionado ABERTA, que representaria a solicitação esperando orçamento,
// e FINALIZADA, depois que o pagamento for efetuado. Em ambas, o botão que aparece deve ser apenas o de visualizar serviço.
// REDIRECIONADA (RF015) e PAGA (RF010) completam a escala de cores do RF013.
// Se isso se mantiver, documentar nas adições do projeto.