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

export interface HistoricoSolicitacao {
  dataHora: string;
  estado: EstadoSolicitacao;
  funcionario?: string;
  observacao?: string;
}

export interface Solicitacao {
  id: number;
  dataHora: string;
  funcionarioDestino?: string;
  descricaoEquipamento: string;
  categoriaEquipamento: string;
  descricaoDefeito: string;
  estado: EstadoSolicitacao;
  precoOrcado?: number;
  justificativaRejeicao?: string;
  historico: HistoricoSolicitacao[];
}
