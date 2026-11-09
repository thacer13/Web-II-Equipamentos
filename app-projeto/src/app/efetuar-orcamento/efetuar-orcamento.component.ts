import { ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { Solicitacao } from '../shared/models/solicitacao.model';
import { SolicitacaoService } from '../shared/services/solicitacao.service';

import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-efetuar-orcamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    ConfirmDialogModule
  ],
  providers: [
    ConfirmationService
  ],
  templateUrl: './efetuar-orcamento.component.html'
})
export class EfetuarOrcamentoComponent implements OnInit {
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (SSR vs Browser)
  private location = inject(Location); 
  // O app não usa Zone.js: respostas HTTP precisam pedir nova renderização.
  private cdr = inject(ChangeDetectorRef);

  solicitacao: Solicitacao | null = null;

  valorOrcamento: number | null = null;

  salvandoOrcamento = false;

  mensagemErro = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private solicitacaoService: SolicitacaoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // A rota é renderizada só no cliente, mas a sessão continua existindo apenas no navegador.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!id) {
      this.router.navigate(['/funcionario']);
      return;
    }

    // RF012: dados completos da solicitação e do cliente vêm do servidor
    this.solicitacaoService.detalharParaFuncionario(id).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar a solicitação.';
        this.cdr.markForCheck();
      },
    });
  }

  get valorValido(): boolean {
    if (this.valorOrcamento === null || this.valorOrcamento === undefined) {
      return false;
    }
    const valor = Number(this.valorOrcamento);
    return Number.isFinite(valor) &&
      valor > 0 &&
      valor <= 99999999.99 &&
      Math.round(valor * 100) / 100 === valor;
  }

  voltar(): void {
    this.location.back();
  }

  pedirConfirmacao(): void {

    if (!this.valorValido || !this.solicitacao) {
      return;
    }

    this.confirmationService.confirm({
      message:
        `Confirmar orçamento no valor de ${this.formatarMoeda(this.valorOrcamento!)}?`,
      header: 'Confirmar orçamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.confirmarOrcamento();
      }
    });
  }

  private confirmarOrcamento(): void {
    if (!this.solicitacao || !this.valorValido) {
      return;
    }

    this.salvandoOrcamento = true;
    this.mensagemErro = '';

    this.solicitacaoService.orcar(this.solicitacao.id, this.valorOrcamento!).subscribe({
      next: () => this.router.navigate(['/funcionario']),
      error: (erro: HttpErrorResponse) => {
        this.salvandoOrcamento = false;
        this.mensagemErro = erro.error?.mensagem ?? 'Não foi possível registrar o orçamento.';
        this.cdr.markForCheck();
      },
    });
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}