import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ErrComponent } from './auth/err/err';
import { ClienteComponent } from './cliente/cliente.component';
import { SolicitacaoFuncionarioComponent } from './funcionario/solicitacoes/solicitacao-funcionario';
import { EfetuarOrcamentoComponent } from './efetuar-orcamento/efetuar-orcamento.component';
import { CategoriasComponent } from './funcionario/categorias/categorias';
import { FuncionariosComponent } from './funcionario/lista-funcionarios/funcionarios';
import { LoginFuncionarioComponent } from './funcionario/login-funcionario/login-funcionario';
import { RelatorioPeriodoComponent } from './funcionario/relatorio-periodo/relatorio-periodo';
import { RelatorioCategoriasComponent } from './funcionario/relatorio-categorias/relatorio-categorias';
import { RedirecionamentoComponent } from './funcionario/manutencao/redirecionamento';
import { ManutencaoComponent } from './funcionario/manutencao/manutencao';

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
        component: ClienteComponent
    },
    {
        path: 'funcionario/solicitacoes',
        component: SolicitacaoFuncionarioComponent
    },
    {
        path: 'funcionario/categorias',
        component: CategoriasComponent
    },
    {
        path: 'funcionario/lista-funcionarios',
        component: FuncionariosComponent
    },
    {
        path: 'funcionario/login-funcionario',
        component: LoginFuncionarioComponent
    },
    {
        path: 'funcionario/receitas/periodo',
        component: RelatorioPeriodoComponent
    },
    {
        path: 'funcionario/receitas/categoria',
        component: RelatorioCategoriasComponent
    },
    {
        path: 'efetuar-orcamento/:id',
        component: EfetuarOrcamentoComponent
    },
    {
        path: 'manutencao/:id',
        component: ManutencaoComponent
    },
    {
        path: 'redirecionamento/:id',
        component: RedirecionamentoComponent
    }
]