import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, ActivatedRoute } from '@angular/router';

import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';

@Component({
  selector: 'app-manutencao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './manutencao.html',
  host: { 'ngSkipHydration': 'true' },
})
export class ManutencaoComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitacaoService = inject(SolicitacaoService);
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (SSR vs Browser)
  private location = inject(Location);

  solicitacao: Solicitacao | null = null;

  funcionarioLogado: string = 'Funcionário Exemplo';
  descricaoManutencao: string = '';
  orientacoesCliente: string = '';
  mensagemErro = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/funcionario/solicitacoes']);
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
        this.router.navigate(['/funcionario/solicitacoes']);
      }
    }
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
    this.descricaoManutencao = descricao;
    this.orientacoesCliente = orientacoes;
    const dataHoraManutencao = new Date();

    console.log('Solicitação ID:', this.solicitacao.id);
    console.log('Descrição:', this.descricaoManutencao);
    console.log('Orientações:', this.orientacoesCliente);
    console.log('Funcionário:', this.funcionarioLogado);
    console.log('Data/Hora da Manutenção:', dataHoraManutencao);
    console.log('Status: ARRUMADA');
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