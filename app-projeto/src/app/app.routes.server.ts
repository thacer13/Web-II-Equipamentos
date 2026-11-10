import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'cliente',
    renderMode: RenderMode.Client
  },
  {
    path: 'funcionario/solicitacoes',
    renderMode: RenderMode.Client
  },
  {
    path: 'funcionario/categorias',
    renderMode: RenderMode.Client
  },
  {
    path: 'funcionario/lista-funcionarios',
    renderMode: RenderMode.Client
  },
  {
    path: 'funcionario/login-funcionario',
    renderMode: RenderMode.Client
  },
  {
    path: 'funcionario/receitas/periodo',
    renderMode: RenderMode.Client
  },
  {
    path: 'funcionario/receitas/categoria',
    renderMode: RenderMode.Client
  },
  {
    path: 'efetuar-orcamento/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'manutencao/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'redirecionamento/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
