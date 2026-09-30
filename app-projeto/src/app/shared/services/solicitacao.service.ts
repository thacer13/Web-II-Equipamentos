import { Injectable, inject } from '@angular/core';
import { Solicitacao } from '../models/solicitacao.model';
import { EstadoSolicitacao } from '../models/estado-solicitacao.model';
import { Cliente } from '../models/cliente.model';
import { UsuarioService, DADOS_INICIAIS_USUARIOS } from './usuario.service';

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

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private solicitacoes: Solicitacao[] | null = null;
  private usuarioService = inject(UsuarioService);

  listar(): Solicitacao[] {
    if (!this.solicitacoes) {
      this.solicitacoes = this.ler() ?? DADOS_INICIAIS;
      this.salvar(this.solicitacoes);
    }
    return [...this.solicitacoes].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }

  /** Cria uma solicitação vinculada ao cliente logado (grava o clienteId). */
  criar(
    dados: Pick<Solicitacao, 'descricaoEquipamento' | 'categoriaEquipamento' | 'descricaoDefeito'>,
  ): Solicitacao {
    this.listar();
    const lista = this.solicitacoes ?? [];
    const agora = new Date().toISOString();

    const usuarioLogado = this.usuarioService.obterUsuarioLogado() as Cliente;

    const nova: Solicitacao = {
      ...dados,
      id: lista.length ? Math.max(...lista.map((s) => s.id)) + 1 : 1,
      dataHora: agora,
      cliente: usuarioLogado,
      estado: 'ABERTA',
      historico: [
        { dataHora: agora, estado: 'ABERTA', observacao: 'Solicitação aberta pelo cliente.' },
      ],
    };

    lista.push(nova);
    this.solicitacoes = lista;
    this.salvar(lista);
    return nova;
  }

  atualizarEstado(
    solicitacao: Solicitacao,
    novoEstado: EstadoSolicitacao,
    funcionario?: string,
    observacao?: string
  ): void {
    solicitacao.estado = novoEstado;
    solicitacao.historico.push({
      dataHora: new Date().toISOString(),
      estado: novoEstado,
      funcionario,
      observacao,
    });
    this.listar();
    this.salvar(this.solicitacoes ?? []);
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