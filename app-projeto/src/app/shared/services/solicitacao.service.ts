import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Solicitacao } from '../models/solicitacao.model';
import { EstadoSolicitacao } from '../models/estado-solicitacao.model';
import { Cliente } from '../models/cliente.model';

export const ESTADO_LABEL: Record<EstadoSolicitacao, string> = {
  ABERTA: 'Aberta',
  'ORÇADA': 'Orçada',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  REDIRECIONADA: 'Redirecionada',
  ARRUMADA: 'Arrumada',
  PAGA: 'Paga',
  FINALIZADA: 'Finalizada',
};

// Escala de cores do RF013, aplicada também na listagem do cliente.
export const ESTADO_COR: Record<EstadoSolicitacao, string> = {
  ABERTA: 'bg-gray-200 text-gray-700',
  'ORÇADA': 'bg-amber-800 text-white',
  APROVADA: 'bg-yellow-100 text-yellow-800',
  REJEITADA: 'bg-red-100 text-red-700',
  REDIRECIONADA: 'bg-purple-100 text-purple-700',
  ARRUMADA: 'bg-blue-100 text-blue-700',
  PAGA: 'bg-orange-100 text-orange-700',
  FINALIZADA: 'bg-green-100 text-green-700',
};

// Formatos da API (docs/contratos-api.md)
export interface NovaSolicitacao {
  descricaoEquipamento: string;
  categoriaId: number;
  descricaoDefeito: string;
}

interface SolicitacaoResumoApi {
  id: number;
  dataHora: string;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  categoriaEquipamento: string;
  estado: EstadoSolicitacao;
  precoOrcado: number | null;
}

interface HistoricoApi {
  dataHora: string;
  estadoAnterior: EstadoSolicitacao | null;
  estado: EstadoSolicitacao;
  funcionario: string | null;
  funcionarioDestino: string | null;
  valor: number | null;
  motivo: string | null;
  descricaoManutencao: string | null;
  orientacoesCliente: string | null;
}

interface SolicitacaoDetalheApi extends SolicitacaoResumoApi {
  historico: HistoricoApi[];
}

interface SolicitacaoAbertaApi {
  id: number;
  dataHora: string;
  cliente: string;
  descricaoEquipamento: string;
  categoriaEquipamento: string;
  descricaoDefeito: string;
}

interface ClienteDaSolicitacaoApi {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}

interface SolicitacaoFuncionarioApi extends SolicitacaoDetalheApi {
  cliente: ClienteDaSolicitacaoApi | null;
}

function paraCliente(api: ClienteDaSolicitacaoApi): Cliente {
  return {
    nome: api.nome,
    email: api.email,
    perfil: 'CLIENTE',
    cpf: api.cpf,
    telefone: api.telefone,
    endereco: {
      cep: api.cep,
      logradouro: api.logradouro,
      numero: api.numero ?? undefined,
      complemento: api.complemento ?? undefined,
      bairro: api.bairro,
      cidade: api.cidade,
      estado: api.estado,
    },
  };
}

function paraSolicitacao(api: SolicitacaoResumoApi, historico: HistoricoApi[] = []): Solicitacao {
  const maisRecentes = [...historico].reverse();

  return {
    id: api.id,
    dataHora: api.dataHora,
    descricaoEquipamento: api.descricaoEquipamento,
    descricaoDefeito: api.descricaoDefeito,
    categoriaEquipamento: api.categoriaEquipamento,
    estado: api.estado,
    precoOrcado: api.precoOrcado ?? undefined,
    justificativaRejeicao: maisRecentes.find((h) => h.estado === 'REJEITADA')?.motivo ?? undefined,
    funcionarioDestino: maisRecentes.find((h) => h.funcionarioDestino)?.funcionarioDestino ?? undefined,
    historico: historico.map((h) => ({
      dataHora: h.dataHora,
      estado: h.estado,
      funcionario: h.funcionario ?? undefined,
      observacao: observacaoDoHistorico(h),
    })),
  };
}

// Texto exibido em cada evento do histórico, montado a partir dos campos gravados no banco.
function observacaoDoHistorico(h: HistoricoApi): string | undefined {
  const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  switch (h.estado) {
    case 'ABERTA':
      return 'Solicitação aberta pelo cliente.';
    case 'ORÇADA':
      return h.valor != null ? `Orçamento de ${moeda(h.valor)}.` : undefined;
    case 'APROVADA':
      return h.estadoAnterior === 'REJEITADA' ? 'Serviço resgatado pelo cliente.' : 'Serviço aprovado pelo cliente.';
    case 'REJEITADA':
      return h.motivo ?? undefined;
    case 'REDIRECIONADA':
      return h.funcionarioDestino ? `Redirecionada para ${h.funcionarioDestino}.` : undefined;
    case 'ARRUMADA':
      return [h.descricaoManutencao, h.orientacoesCliente && `Orientações: ${h.orientacoesCliente}`]
        .filter(Boolean)
        .join(' ') || undefined;
    case 'PAGA':
      return 'Pagamento confirmado pelo cliente.';
    case 'FINALIZADA':
      return 'Solicitação finalizada.';
  }
}

export interface DadosManutencao {
  descricaoManutencao: string;
  orientacoesCliente: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/solicitacoes';

  // RF003: solicitações do cliente da sessão (contrato em docs/contratos-api.md)
  listarDoCliente(): Observable<Solicitacao[]> {
    return this.http
      .get<SolicitacaoResumoApi[]>(`${this.apiUrl}/cliente`, { withCredentials: true })
      .pipe(map((lista) => lista.map((resumo) => paraSolicitacao(resumo))));
  }

  // RF008: dados completos e histórico de uma solicitação do cliente
  detalharDoCliente(id: number): Observable<Solicitacao> {
    return this.http
      .get<SolicitacaoDetalheApi>(`${this.apiUrl}/cliente/${id}`, { withCredentials: true })
      .pipe(map((detalhe) => paraSolicitacao(detalhe, detalhe.historico)));
  }

  // RF011: abertas para qualquer funcionário orçar
  listarAbertas(): Observable<Solicitacao[]> {
    return this.http
      .get<SolicitacaoAbertaApi[]>(`${this.apiUrl}/abertas`, { withCredentials: true })
      .pipe(map((lista) => lista.map((aberta) => ({
        id: aberta.id,
        dataHora: aberta.dataHora,
        descricaoEquipamento: aberta.descricaoEquipamento,
        categoriaEquipamento: aberta.categoriaEquipamento,
        descricaoDefeito: aberta.descricaoDefeito,
        estado: 'ABERTA' as EstadoSolicitacao,
        historico: [],
        cliente: { nome: aberta.cliente } as Cliente,
      }))));
  }

  // RF012 / RF014: solicitação completa com os dados do cliente
  detalharParaFuncionario(id: number): Observable<Solicitacao> {
    return this.http
      .get<SolicitacaoFuncionarioApi>(`${this.apiUrl}/funcionario/${id}`, { withCredentials: true })
      .pipe(map((api) => ({
        ...paraSolicitacao(api, api.historico),
        cliente: api.cliente ? paraCliente(api.cliente) : undefined,
      })));
  }

  registrarManutencao(id: number, dados: DadosManutencao): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(`${this.apiUrl}/${id}/manutencao`, dados, { withCredentials: true })
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF012
  orcar(id: number, valor: number): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(`${this.apiUrl}/${id}/orcamento`, { valor }, { withCredentials: true })
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF014: conclusão da manutenção e registro do histórico no backend.
  concluirManutencao(id: number, descricaoManutencao: string, orientacoesCliente: string): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(
        `${this.apiUrl}/${id}/manutencao`,
        { descricaoManutencao, orientacoesCliente },
        { withCredentials: true }
      )
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF015: redirecionamento de manutenção para outro funcionário ativo.
  redirecionar(id: number, funcionarioDestinoId: number): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(
        `${this.apiUrl}/${id}/redirecionamento`,
        { funcionarioDestinoId },
        { withCredentials: true }
      )
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF006
  aprovar(id: number): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(`${this.apiUrl}/${id}/aprovacao`, null, { withCredentials: true })
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF007
  rejeitar(id: number, motivo: string): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(`${this.apiUrl}/${id}/rejeicao`, { motivo }, { withCredentials: true })
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF009
  resgatar(id: number): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(`${this.apiUrl}/${id}/resgate`, null, { withCredentials: true })
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

  // RF004: data/hora, estado e histórico inicial são definidos pelo servidor
  abrir(dados: NovaSolicitacao): Observable<Solicitacao> {
    return this.http
      .post<SolicitacaoResumoApi>(this.apiUrl, dados, { withCredentials: true })
      .pipe(map((resumo) => paraSolicitacao(resumo)));
  }

}