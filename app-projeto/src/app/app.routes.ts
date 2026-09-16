import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ErrComponent } from './auth/err/err';
import { ClienteComponent } from './cliente/cliente.component';
import { FuncionarioComponent } from './funcionario/funcionario';
import { EfetuarOrcamentoComponent } from './efetuar-orcamento/efetuar-orcamento.component';
import { CategoriasComponent } from './funcionario/categorias/categorias';
import { FuncionariosComponent } from './funcionario/funcionarios/funcionarios';

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
        path: 'funcionario/funcionarios',
        component: FuncionariosComponent
    },
    {
        path: 'efetuar-orcamento/:id',
        component: EfetuarOrcamentoComponent
    }
]