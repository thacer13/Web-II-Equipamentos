import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SolicitacaoService, ESTADO_COR } from '../shared/services/solicitacao.service';
import { EstadoSolicitacao, Solicitacao } from '../shared/models/solicitacao.model';

@Component({
  selector: 'app-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './funcionario.html',
})
export class FuncionarioComponent {
  private solicitacaoService = inject(SolicitacaoService);
  private router = inject(Router);

  funcionarioAtual = 'Mário';
  filtro = 'TODAS';
  dataInicio = '';
  dataFim = '';
  solicitacoes: Solicitacao[] = [];

  showOrcamentoInput: boolean = false;
  showDescricaoDialog: boolean = false;
  showDescricaoDesktopDialog: boolean = false;

  constructor() {
    this.solicitacoes = this.solicitacaoService.listar();
  }

  get solicitacoesFiltradas(): Solicitacao[] {
    const hoje = new Date().toISOString().slice(0, 10);

    return this.solicitacoes
      .filter((solicitacao) => {
        if (solicitacao.estado === 'REDIRECIONADA') {
          return solicitacao.funcionarioDestino === this.funcionarioAtual;
        }

        return true;
      })
      .filter((solicitacao) => {
        const dataAbertura = solicitacao.dataHora.slice(0, 10);

        if (this.filtro === 'HOJE') {
          return dataAbertura === hoje;
        }

        if (this.filtro === 'PERIODO') {
          const depoisDoInicio =
            !this.dataInicio || dataAbertura >= this.dataInicio;

          const antesDoFim =
            !this.dataFim || dataAbertura <= this.dataFim;

          return depoisDoInicio && antesDoFim;
        }

        return true;
      })
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }

  corEstado(estado: EstadoSolicitacao): string {
    return ESTADO_COR[estado];
  }

  labelEstado(estado: EstadoSolicitacao): string {
    const labels: Record<EstadoSolicitacao, string> = {
      ABERTA: 'Aberta',
      'ORÇADA': 'Orçada',
      APROVADA: 'Aprovada',
      REJEITADA: 'Rejeitada',
      REDIRECIONADA: 'Redirecionada',
      ARRUMADA: 'Arrumada',
      PAGA: 'Paga',
      FINALIZADA: 'Finalizada',
    };

    return labels[estado];
  }

  acaoDoEstado(estado: EstadoSolicitacao): string | null {
    if (estado === 'ABERTA') return 'Efetuar Orçamento';

    if (
      estado === 'APROVADA' ||
      estado === 'REDIRECIONADA'
    ) {
      return 'Efetuar Manutenção';
    }

    if (estado === 'PAGA') {
      return 'Finalizar Solicitação';
    }

    return null;
  }

  executarAcao(solicitacao: Solicitacao): void {
    if (solicitacao.estado === 'ABERTA') {
      this.router.navigate(
        ['/efetuar-orcamento', solicitacao.id],
        {
          state: {
            solicitacao: {
              ...solicitacao,
              equipamento: solicitacao.descricaoEquipamento,
              categoria: solicitacao.categoriaEquipamento,
              cliente: {
                id: 1,
                nome: 'Glauco Lucio',
                cpf: '081.679.750-10',
                email: 'glauco.lucio703@hotmail.com',
                telefone: '(41) 2819-5983',
                endereco: {
                  logradouro: 'Rua Oito',
                  numero: '1446',
                  bairro: 'Angelim',
                  cidade: 'Teresina',
                  uf: 'PI',
                  cep: '64041-280'
                }
              }
            }
          }
        }
      );

      return;
    }

    const acao = this.acaoDoEstado(solicitacao.estado);

    if (acao) {
      alert(`${acao}: solicitação ${solicitacao.id}`);
    }
  }

  abrirCategorias() {
    this.router.navigate(['/funcionario/categorias']);
  }

  abrirFuncionarios() {
    this.router.navigate(['/funcionario/funcionarios']);
  }

  onOrcamentoClick() {
    this.showOrcamentoInput = true;
  }

  onDescricaoClick() {
    this.showDescricaoDialog = true;
  }

  onDescricaoDesktopClick() {
    this.showDescricaoDesktopDialog = true;
  }
}