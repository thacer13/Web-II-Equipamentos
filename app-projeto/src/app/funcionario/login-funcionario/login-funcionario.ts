import { Component, inject, PLATFORM_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnFilter, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FilterService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { ESTADO_COR, ESTADO_LABEL, SolicitacaoService } from '../../shared/services/solicitacao.service';
import { EstadoSolicitacao } from '../../shared/models/estado-solicitacao.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';

interface LinhaSolicitacao {
  solicitacao: Solicitacao;
  nomeCliente: string;
  dataHoraObj: Date | null;
}

@Component({
  selector: 'app-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    TableModule,
    SelectModule,
    DatePickerModule
  ],
  templateUrl: './login-funcionario.html',
})
export class LoginFuncionarioComponent implements OnInit {
  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private filterService = inject(FilterService);
  private cdr = inject(ChangeDetectorRef);

  usuarioEncontrado = this.usuarioService.obterUsuarioLogado();
  funcionarioAtual = this.usuarioEncontrado?.nome;

  linhas: LinhaSolicitacao[] = [];
  statusOptions = [
    { label: ESTADO_LABEL.ABERTA, value: 'ABERTA' },
    { label: ESTADO_LABEL['ORÇADA'], value: 'ORÇADA' },
    { label: ESTADO_LABEL.REJEITADA, value: 'REJEITADA' },
    { label: ESTADO_LABEL.APROVADA, value: 'APROVADA' },
    { label: ESTADO_LABEL.REDIRECIONADA, value: 'REDIRECIONADA' },
    { label: ESTADO_LABEL.ARRUMADA, value: 'ARRUMADA' },
    { label: ESTADO_LABEL.PAGA, value: 'PAGA' },
    { label: ESTADO_LABEL.FINALIZADA, value: 'FINALIZADA' }
  ];

  readonly minDate = new Date(2020, 0, 1);
  readonly maxDate = this.getToday();

  private getToday(): Date {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  }

  // Chamado em onMonthChange, onYearChange e a cada clique no datepicker.
  // O clique cobre as setas da visão de décadas, que não disparam evento nenhum.
  // O setTimeout espera o PrimeNG terminar de atualizar o estado interno antes de corrigir.
  limitarNavegacaoData(_: unknown, datePicker: DatePicker): void {
    setTimeout(() => this.corrigirNavegacao(datePicker));
  }

  private corrigirNavegacao(datePicker: DatePicker): void {
    const dp = datePicker as any;

    const minAno = this.minDate.getFullYear();
    const maxAno = this.maxDate.getFullYear();
    let mudou = false;

    if (dp.currentView === 'year') {
      // visão de décadas: só olha currentYear (a década exibida é derivada dele)
      const decada = Math.floor(dp.currentYear / 10);
      if (decada > Math.floor(maxAno / 10)) {
        dp.currentYear = maxAno;
        mudou = true;
      } else if (decada < Math.floor(minAno / 10)) {
        dp.currentYear = minAno;
        mudou = true;
      }
      if (mudou && typeof dp.createYears === 'function') {
        dp.createYears(dp.currentYear);
      }
    } else {
      // visão de dias ou de meses: compara ano e mês juntos
      const indice = (ano: number, mes: number) => ano * 12 + mes;
      const minimo = indice(minAno, this.minDate.getMonth());
      const maximo = indice(maxAno, this.maxDate.getMonth());
      const atual = indice(dp.currentYear, dp.currentMonth);

      if (atual < minimo || atual > maximo) {
        const alvo = atual < minimo ? minimo : maximo;
        dp.currentYear = Math.floor(alvo / 12);
        dp.currentMonth = alvo % 12;
        mudou = true;

        if (dp.currentView === 'date' && typeof dp.createMonths === 'function') {
          dp.createMonths(dp.currentMonth, dp.currentYear);
        }
      }
    }

    if (mudou) {
      dp.cd?.markForCheck?.();
      this.cdr.detectChanges();
    }
  }

  // Enter nos filtros de texto: aplica via filterCallback e fecha o overlay,
  // do mesmo jeito que o filtro de status.
  aplicarFiltroEnter(
    event: Event,
    filterCallback: (valor: string) => void,
    columnFilter: ColumnFilter
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const valor = (event.target as HTMLInputElement).value;
    filterCallback(valor);
    columnFilter.hide();
  }

  constructor() {
    this.linhas = this.solicitacaoService
      .listar()
      .map((s) => ({
        solicitacao: s,
        nomeCliente: this.resolverNomeCliente(s),
        // sem new Date() como fallback: data ausente fica null
        dataHoraObj: s.dataHora ? new Date(s.dataHora) : null
      }));
  }

  private resolverNomeCliente(s: Solicitacao): string {
    if (s.cliente?.nome) return s.cliente.nome;

    if (s.cliente?.id !== undefined && isPlatformBrowser(this.platformId)) {
      const usuario = this.usuarioService
        .listarTodos()
        .find((u) => u.id === s.cliente?.id);

      if (usuario?.nome) return usuario.nome;
    }
    return s.cliente?.nome ?? '';
  }

  onOrcamentoClick(solicitacao: Solicitacao): void {
    this.router.navigate(['/efetuar-orcamento', solicitacao.id], {
      state: { solicitacao },
    });
  }

  corEstado(estado: EstadoSolicitacao): string {
    return ESTADO_COR[estado];
  }

  labelEstado(estado: EstadoSolicitacao): string {
    return ESTADO_LABEL[estado];
  }

  ngOnInit(): void {
    this.filterService.filters['contains'] = (value: any, filter: any): boolean => {
      if (filter === undefined || filter === null || filter === '') {
        return true;
      }
      if (value === null || value === undefined) {
        return false;
      }
      return value.toString().toLowerCase().includes(filter.toString().toLowerCase());
    };
  }
}