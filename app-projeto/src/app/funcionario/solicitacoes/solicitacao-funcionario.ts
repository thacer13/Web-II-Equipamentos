import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ESTADO_COR } from '../../shared/services/solicitacao.service';
import { FinalizacaoService } from '../../shared/services/finalizacao.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { EstadoSolicitacao } from '../../shared/models/estado-solicitacao.model';
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

  private finalizacaoService = inject(FinalizacaoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private routerSub?: Subscription;

  filtro = 'TODAS';
  readonly opcoesFiltro = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Hoje', value: 'HOJE' },
    { label: 'Período de abertura', value: 'PERIODO' }
  ];

  dataInicio: Date | null = null;
  dataFim: Date | null = null;
  solicitacoes: Solicitacao[] = [];
  carregando = true;
  finalizandoId: number | null = null;
  mensagemErro = '';
  mensagemSucesso = '';

  readonly dataHoje = hoje();
  dataMinima = this.dataHoje;
  showReceitas = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.carregarSolicitacoes();

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.carregarSolicitacoes());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  carregarSolicitacoes(): void {
    const parametros = this.parametrosFiltro();
    if (parametros === null) {
      return;
    }

    this.carregando = true;
    this.finalizacaoService.listarDoFuncionario(parametros.inicio, parametros.fim).subscribe({
      next: solicitacoes => {
        this.solicitacoes = solicitacoes;
        this.carregando = false;
        if (this.filtro === 'TODAS') {
          const hojeIso = paraIso(this.dataHoje);
          const maisAntiga = solicitacoes
            .map(s => s.dataHora.slice(0, 10))
            .filter(data => data <= hojeIso)
            .sort()[0];
          this.dataMinima = (maisAntiga && deIso(maisAntiga)) || this.dataHoje;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.carregando = false;
        this.mensagemErro = 'Não foi possível carregar as solicitações do banco.';
        this.cdr.markForCheck();
      }
    });
  }

  filtroAlterado(): void {
    this.mensagemErro = '';
    this.carregarSolicitacoes();
  }

  private parametrosFiltro(): { inicio?: string; fim?: string } | null {
    if (this.filtro === 'TODAS') {
      return {};
    }

    if (this.filtro === 'HOJE') {
      const hojeIso = paraIso(this.dataHoje);
      return { inicio: hojeIso, fim: hojeIso };
    }

    const inicio = this.dataInicio ? paraIso(this.dataInicio) : undefined;
    const fim = this.dataFim ? paraIso(this.dataFim) : undefined;
    if (inicio && fim && inicio > fim) {
      this.mensagemErro = 'A data inicial não pode ser maior que a data final.';
      this.solicitacoes = [];
      return null;
    }
    return { inicio, fim };
  }

  get solicitacoesFiltradas(): Solicitacao[] {
    const hojeIso = paraIso(this.dataHoje);
    const inicio = this.dataInicio ? paraIso(this.dataInicio) : '';
    const fim = this.dataFim ? paraIso(this.dataFim) : '';

    return this.solicitacoes
      .filter(solicitacao => {
        const dataAbertura = solicitacao.dataHora.slice(0, 10);

        if (this.filtro === 'HOJE') {
          return dataAbertura === hojeIso;
        }

        if (this.filtro === 'PERIODO') {
          return (!inicio || dataAbertura >= inicio)
            && (!fim || dataAbertura <= fim);
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
      FINALIZADA: 'Finalizada'
    };

    return labels[estado];
  }

  acaoDoEstado(estado: EstadoSolicitacao): string | null {
    if (estado === 'ABERTA') return 'Efetuar Orçamento';
    if (estado === 'APROVADA' || estado === 'REDIRECIONADA') return 'Efetuar Manutenção';
    if (estado === 'PAGA') return 'Finalizar Solicitação';
    return null;
  }

  executarAcao(solicitacao: Solicitacao): void {
    if (solicitacao.estado === 'ABERTA') {
      this.router.navigate(['/efetuar-orcamento', solicitacao.id], {
        state: { solicitacao }
      });
      return;
    }

    if (solicitacao.estado === 'APROVADA' || solicitacao.estado === 'REDIRECIONADA') {
      this.router.navigate(['/manutencao', solicitacao.id], {
        state: { solicitacao }
      });
      return;
    }

    if (solicitacao.estado === 'PAGA') {
      if (this.finalizandoId !== null) return;

      this.finalizandoId = solicitacao.id;
      this.mensagemErro = '';
      this.mensagemSucesso = '';

      this.finalizacaoService.finalizar(solicitacao.id).subscribe({
        next: () => {
          this.finalizandoId = null;
          this.mensagemSucesso = 'Solicitação finalizada com sucesso.';
          this.carregarSolicitacoes();
          this.cdr.markForCheck();
        },
        error: (erro: HttpErrorResponse) => {
          this.finalizandoId = null;
          this.mensagemErro = erro.error?.mensagem
            ?? 'Não foi possível finalizar a solicitação.';
          this.carregarSolicitacoes();
          this.cdr.markForCheck();
        }
      });
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
}