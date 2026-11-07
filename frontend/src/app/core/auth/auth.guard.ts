import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protege las rutas privadas: sin sesión, redirige al login. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ready;
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/** Para el login: si ya hay sesión, manda directo al dashboard. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ready;
  return auth.isAuthenticated() ? router.createUrlTree(['/inicio']) : true;
};