import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ClienteSolicitacaoComponent } from './cliente-solicitacao/cliente-solicitacao.component';
import { ClienteOrcamentoComponent, RespostaOrcamento } from './cliente-orcamento/cliente-orcamento.component';
import { ESTADO_COR, ESTADO_LABEL, SolicitacaoService } from '../shared/services/solicitacao.service';
import { Solicitacao } from '../shared/models/solicitacao.model';
import { EstadoSolicitacao } from '../shared/models/estado-solicitacao.model';
import { UsuarioService } from '../shared/services/usuario.service';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [ClienteSolicitacaoComponent, ClienteOrcamentoComponent, FormsModule, DialogModule],
  templateUrl: './cliente.component.html',
})
export class ClienteComponent {
  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);

  mostrarFormulario = false;
  solicitacoes: Solicitacao[] = this.carregarSolicitacoes();

  // RF005/RF007 - painel inline de orçamento
  solicitacaoEmOrcamento: Solicitacao | null = null;

  // RF008 / RF010
  selecionada: Solicitacao | null = null;
  showVisualizar = false;
  showPagar = false;
  showMensagem = false;
  mensagem = '';

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  fecharFormulario() {
    this.mostrarFormulario = false;
    this.recarregar();
  }

  private carregarSolicitacoes(): Solicitacao[] {
    const clienteId = this.usuarioService.obterUsuarioLogado()?.id;
    return this.solicitacaoService.listarPorCliente(clienteId);
  }

  private recarregar() {
    this.solicitacoes = this.carregarSolicitacoes();
    if (this.selecionada) {
      const id = this.selecionada.id;
      this.selecionada = this.solicitacoes.find((s) => s.id === id) ?? null;
    }
  }

  abrirOrcamento(solicitacao: Solicitacao) {
    this.solicitacaoEmOrcamento = solicitacao;
  }

  fecharOrcamento() {
    this.solicitacaoEmOrcamento = null;
  }

  processarOrcamento(resposta: RespostaOrcamento): void {
    if (!this.solicitacaoEmOrcamento) return;

    const solicitacao = this.solicitacaoEmOrcamento;
    const valor = solicitacao.precoOrcado ?? 0;
    const sucesso = this.solicitacaoService.responderOrcamento(
      solicitacao,
      resposta.decisao,
      resposta.motivo
    );

    if (!sucesso) {
      this.mensagem = 'Não foi possível responder ao orçamento.';
      this.showMensagem = true;
      return;
    }

    this.fecharOrcamento();
    this.recarregar();
    this.mensagem = resposta.decisao === 'APROVADA'
      ? `Serviço Aprovado no Valor ${this.formatarValor(valor)}`
      : 'Serviço Rejeitado';
    this.showMensagem = true;
  }

  labelEstado(estado: EstadoSolicitacao): string {
    return ESTADO_LABEL[estado];
  }

  corEstado(estado: EstadoSolicitacao): string {
    return `inline-block text-xs font-medium px-3 py-1 rounded-full ${ESTADO_COR[estado]}`;
  }

  truncar(texto: string, limite = 30): string {
    return texto.length > limite ? texto.slice(0, limite) + '…' : texto;
  }

  formatarDataHora(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // RF008
  abrirVisualizar(solicitacao: Solicitacao) {
    this.selecionada = solicitacao;
    this.showVisualizar = true;
  }

  // RF010
  abrirPagar(solicitacao: Solicitacao) {
    this.selecionada = solicitacao;
    this.showPagar = true;
  }

  confirmarPagamento() {
    if (!this.selecionada) return;
    this.solicitacaoService.atualizarEstado(
      this.selecionada,
      'PAGA',
      undefined,
      'Pagamento confirmado pelo cliente.'
    );
    this.recarregar();
    this.showPagar = false;
    this.mensagem = 'Pagamento Confirmado';
    this.showMensagem = true;
  }

  // RF009
  resgatar(solicitacao: Solicitacao) {
    this.solicitacaoService.atualizarEstado(
      solicitacao,
      'APROVADA',
      undefined,
      'Serviço resgatado pelo cliente.'
    );
    this.recarregar();
    this.mensagem = 'Serviço Resgatado';
    this.showMensagem = true;
  }

  // Ação disponível no RF008, conforme o estado atual (RF003).
  acaoParaEstado(estado: EstadoSolicitacao): string | null {
    switch (estado) {
      case 'ORÇADA':
        return 'Aprovar/Rejeitar Serviço';
      case 'REJEITADA':
        return 'Resgatar Serviço';
      case 'ARRUMADA':
        return 'Pagar Serviço';
      default:
        return null;
    }
  }

  executarAcao(solicitacao: Solicitacao) {
    switch (solicitacao.estado) {
      case 'ORÇADA':
        this.showVisualizar = false;
        this.abrirOrcamento(solicitacao);
        break;
      case 'REJEITADA':
        this.resgatar(solicitacao);
        break;
      case 'ARRUMADA':
        this.abrirPagar(solicitacao);
        break;
    }
  }

  fecharMensagem() {
    this.showMensagem = false;
    this.showVisualizar = false;
    this.showPagar = false;
    this.selecionada = null;
  }
}