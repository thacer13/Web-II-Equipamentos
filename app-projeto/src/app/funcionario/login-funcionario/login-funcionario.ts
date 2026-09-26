import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, ActivatedRoute } from '@angular/router';
import { Solicitacao } from '../../shared/models/solicitacao.model';

@Component({
  selector: 'app-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
  ],
  templateUrl: './login-funcionario.html',
})

export class LoginFuncionarioComponent {
  private solicitacaoService = inject(SolicitacaoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (SSR vs Browser)
  solicitacao: Solicitacao | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/funcionario']);
      }
      return;
    }

    const id = Number(idParam);
    let solicitacaoRecebida: Solicitacao | null = null;

    // Tenta capturar do history.state APENAS se estiver rodando no navegador
    if (isPlatformBrowser(this.platformId)) {
      solicitacaoRecebida = history.state?.solicitacao as Solicitacao;
    }

    // Cenário 1: Chegou via navegação com state no navegador
    if (solicitacaoRecebida && solicitacaoRecebida.id === id) {
      this.solicitacao = solicitacaoRecebida;
    } 
    // Cenário 2: SSR ou F5 (busca no serviço)
    else {
      const listagem = this.solicitacaoService.listar();
      const solicitacaoEncontrada = listagem.find(s => s.id === id);

      if (solicitacaoEncontrada) {
        this.solicitacao = solicitacaoEncontrada;
      } else if (isPlatformBrowser(this.platformId)) {
        // Redireciona somente no browser se o item realmente não existir no serviço
        this.router.navigate(['/funcionario']);
      }
    }
  }

  onOrcamentoClick(): void {
  if (!this.solicitacao) {
    return;
  }
  this.router.navigate(['/efetuar-orcamento', this.solicitacao.id]);
  }
}
