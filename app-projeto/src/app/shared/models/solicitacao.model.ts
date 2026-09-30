import { Cliente } from './cliente.model';
import { EstadoSolicitacao } from './estado-solicitacao.model';
import { HistoricoSolicitacao } from './historico-solicitacao.model';

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
  cliente?: Cliente;
}