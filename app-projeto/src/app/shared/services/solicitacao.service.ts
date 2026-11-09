import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Solicitacao } from '../models/solicitacao.model';
import { EstadoSolicitacao } from '../models/estado-solicitacao.model';
import { Cliente } from '../models/cliente.model';
import { DADOS_INICIAIS_USUARIOS } from './usuario.service';

const LS_CHAVE = 'solicitacoes';

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

const CLIENTE_MOCK = DADOS_INICIAIS_USUARIOS[0] as Cliente;

const DADOS_INICIAIS: Solicitacao[] = [
  {
    id: 1,
    dataHora: '2026-03-10T16:45:00',
    cliente: CLIENTE_MOCK,
    descricaoEquipamento: 'Monitor LG Ultrawide 29 polegadas',
    categoriaEquipamento: 'Monitor',
    descricaoDefeito: 'Linha verde na vertical.',
    estado: 'APROVADA',
    precoOrcado: 450.0,
    historico: [
      { dataHora: '2026-03-10T16:45:00', estado: 'ABERTA', observacao: 'Solicitação aberta pelo cliente.' },
      { dataHora: '2026-03-11T09:00:00', estado: 'ORÇADA', funcionario: 'Mário', observacao: 'Orçamento de R$ 450,00.' },
      { dataHora: '2026-03-11T15:00:00', estado: 'APROVADA', observacao: 'Serviço aprovado pelo cliente.' },
    ],
  },
  {
    id: 2,
    dataHora: '2026-03-12T11:20:00',
    cliente: CLIENTE_MOCK,
    descricaoEquipamento: 'Placa Mãe Asus B550M',
    categoriaEquipamento: 'Hardware',
    descricaoDefeito: 'Pinos do processador tortos.',
    estado: 'REJEITADA',
    precoOrcado: 800.0,
    justificativaRejeicao: 'Valor acima do esperado.',
    historico: [
      { dataHora: '2026-03-12T11:20:00', estado: 'ABERTA', observacao: 'Solicitação aberta pelo cliente.' },
      { dataHora: '2026-03-12T17:00:00', estado: 'ORÇADA', funcionario: 'Maria', observacao: 'Orçamento de R$ 800,00.' },
      { dataHora: '2026-03-13T08:30:00', estado: 'REJEITADA', observacao: 'Valor acima do esperado.' },
    ],
  },
  {
    id: 3,
    dataHora: '2026-03-14T09:15:00',
    cliente: CLIENTE_MOCK,
    descricaoEquipamento: 'Impressora HP Ink Tank 415',
    categoriaEquipamento: 'Impressora',
    descricaoDefeito: 'Não puxa papel.',
    estado: 'ARRUMADA',
    precoOrcado: 120.0,
    historico: [
      { dataHora: '2026-03-14T09:15:00', estado: 'ABERTA', observacao: 'Solicitação aberta pelo cliente.' },
      { dataHora: '2026-03-14T14:00:00', estado: 'ORÇADA', funcionario: 'Maria', observacao: 'Orçamento de R$ 120,00.' },
      { dataHora: '2026-03-15T09:00:00', estado: 'APROVADA', observacao: 'Serviço aprovado pelo cliente.' },
      { dataHora: '2026-03-16T10:30:00', estado: 'ARRUMADA', funcionario: 'Mário', observacao: 'Rolete de tração substituído.' },
    ],
  },
  {
    id: 4,
    dataHora: '2026-03-15T14:30:00',
    cliente: CLIENTE_MOCK,
    descricaoEquipamento: 'Notebook Dell Inspiron 15 3000 com tela piscando e superaquecimento',
    categoriaEquipamento: 'Notebook',
    descricaoDefeito: 'Tela piscando.',
    estado: 'ORÇADA',
    precoOrcado: 250.0,
    historico: [
      { dataHora: '2026-03-15T14:30:00', estado: 'ABERTA', observacao: 'Solicitação aberta pelo cliente.' },
      { dataHora: '2026-03-16T10:00:00', estado: 'ORÇADA', funcionario: 'Maria', observacao: 'Orçamento de R$ 250,00.' },
    ],
  },
  {
    id: 5,
    dataHora: '2026-03-16T10:00:00',
    cliente: CLIENTE_MOCK,
    descricaoEquipamento: 'Placa de Vídeo RTX 3060',
    categoriaEquipamento: 'Hardware',
    descricaoDefeito: 'Não dá vídeo, fans não giram.',
    estado: 'ABERTA',
    historico: [
      { dataHora: '2026-03-16T10:00:00', estado: 'ABERTA', observacao: 'Solicitação aberta pelo cliente.' },
    ],
  },
  {
    id: 6,
    dataHora: '2026-03-17T08:30:00',
    cliente: CLIENTE_MOCK,
    funcionarioDestino: 'Mário',
    descricaoEquipamento: 'Celular Samsung Galaxy',
    categoriaEquipamento: 'Celular',
    descricaoDefeito: 'Não carrega a bateria.',
    estado: 'REDIRECIONADA',
    precoOrcado: 180.0,
    historico: [
      { dataHora: '2026-03-17T08:30:00', estado: 'REDIRECIONADA', funcionario: 'Mário', observacao: 'Solicitação redirecionada para Mário.' },
    ],
  },
  {
    id: 7,
    dataHora: '2026-09-16T08:30:00',
    cliente: CLIENTE_MOCK,
    funcionarioDestino: 'Johnny',
    descricaoEquipamento: 'Xbox Series X',
    categoriaEquipamento: 'Hardware',
    descricaoDefeito: 'Não liga.',
    estado: 'PAGA',
    precoOrcado: 380.0,
    historico: [
      { dataHora: '2026-09-16T08:30:00', estado: 'PAGA', funcionario: 'Johnny', observacao: 'Observação.' },
    ],
  },
];

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

// Uma solicitação já paga: usada nos relatórios de receita (RF019 e RF020)
export interface ReceitaPaga {
  dataPagamento: string;
  categoria: string;
  valor: number;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private solicitacoes: Solicitacao[] | null = null;
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/solicitacoes';

  listar(): Solicitacao[] {
    const dados = this.ler() ?? DADOS_INICIAIS;
    this.solicitacoes = dados;
    this.salvar(this.solicitacoes);
    return [...this.solicitacoes].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }

  // Solicitações que já foram pagas: data do pagamento (passo PAGA do histórico), categoria e valor
  listarReceitas(): ReceitaPaga[] {
    const receitas: ReceitaPaga[] = [];

    for (const solicitacao of this.listar()) {
      const pagamento = solicitacao.historico.find((h) => h.estado === 'PAGA');

      if (pagamento && solicitacao.precoOrcado) {
        receitas.push({
          dataPagamento: pagamento.dataHora,
          categoria: solicitacao.categoriaEquipamento,
          valor: solicitacao.precoOrcado,
        });
      }
    }

    return receitas;
  }

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

  atualizarEstado(solicitacao: Solicitacao, novoEstado: EstadoSolicitacao, funcionario?: string, observacao?: string, precoOrcado?: number): void {
    const lista = this.listar();
    const index = lista.findIndex(s => s.id === solicitacao.id);

    if (index === -1) {
      return;
    }

    const alvo = lista[index];
    alvo.estado = novoEstado;

    if (novoEstado === 'REDIRECIONADA' && funcionario) {
      alvo.funcionarioDestino = funcionario;
    }

    if (precoOrcado !== undefined) {
      alvo.precoOrcado = precoOrcado;
    }

    if (novoEstado === 'REJEITADA') {
      const justificativa = solicitacao.justificativaRejeicao?.trim().replace(/\s+/g, ' ');
      alvo.justificativaRejeicao = justificativa ? justificativa.slice(0, 1000) : undefined;
    }

    const texto = observacao?.trim().replace(/\s+/g, ' ');
    alvo.historico.push({
      dataHora: new Date().toISOString(),
      estado: novoEstado,
      funcionario: funcionario?.trim() ? funcionario.trim() : undefined,
      observacao: texto ? texto.slice(0, 2000) : undefined,
    });
    this.solicitacoes = lista;
    this.salvar(lista);
  }

  private ler(): Solicitacao[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const json = localStorage[LS_CHAVE];
    if (!json) {
      return null;
    }

    return JSON.parse(json) as Solicitacao[];
  }

  private salvar(lista: Solicitacao[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage[LS_CHAVE] = JSON.stringify(lista);
  }
}