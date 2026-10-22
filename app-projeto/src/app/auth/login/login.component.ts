import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Pool } from "pg"

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
    const databaseUrl = process.env["DATABASE_URL"];

    if (!databaseUrl) {
      throw new Error("DATABASE_URL não está definida");
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const email = this.username.trim().toLowerCase();
    const senha = this.password.trim();

    async function getUser(email: string, password: string) {
      const client = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND senha = $2', [email, password]);
      return client;
    }
    if (!email || !senha) {
      this.mensagemErro = 'Informe e-mail e senha.';
      return;
    }

    if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.mensagemErro = 'Informe um e-mail válido.';
      return;
    }

    this.loading = true;
    this.mensagemErro = '';

    setTimeout(() => {
      const usuarioEncontrado = this.usuarioService.buscarPorEmail(email);

      if (!usuarioEncontrado) {
        this.mensagemErro = 'Usuário não encontrado.';
        this.loading = false;
        return;
      }

      if (usuarioEncontrado.senha !== senha) {
        this.mensagemErro = 'Senha incorreta.';
        this.loading = false;
        return;
      }

      if (this.lembrarCredenciais) {
        this.usuarioService.lembrarCredenciais(email, senha);
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