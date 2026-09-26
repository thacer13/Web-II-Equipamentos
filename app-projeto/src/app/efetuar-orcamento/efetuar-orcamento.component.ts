import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
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

  solicitacao: Solicitacao | null = null;

  valorOrcamento: number | null = null;

  salvandoOrcamento = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private solicitacaoService: SolicitacaoService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/funcionario/solicitacoes']);
      }
      return;
    }

    const id = Number(idParam);
    let solicitacaoRecebida: Solicitacao | null = null;

    // Tenta capturar do history.state APENAS se estiver rodando no navegador
    if (isPlatformBrowser(this.platformId)) {
      solicitacaoRecebida = history.state?.solicitacao as Solicitacao;
    }

    // Cenário 1: Chegou via navegação com state no navegador
    if (solicitacaoRecebida && solicitacaoRecebida.id === id) {
      this.solicitacao = solicitacaoRecebida;
    } 
    // Cenário 2: SSR ou F5 (busca no serviço)
    else {
      const listagem = this.solicitacaoService.listar();
      const solicitacaoEncontrada = listagem.find(s => s.id === id);

      if (solicitacaoEncontrada) {
        this.solicitacao = solicitacaoEncontrada;
      } else if (isPlatformBrowser(this.platformId)) {
        // Redireciona somente no browser se o item realmente não existir no serviço
        this.router.navigate(['/funcionario/solicitacoes']);
      }
    }
  }

  get valorValido(): boolean {

    return this.valorOrcamento !== null &&
           this.valorOrcamento > 0;
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

    const idSolicitacao = this.solicitacao.id;
    const valor = this.valorOrcamento;

    this.router.navigate(
      ['/funcionario'],
      {
        state: {
          orcadaId: idSolicitacao,
          valorOrcamento: valor
        }
      }
    );
  }

  private formatarMoeda(valor: number): string {

    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}