import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { Router, ActivatedRoute } from '@angular/router';

import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';

@Component({
  selector: 'app-manutencao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule
  ],
  templateUrl: './manutencao.html',
  host: { 'ngSkipHydration': 'true' },
})
export class ManutencaoComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitacaoService = inject(SolicitacaoService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private location = inject(Location);

  solicitacao: Solicitacao | null = null;

  carregando = true;
  descricaoManutencao: string = '';
  orientacoesCliente: string = '';
  mensagemErro = '';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || !Number.isInteger(id) || id <= 0) {
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

  onConfirmarManutencao() {
    if (!this.solicitacao) return;

    const descricao = this.descricaoManutencao.trim().replace(/\s+/g, ' ');
    const orientacoes = this.orientacoesCliente.trim().replace(/\s+/g, ' ');

    if (!descricao || !orientacoes) {
      this.mensagemErro = 'Preencha a descrição e as orientações.';
      return;
    }

    if (descricao.length < 3 || descricao.length > 2000 || orientacoes.length < 3 || orientacoes.length > 2000) {
      this.mensagemErro = 'Cada campo deve ter 3 a 2000 caracteres.';
      return;
    }

    this.mensagemErro = '';

    this.solicitacaoService.registrarManutencao(this.solicitacao.id, {
      descricaoManutencao: descricao,
      orientacoesCliente: orientacoes,
    }).subscribe({
      next: () => this.router.navigate(['/funcionario/solicitacoes']),
      error: () => {
        this.mensagemErro = 'Não foi possível registrar a manutenção.';
        this.cdr.markForCheck();
      }
    });
  }

  onRedirecionarClick() {
    if (!this.solicitacao) return;
    this.router.navigate(['/redirecionamento', this.solicitacao.id]);
  }

  voltar(): void {
    this.location.back();
  }
}