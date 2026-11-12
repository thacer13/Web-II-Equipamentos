import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-err',
  standalone: true,
  imports: [RouterModule, FormsModule, InputTextModule, FloatLabelModule, ButtonModule],
  templateUrl: './err.html',
  styleUrls: ['./err.css'],
})
export class ErrComponent {
  email = '';
  loading = false;
  mensagemErro = '';
  mensagemSucesso = '';

  private readonly usuarioService = inject(UsuarioService);
  private readonly cdr = inject(ChangeDetectorRef);

  onSubmit(): void {
    const email = this.email.trim().toLowerCase();
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!email || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.mensagemErro = 'Informe um e-mail válido.';
      return;
    }

    this.loading = true;
    this.usuarioService.recuperarSenha(email).subscribe({
      next: () => {
        this.mensagemSucesso =
          'Se o e-mail estiver cadastrado, uma senha temporária será enviada para ele.';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (_erro: unknown) => {
        this.mensagemErro = 'Não foi possível processar a solicitação. Tente novamente mais tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}