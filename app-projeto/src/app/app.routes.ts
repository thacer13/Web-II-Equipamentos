import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ErrComponent } from './auth/err/err';
import { ClienteComponent } from './cliente/cliente.component';
import { SolicitacaoFuncionarioComponent } from './funcionario/solicitacoes/solicitacao-funcionario';
import { EfetuarOrcamentoComponent } from './efetuar-orcamento/efetuar-orcamento.component';
import { CategoriasComponent } from './funcionario/categorias/categorias';
import { ListaFuncionariosComponent } from './funcionario/lista-funcionarios/lista-funcionarios';
import { LoginFuncionarioComponent } from './funcionario/login-funcionario/login-funcionario';
import { RelatorioPeriodoComponent } from './funcionario/relatorio-periodo/relatorio-periodo';
import { RelatorioCategoriasComponent } from './funcionario/relatorio-categorias/relatorio-categorias';
import { RedirecionamentoComponent } from './funcionario/manutencao/redirecionamento';
import { ManutencaoComponent } from './funcionario/manutencao/manutencao';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth/login',
        component: LoginComponent
    },
    {
        path: 'auth/cadastro',
        component: CadastroComponent
    },
    {
        path: 'login',
        redirectTo: 'auth/login'
    },
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth/err',
        component: ErrComponent
    },
    {
        path: 'cliente',
        component: ClienteComponent,
        canActivate: [authGuard],
        data: { perfis: ['CLIENTE'] }
    },
    {
        path: 'funcionario',
        redirectTo: 'funcionario/login-funcionario'
    },
    {
        path: 'funcionario/solicitacoes',
        component: SolicitacaoFuncionarioComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'funcionario/categorias',
        component: CategoriasComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'funcionario/lista-funcionarios',
        component: ListaFuncionariosComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'funcionario/login-funcionario',
        component: LoginFuncionarioComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'funcionario/receitas/periodo',
        component: RelatorioPeriodoComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'funcionario/receitas/categoria',
        component: RelatorioCategoriasComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'efetuar-orcamento/:id',
        component: EfetuarOrcamentoComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'manutencao/:id',
        component: ManutencaoComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    },
    {
        path: 'redirecionamento/:id',
        component: RedirecionamentoComponent,
        canActivate: [authGuard],
        data: { perfis: ['FUNCIONARIO'] }
    }
]