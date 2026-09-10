import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ErrComponent } from './auth/err/err';
import { ClienteComponent } from './cliente/cliente.component';
import { FuncionarioComponent } from './funcionario/funcionario';
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
        path: 'funcionario',
        component: FuncionarioComponent
    },
     {
        path: 'manutencao',
        component: ManutencaoComponent
    }
]

