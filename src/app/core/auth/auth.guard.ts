import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // VERIFICACIÓN SENCILLA
  if (authService.isAuthenticated()) {
    return true; // ¡Pase usted, mi King!
  } else {
    // ¡Alto ahí! No tienes credencial.
    router.navigate(['/login']);
    return false;
  }
};