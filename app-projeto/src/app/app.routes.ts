import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ErrComponent } from './auth/err/err';
import { ClienteComponent } from './cliente/cliente.component';
import { FuncionarioComponent } from './funcionario/solicitacoes/solicitacao-funcionario';
import { EfetuarOrcamentoComponent } from './efetuar-orcamento/efetuar-orcamento.component';
import { CategoriasComponent } from './funcionario/categorias/categorias';
import { FuncionariosComponent } from './funcionario/lista-funcionarios/funcionarios';
import { LoginFuncionarioComponent } from './funcionario/login-funcionario/login-funcionario';

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
        path: 'funcionario',
        component: FuncionarioComponent
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
        path: 'efetuar-orcamento/:id',
        component: EfetuarOrcamentoComponent
    },
    {
        path: 'funcionario/login-funcionario',
        component: LoginFuncionarioComponent
    }
]