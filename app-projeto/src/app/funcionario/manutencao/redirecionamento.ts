import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, ActivatedRoute } from '@angular/router';

import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-redirecionamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './redirecionamento.html',
})
export class RedirecionamentoComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (SSR vs Browser)
  private location = inject(Location); 

  solicitacao: Solicitacao | null = null;

  funcionarioOrigem: string = 'Funcionário Exemplo';
  funcionariosNomes: string[] = [];

  funcionarioDestino: string = '';
  mensagemErro = '';

 ngOnInit(): void {
    const usuarioLogado = this.usuarioService.obterUsuarioLogado();
    if (usuarioLogado) {
      this.funcionarioOrigem = usuarioLogado.nome;
    }

    const funcionariosCadastrados = this.usuarioService.listarFuncionarios();
    this.funcionariosNomes = funcionariosCadastrados
      .filter(f => f.ativo !== false) // Pega somente os ativos. Ver se não dá para tirar isso (remover ativos de funcionarios)
      .map(f => f.nome);

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

  
  get funcionariosDisponiveis(): string[] {
    return this.funcionariosNomes.filter((f) => f !== this.funcionarioOrigem);
  }

  

  onConfirmarRedirecionamento() {
    if (!this.solicitacao) return;

    const destino = this.funcionarioDestino.trim();

    if (!destino) {
      this.mensagemErro = 'Selecione um funcionário.';
      return;
    }

    if (destino === this.funcionarioOrigem || !this.funcionariosDisponiveis.includes(destino)) {
      this.mensagemErro = 'Selecione um funcionário válido.';
      return;
    }

    this.mensagemErro = '';

    const observacao = `Redirecionado de ${this.funcionarioOrigem} para ${destino}`;
    this.solicitacaoService.atualizarEstado(
      this.solicitacao,
      'REDIRECIONADA',
      destino,
      observacao
    );

    this.router.navigate(['/funcionario/solicitacoes']);
  }

  voltar(): void {
    this.location.back();
  }
}