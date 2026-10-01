import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-login',
  imports: [InputTextModule, ButtonModule, FloatLabelModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  mensagemErro = '';
  lembrarCredenciais = false;

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  constructor() {
    const credenciais = this.usuarioService.obterCredenciaisLembradas();
    if (credenciais) {
      this.username = credenciais.email;
      this.password = credenciais.senha;
      this.lembrarCredenciais = true;
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.mensagemErro = '';

    setTimeout(() => {
      const usuarioEncontrado = this.usuarioService.buscarPorEmail(this.username);

      if (!usuarioEncontrado) {
        this.mensagemErro = 'Usuário não encontrado.';
        this.loading = false;
        return;
      }

      if (usuarioEncontrado.senha !== this.password) {
        this.mensagemErro = 'Senha incorreta.';
        this.loading = false;
        return;
      }

      if (this.lembrarCredenciais) {
        this.usuarioService.lembrarCredenciais(this.username, this.password);
      } else {
        this.usuarioService.esquecerCredenciais();
      }

      this.usuarioService.salvarUsuarioLogado(usuarioEncontrado);

      if (usuarioEncontrado.perfil === 'CLIENTE') {
        this.router.navigate(['/cliente']); 
      } else if (usuarioEncontrado.perfil === 'FUNCIONARIO') {
        this.router.navigate(['/funcionario']);
      }

      this.loading = false;
    }, 1000);
  }
}