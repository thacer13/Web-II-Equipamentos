import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, ActivatedRoute } from '@angular/router';

import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';

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
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (SSR vs Browser)
  private location = inject(Location); 

  solicitacao: Solicitacao | null = null;
  // Dados da solicitação (viriam do backend)
  // cliente: string = 'Nome do Cliente';
  // produto: string = 'Notebook Dell Inspiron 15';
  // descricaoProblema: string = 'Tela quebrada';
  // dataSolicitacao: string = '26/08/2026 - 10:30';

  funcionarioOrigem: string = 'Funcionário Exemplo';

  // Lista de funcionários pra quem dá pra redirecionar (viria do backend)
  funcionarios: string[] = ['Mário', 'Ana', 'Carlos', 'Beatriz'];

  funcionarioDestino: string = '';

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

  
  get funcionariosDisponiveis(): string[] {
    return this.funcionarios.filter((f) => f !== this.funcionarioOrigem);
  }

  

  onConfirmarRedirecionamento() {
    if (!this.funcionarioDestino) {
      return;
    }

    console.log('Funcionário origem:', this.funcionarioOrigem);
    console.log('Funcionário destino:', this.funcionarioDestino);
    console.log('Data/Hora:', new Date());
    console.log('Status: REDIRECIONADA');

    this.router.navigate(['/funcionario/solicitacoes']);
  }

  voltar(): void {
    this.location.back();
  }
}