import { EstadoSolicitacao } from "./estado-solicitacao.model";

export interface HistoricoSolicitacao {
  dataHora: string;
  estado: EstadoSolicitacao;
  funcionario?: string;
  observacao?: string;
}