import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Router, ActivatedRoute } from '@angular/router';

import { Funcionario } from '../../shared/models/funcionario.model';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { UsuarioService } from '../../shared/services/usuario.service';

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
export class RedirecionamentoComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private location = inject(Location);

  solicitacao: Solicitacao | null = null;
  carregando = true;
  funcionarioOrigemId: number | null = null;
  funcionarios: Funcionario[] = [];
  funcionarioDestinoId: number | null = null;
  mensagemErro = '';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.funcionarioOrigemId = this.usuarioService.obterUsuarioLogado()?.id ?? null;
    this.usuarioService.listarFuncionarios().subscribe({
      next: funcionarios => {
        this.funcionarios = funcionarios.filter(funcionario => funcionario.ativo);
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar os funcionários disponíveis.';
        this.cdr.markForCheck();
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || !Number.isInteger(id) || id <= 0) {
      this.carregando = false;
      this.router.navigate(['/funcionario/solicitacoes']);
      return;
    }

    this.solicitacaoService.detalharParaFuncionario(id).subscribe({
      next: solicitacao => {
        this.solicitacao = solicitacao;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.carregando = false;
        this.mensagemErro = 'Não foi possível carregar a solicitação.';
        this.cdr.markForCheck();
      }
    });
  }

  get funcionariosDisponiveis(): Funcionario[] {
    return this.funcionarios.filter(funcionario => funcionario.id !== this.funcionarioOrigemId);
  }

  onConfirmarRedirecionamento(): void {
    const solicitacao = this.solicitacao;
    if (!solicitacao) return;

    const funcionarioDestinoId = this.funcionarioDestinoId;
    if (funcionarioDestinoId === null) {
      this.mensagemErro = 'Selecione um funcionário.';
      return;
    }

    if (!this.funcionariosDisponiveis.some(funcionario => funcionario.id === funcionarioDestinoId)) {
      this.mensagemErro = 'Selecione um funcionário válido.';
      return;
    }

    this.mensagemErro = '';
    this.solicitacaoService.redirecionar(solicitacao.id, funcionarioDestinoId).subscribe({
      next: () => this.router.navigate(['/funcionario/solicitacoes']),
      error: () => {
        this.mensagemErro = 'Não foi possível redirecionar a solicitação.';
        this.cdr.markForCheck();
      }
    });
  }

  voltar(): void {
    this.location.back();
  }
}
