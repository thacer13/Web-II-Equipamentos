import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ConfirmationService } from 'primeng/api';

interface Endereco {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: Endereco;
}

interface Solicitacao {
  id: number;
  dataHora: string;
  equipamento: string;
  categoria: string;
  descricaoDefeito: string;
  estado: string;
  cliente: Cliente;
}

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

  solicitacao: Solicitacao | null = null;

  valorOrcamento: number | null = null;

  salvandoOrcamento = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const solicitacaoRecebida =
      typeof history !== 'undefined'
        ? history.state.solicitacao as Solicitacao
        : null;

    if (
      solicitacaoRecebida &&
      solicitacaoRecebida.id === id
    ) {

      this.solicitacao = solicitacaoRecebida;

    } else if (typeof history !== 'undefined') {

      this.router.navigate(['/funcionario']);

    }
  }

  get valorValido(): boolean {

    return this.valorOrcamento !== null &&
           this.valorOrcamento > 0;
  }

  voltar(): void {

    this.router.navigate(['/funcionario']);
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

    /*
      Por enquanto é apenas uma simulação.

      Quando o backend estiver pronto,
      aqui será feita a chamada para salvar
      o orçamento e alterar a solicitação
      de ABERTA para ORCADA.
    */

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