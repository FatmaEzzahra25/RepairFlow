import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.getRole();

    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    if (role === 'ROLE_ADMIN') {
      router.navigate(['/admin/dashboard']);
    } else if (role === 'ROLE_REPARATEUR') {
      router.navigate(['/reparateur/dashboard']);
    } else {
      router.navigate(['/client/dashboard']);
    }
    return false;
  };
};
