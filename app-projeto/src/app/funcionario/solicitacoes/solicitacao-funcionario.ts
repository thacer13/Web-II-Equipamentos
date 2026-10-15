import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import {
  SolicitacaoService,
  ESTADO_COR
} from '../../shared/services/solicitacao.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { EstadoSolicitacao } from '../../shared/models/estado-solicitacao.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-solicitacao-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './solicitacao-funcionario.html',
})
export class SolicitacaoFuncionarioComponent implements OnInit, OnDestroy {

  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private routerSub?: Subscription;

  funcionarioAtual = '';

  filtro = 'TODAS';

  dataInicio = '';
  dataFim = '';

  solicitacoes: Solicitacao[] = [];

  get dataHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  get dataMinima(): string {
    const datasDisponiveis = this.solicitacoes
      .map(solicitacao => solicitacao.dataHora.slice(0, 10))
      .filter(data => data <= this.dataHoje)
      .sort();

    return datasDisponiveis[0] ?? this.dataHoje;
  }

  // showOrcamentoInput = false;
  // showDescricaoDialog = false;
  // showDescricaoDesktopDialog = false;
  showReceitas = false;

  ngOnInit(): void {
    // 1. Pega o nome do funcionário logado no LocalStorage
    const usuarioLogado = this.usuarioService.obterUsuarioLogado();
    if (usuarioLogado) {
      this.funcionarioAtual = usuarioLogado.nome;
    }

    this.carregarSolicitacoes();

    // 2. Garante que a lista recarregue sempre que o usuário voltar para esta rota
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.carregarSolicitacoes();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  carregarSolicitacoes(): void {
    this.solicitacoes = this.solicitacaoService.listar();
  }

  get solicitacoesFiltradas(): Solicitacao[] {

    const hoje = this.dataHoje;

    return this.solicitacoes
      .filter((solicitacao) => {
        if (solicitacao.estado === 'REDIRECIONADA') {
          return (
            solicitacao.funcionarioDestino ===
            this.funcionarioAtual
          );
        }
        return true;
      })
      .filter((solicitacao) => {
        const dataAbertura =
          solicitacao.dataHora.slice(0, 10);
        if (this.filtro === 'HOJE') {
          return dataAbertura === hoje;
        }

        if (this.filtro === 'PERIODO') {
          const depoisDoInicio =
            !this.dataInicio ||
            dataAbertura >= this.dataInicio;

          const antesDoFim =
            !this.dataFim ||
            dataAbertura <= this.dataFim;

          return depoisDoInicio && antesDoFim;
        }

        return true;
      })
      .sort(
        (a, b) =>
          a.dataHora.localeCompare(b.dataHora)
      );
  }

  corEstado(estado: EstadoSolicitacao): string {
    return ESTADO_COR[estado];
  }

  labelEstado(estado: EstadoSolicitacao): string {
    const labels: Record<
      EstadoSolicitacao,
      string
    > = {
      ABERTA: 'Aberta',
      'ORÇADA': 'Orçada',
      APROVADA: 'Aprovada',
      REJEITADA: 'Rejeitada',
      REDIRECIONADA: 'Redirecionada',
      ARRUMADA: 'Arrumada',
      PAGA: 'Paga',
      FINALIZADA: 'Finalizada'
    };

    return labels[estado];
  }

  acaoDoEstado(estado: EstadoSolicitacao): string | null {
    if (estado === 'ABERTA') {
      return 'Efetuar Orçamento';
    }

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
            solicitacao: solicitacao
          }
        }
      );
      return;
    }

    if (
      solicitacao.estado === 'APROVADA' ||
      solicitacao.estado === 'REDIRECIONADA'
    ) {
      this.router.navigate(
        ['/manutencao', solicitacao.id],
        {
          state: {solicitacao}
        }
      );
      return;
    }

    if (solicitacao.estado === 'PAGA') {
      alert(`Finalizar Solicitação: solicitação ${solicitacao.id}`);
      return;
    }
  }

  abrirCategorias(): void {
    this.router.navigate(['/funcionario/categorias']);
  }

  abrirFuncionarios(): void {
    this.router.navigate(['/funcionario/lista-funcionarios']);
  }

  abrirReceitas(): void {
    this.showReceitas = true;
  }

  abrirReceitaPeriodo(): void {
    this.showReceitas = false;
    this.router.navigate(['/funcionario/receitas/periodo']);
  }

  abrirReceitaCategoria(): void {
    this.showReceitas = false;
    this.router.navigate(['/funcionario/receitas/categoria']);
  }

  // onOrcamentoClick(): void {

  //   this.showOrcamentoInput = true;
  // }

  // onDescricaoClick(): void {

  //   this.showDescricaoDialog = true;
  // }

  // onDescricaoDesktopClick(): void {

  //   this.showDescricaoDesktopDialog = true;
  // }
}