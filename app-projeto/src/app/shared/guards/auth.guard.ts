import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { Perfil } from '../models/usuario.model';

export const authGuard: CanActivateFn = (route) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  const usuarioLogado = usuarioService.obterUsuarioLogado();

  if (!usuarioLogado) {
    router.navigate(['/auth/login']);
    return false;
  }

  const perfisPermitidos = route.data['perfis'] as Perfil[] | undefined;

  if (perfisPermitidos && !perfisPermitidos.includes(usuarioLogado.perfil)) {
    router.navigate(['/auth/err']);
    return false;
  }

  return true;
};