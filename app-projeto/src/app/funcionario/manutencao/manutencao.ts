import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
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
export class ManutencaoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitacaoService = inject(SolicitacaoService);
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (SSR vs Browser)
  private location = inject(Location);

  solicitacao: Solicitacao | null = null;

  descricaoManutencao: string = '';
  orientacoesCliente: string = '';
  mensagemErro = '';
  carregando = true;
  salvandoManutencao = false;

  get podeConcluir(): boolean {
    return this.solicitacao?.estado === 'APROVADA' || this.solicitacao?.estado === 'REDIRECIONADA';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/funcionario/solicitacoes']);
      }
      return;
    }

    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      this.carregando = false;
      this.mensagemErro = 'Identificador de solicitação inválido.';
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.carregando = false;
      return;
    }

    this.solicitacaoService.detalharParaFuncionario(id).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;
        this.carregando = false;
      },
      error: (erro: { error?: { mensagem?: string } }) => {
        this.carregando = false;
        this.mensagemErro =
          erro?.error?.mensagem ||
          'Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente.';
      },
    });
  }

  onConfirmarManutencao(): void {
    if (!this.solicitacao || this.salvandoManutencao) return;

    if (!this.podeConcluir) {
      this.mensagemErro = `A solicitação está no estado ${this.solicitacao.estado} e não permite manutenção.`;
      return;
    }

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
    this.salvandoManutencao = true;
    this.solicitacaoService
      .concluirManutencao(this.solicitacao.id, descricao, orientacoes)
      .subscribe({
        next: () => this.router.navigate(['/funcionario/solicitacoes']),
        error: (erro: { error?: { mensagem?: string } }) => {
          this.salvandoManutencao = false;
          this.mensagemErro =
            erro?.error?.mensagem ||
            'Não foi possível concluir a manutenção. Atualize os dados e tente novamente.';
        },
      });
  }

  onRedirecionarClick() {
    if (!this.solicitacao) return;
    
    this.router.navigate(['/redirecionamento', this.solicitacao.id], {
      state: { solicitacao: this.solicitacao }
    });
  }

  voltar(): void {
    this.location.back();
  }
}