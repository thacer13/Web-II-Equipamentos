import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  SolicitacaoService,
  ESTADO_COR
} from '../../shared/services/solicitacao.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { EstadoSolicitacao } from '../../shared/models/estado-solicitacao.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { deIso, hoje, paraIso } from '../../shared/utils/datas';
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
    DialogModule,
    SelectModule,
    DatePickerModule
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

  readonly opcoesFiltro = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Hoje', value: 'HOJE' },
    { label: 'Período de abertura', value: 'PERIODO' }
  ];

  dataInicio: Date | null = null;
  dataFim: Date | null = null;

  solicitacoes: Solicitacao[] = [];

  readonly dataHoje = hoje();

  // Campo (não getter) para o [minDate] do datepicker manter a mesma referência.
  dataMinima = this.dataHoje;

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

    const hojeIso = paraIso(this.dataHoje);
    const maisAntiga = this.solicitacoes
      .map(solicitacao => solicitacao.dataHora.slice(0, 10))
      .filter(data => data <= hojeIso)
      .sort()[0];

    this.dataMinima = (maisAntiga && deIso(maisAntiga)) || this.dataHoje;
  }

  get solicitacoesFiltradas(): Solicitacao[] {

    const hojeIso = paraIso(this.dataHoje);
    const inicio = this.dataInicio ? paraIso(this.dataInicio) : '';
    const fim = this.dataFim ? paraIso(this.dataFim) : '';

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
          return dataAbertura === hojeIso;
        }

        if (this.filtro === 'PERIODO') {
          const depoisDoInicio =
            !inicio ||
            dataAbertura >= inicio;

          const antesDoFim =
            !fim ||
            dataAbertura <= fim;

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
      this.solicitacaoService.atualizarEstado(
        solicitacao,
        'FINALIZADA',
        this.funcionarioAtual,
        'Solicitação finalizada pelo funcionário.'
      );
      this.carregarSolicitacoes();
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