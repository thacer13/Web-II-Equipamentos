import { ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Router, ActivatedRoute } from '@angular/router';

import { Funcionario } from '../../shared/models/funcionario.model';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { UsuarioService } from '../../shared/services/usuario.service';

export interface FuncionarioOpcao {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-redirecionamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './redirecionamento.html',
  host: { 'ngSkipHydration': 'true' },
})
export class RedirecionamentoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private location = inject(Location); 

  solicitacao: Solicitacao | null = null;

  funcionarioOrigemId: number | null = null;
  funcionarioOrigemNome: string = 'Funcionário';
  funcionariosDisponiveis: FuncionarioOpcao[] = [];

  funcionarioDestinoId: number | null = null;
  mensagemErro = '';
  carregando = true;
  salvando = false;

  get podeRedirecionar(): boolean {
    return this.solicitacao?.estado === 'APROVADA' || this.solicitacao?.estado === 'REDIRECIONADA';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || !Number.isInteger(id) || id <= 0) {
      this.carregando = false;
      this.router.navigate(['/funcionario/solicitacoes']);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.carregando = false;
      return;
    }

    const usuarioLogado = this.usuarioService.obterUsuarioLogado();
    if (usuarioLogado) {
      this.funcionarioOrigemId = usuarioLogado.id ?? null;
      this.funcionarioOrigemNome = usuarioLogado.nome;
    }

    this.carregarFuncionarios(usuarioLogado?.id, usuarioLogado?.email);

    this.solicitacaoService.detalharParaFuncionario(id).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (erro: { error?: { mensagem?: string } }) => {
        this.carregando = false;
        this.mensagemErro =
          erro?.error?.mensagem ||
          'Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente.';
        this.cdr.markForCheck();
      },
    });
  }

  private carregarFuncionarios(logadoId?: number, logadoEmail?: string): void {
    this.usuarioService.listarFuncionarios().subscribe({
      next: (funcionarios) => {
        this.funcionariosDisponiveis = funcionarios
          .filter((f) => f.ativo && f.id !== logadoId && (!logadoEmail || f.email.toLowerCase() !== logadoEmail.toLowerCase()))
          .map((f) => ({ id: f.id!, nome: f.nome }));
        this.cdr.markForCheck();
      },
      error: (erro: { error?: { mensagem?: string } }) => {
        this.mensagemErro =
          erro?.error?.mensagem ||
          'Não foi possível carregar a lista de funcionários disponíveis.';
        this.cdr.markForCheck();
      },
    });
  }

  onConfirmarRedirecionamento(): void {
    if (!this.solicitacao || this.salvando) return;

    if (!this.podeRedirecionar) {
      this.mensagemErro = `A solicitação está no estado ${this.solicitacao.estado} e não permite redirecionamento.`;
      return;
    }

    if (!this.funcionarioDestinoId || this.funcionarioDestinoId <= 0) {
      this.mensagemErro = 'Selecione um funcionário de destino.';
      return;
    }

    if (this.funcionarioDestinoId === this.funcionarioOrigemId) {
      this.mensagemErro = 'Não é permitido redirecionar para si mesmo.';
      return;
    }

    this.mensagemErro = '';
    this.salvando = true;

    this.solicitacaoService.redirecionar(this.solicitacao.id, this.funcionarioDestinoId).subscribe({
      next: () => {
        this.router.navigate(['/funcionario/solicitacoes']);
      },
      error: (erro: { error?: { mensagem?: string } }) => {
        this.salvando = false;
        this.mensagemErro =
          erro?.error?.mensagem ||
          'Não foi possível redirecionar a solicitação. Atualize os dados e tente novamente.';
        this.cdr.markForCheck();
      },
    });
  }

  voltar(): void {
    this.location.back();
  }
}
