import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

interface NavItem { label: string; url: string; }

const ITENS_PUBLICOS: NavItem[] = [
  { label: 'Entrar', url: '/auth/login' },
  { label: 'Criar conta', url: '/auth/cadastro' },
];

const ITENS_CLIENTE: NavItem[] = [
  { label: 'Minhas Solicitações', url: '/cliente' },
];

const ITENS_FUNCIONARIO: NavItem[] = [
  { label: 'Solicitações', url: '/funcionario/solicitacoes' },
  { label: 'Categorias', url: '/funcionario/categorias' },
  { label: 'Funcionários', url: '/funcionario/lista-funcionarios' },
  { label: 'Receita por Período', url: '/funcionario/receitas/periodo' },
  { label: 'Receita por Categoria', url: '/funcionario/receitas/categoria' },
];

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (visivel) {
      <header class="topbar app-card">
        <nav class="links">
          @for (item of items; track item.url) {
            <a [routerLink]="item.url" routerLinkActive="active" class="link">{{ item.label }}</a>
          }
        </nav>
        @if (userName) {
          <span class="user">{{ userName }}</span>
          <button type="button" class="sair" (click)="sair()">Sair</button>
        }
      </header>
    }
  `,
  styles: [`
    .topbar { position: sticky; top: 1rem; z-index: 1000; width: min(1024px, calc(100vw - 2rem));
      margin: 1rem auto 0; padding: .6rem 1rem; display: flex; align-items: center; gap: .5rem; }
    .links { display: flex; gap: .35rem; flex-wrap: wrap; }
    .link { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500;
      padding: .4rem .7rem; border-radius: 8px; }
    .link:hover { background: #f3f4f6; }
    .link.active { background: #16a34a; color: #fff; }
    .user { margin-left: auto; font-size: 13px; color: #6b7280; max-width: 140px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sair { border: 1px solid #dc2626; border-radius: .5rem; background: #fff; color: #b91c1c;
      padding: .4rem .8rem; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
    .sair:hover { background: #fef2f2; }
  `],
})
export class TopbarComponent {
  private platformId = inject(PLATFORM_ID);
  private usuarios = inject(UsuarioService);
  private router = inject(Router);

  private get usuarioLogado() {
    return isPlatformBrowser(this.platformId) ? this.usuarios.obterUsuarioLogado() : null;
  }

  get visivel(): boolean {
    return !this.usuarioLogado || !this.router.url.startsWith('/auth');
  }

  get items(): NavItem[] {
    const usuario = this.usuarioLogado;
    if (!usuario) return ITENS_PUBLICOS;
    return usuario.perfil === 'FUNCIONARIO' ? ITENS_FUNCIONARIO : ITENS_CLIENTE;
  }

  get userName(): string | null {
    return this.usuarioLogado?.nome ?? null;
  }

  sair(): void {
    this.usuarios.logout();
    this.router.navigate(['/auth/login']);
  }
}