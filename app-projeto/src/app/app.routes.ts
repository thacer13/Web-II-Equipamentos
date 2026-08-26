import { Routes } from '@angular/router';
import{LoginComponent} from './auth/login/login';
import { HomeComponent } from './inicial/home';
import { CadastroComponent } from './auth/cadastro/cadastro';
import { ClienteComponent } from './cliente/cliente.component';

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
        component: HomeComponent
    
    },
    {
        path: 'cliente',
        component: ClienteComponent
    
    }
]