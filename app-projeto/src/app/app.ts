import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {RouterModule} from '@angular/router';
import { DevNavComponent } from './shared/dev-nav/dev-nav.component';
import { TopbarComponent } from './shared/topbar/topbar.component';
import { UsuarioService } from './shared/services/usuario.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, DevNavComponent, TopbarComponent],
  standalone: true,
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  get temUsuarioLogado(): boolean {
    return isPlatformBrowser(this.platformId) && !!this.usuarioService.obterUsuarioLogado();
  }

  logout(): void {
    this.usuarioService.logout();
    this.router.navigate(['/auth/login']);
  }
}
