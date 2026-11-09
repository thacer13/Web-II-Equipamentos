import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ClienteSolicitacaoComponent } from './cliente-solicitacao/cliente-solicitacao.component';
import { ClienteOrcamentoComponent, RespostaOrcamento } from './cliente-orcamento/cliente-orcamento.component';
import { ESTADO_COR, ESTADO_LABEL, SolicitacaoService } from '../shared/services/solicitacao.service';
import { Solicitacao } from '../shared/models/solicitacao.model';
import { EstadoSolicitacao } from '../shared/models/estado-solicitacao.model';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [ClienteSolicitacaoComponent, ClienteOrcamentoComponent, FormsModule, DialogModule, ButtonModule],
  templateUrl: './cliente.component.html',
})
export class ClienteComponent implements OnInit {
  private solicitacaoService = inject(SolicitacaoService);
  private platformId = inject(PLATFORM_ID);
  // O app não usa Zone.js: respostas HTTP precisam pedir nova renderização.
  private cdr = inject(ChangeDetectorRef);

  mostrarFormulario = false;
  solicitacoes: Solicitacao[] = [];
  carregando = true;

  // RF005/RF007 - painel inline de orçamento
  solicitacaoEmOrcamento: Solicitacao | null = null;
  showOrcamento = false;

  // RF008 / RF010
  selecionada: Solicitacao | null = null;
  showVisualizar = false;
  showPagar = false;
  showMensagem = false;
  mensagem = '';

  ngOnInit(): void {
    // A página é pré-renderizada; a sessão só existe no navegador.
    if (isPlatformBrowser(this.platformId)) {
      this.recarregar();
    }
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  fecharFormulario() {
    this.mostrarFormulario = false;
    this.recarregar();
  }

  // RF003
  private recarregar() {
    this.solicitacaoService.listarDoCliente().subscribe({
      next: (solicitacoes) => {
        this.solicitacoes = solicitacoes;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.carregando = false;
        this.mensagem = 'Não foi possível carregar suas solicitações.';
        this.showMensagem = true;
        this.cdr.markForCheck();
      },
    });
  }

  // RF005: o orçamento é buscado no servidor ao abrir, não reaproveitado da lista
  abrirOrcamento(solicitacao: Solicitacao) {
    this.solicitacaoService.detalharDoCliente(solicitacao.id).subscribe({
      next: (detalhe) => {
        this.solicitacaoEmOrcamento = detalhe;
        this.showOrcamento = true;
        this.cdr.markForCheck();
      },
      error: () => this.mostrarErro('Não foi possível carregar o orçamento.'),
    });
  }

  fecharOrcamento() {
    this.solicitacaoEmOrcamento = null;
    this.showOrcamento = false;
    this.recarregar();
  }

  // RF006 / RF007
  processarOrcamento(resposta: RespostaOrcamento): void {
    if (!this.solicitacaoEmOrcamento) return;

    const solicitacao = this.solicitacaoEmOrcamento;
    const valor = solicitacao.precoOrcado ?? 0;
    const operacao = resposta.decisao === 'APROVADA'
      ? this.solicitacaoService.aprovar(solicitacao.id)
      : this.solicitacaoService.rejeitar(solicitacao.id, resposta.motivo ?? '');

    operacao.subscribe({
      next: () => {
        this.fecharOrcamento();
        this.mensagem = resposta.decisao === 'APROVADA'
          ? `Serviço Aprovado no Valor ${this.formatarValor(valor)}`
          : 'Serviço Rejeitado';
        this.showMensagem = true;
        this.cdr.markForCheck();
      },
      error: (erro: HttpErrorResponse) =>
        this.mostrarErro(erro.error?.mensagem ?? 'Não foi possível responder ao orçamento.'),
    });
  }

  private mostrarErro(mensagem: string) {
    this.mensagem = mensagem;
    this.showMensagem = true;
    this.cdr.markForCheck();
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

  // RF008: busca os dados completos e o histórico gravado no banco
  abrirVisualizar(solicitacao: Solicitacao) {
    this.solicitacaoService.detalharDoCliente(solicitacao.id).subscribe({
      next: (detalhe) => {
        this.selecionada = detalhe;
        this.showVisualizar = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar os dados do serviço.';
        this.showMensagem = true;
        this.cdr.markForCheck();
      },
    });
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
    this.solicitacaoService.resgatar(solicitacao.id).subscribe({
      next: () => {
        this.recarregar();
        this.mensagem = 'Serviço Resgatado';
        this.showMensagem = true;
        this.cdr.markForCheck();
      },
      error: (erro: HttpErrorResponse) =>
        this.mostrarErro(erro.error?.mensagem ?? 'Não foi possível resgatar o serviço.'),
    });
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