import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';

interface LinhaSolicitacao {
  solicitacao: Solicitacao;
  nomeCliente: string;
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
  ],
  templateUrl: './login-funcionario.html',
})
export class LoginFuncionarioComponent {
  private solicitacaoService = inject(SolicitacaoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  funcionarioAtual = 'Mario';
  linhas: LinhaSolicitacao[] = [];

  constructor() {
    this.linhas = this.solicitacaoService
      .listar()
      .filter((s) => s.estado === 'ABERTA')
      .map((s) => ({
        solicitacao: s,
        nomeCliente: this.resolverNomeCliente(s),
      }));
  }

  /** Ordem: cliente embutido -> usuário no localStorage (clienteId) -> clienteNome. */
  private resolverNomeCliente(s: Solicitacao): string {
    if (s.cliente?.nome) {
      return s.cliente.nome;
    }

    const clienteId = s.clienteId ?? s.cliente?.id;

    // localStorage só existe no navegador (não no SSR)
    if (clienteId !== undefined && isPlatformBrowser(this.platformId)) {
      const usuario = this.usuarioService
        .listarTodos()
        .find((u) => u.id === clienteId);

      if (usuario?.nome) {
        return usuario.nome;
      }
    }

    return s.clienteNome ?? '';
  }

  onManutencaoClick(solicitacao: Solicitacao): void {
    this.router.navigate(['/manutencao', solicitacao.id], {
      state: { solicitacao },
    });
  }
}