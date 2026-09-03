import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ClienteComponent } from './cliente/cliente.component';
import { FuncionarioComponent } from './funcionario/funcionario';

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
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    
    },
    {
        path: 'cliente',
        component: ClienteComponent
    
    },
    {
        path: 'funcionario',
        component: FuncionarioComponent
    }
    
]