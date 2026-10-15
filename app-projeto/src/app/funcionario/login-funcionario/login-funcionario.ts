import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FilterService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
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