import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ErrComponent } from './auth/err/err';
import { ClienteComponent } from './cliente/cliente.component';
import { FuncionariosComponent } from './funcionario/lista-funcionarios/funcionarios';
import { ManutencaoComponent } from './funcionario/manutencao/manutencao';
import { RedirecionamentoComponent } from './funcionario/manutencao/redirecionamento';

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
        component: FuncionariosComponent
    },
    {
        path: 'manutencao',
        component: ManutencaoComponent
    },
    {
        path: 'redirecionamento',
        component: RedirecionamentoComponent
    }
]