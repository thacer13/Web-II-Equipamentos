import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';
import { Perfil } from '../models/usuario.model';

export const authGuard: CanActivateFn = (route) => {
  const platformId = inject(PLATFORM_ID);
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const loginUrl = router.createUrlTree(['/auth/login']);
  const perfisPermitidos = route.data['perfis'] as Perfil[] | undefined;

  return usuarioService.validarSessao().pipe(
    map(usuario => {
      if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
        return router.createUrlTree(['/auth/err']);
      }
      return true;
    }),
    catchError(() => {
      usuarioService.limparUsuarioLogado();
      return of(loginUrl);
    })
  );
};