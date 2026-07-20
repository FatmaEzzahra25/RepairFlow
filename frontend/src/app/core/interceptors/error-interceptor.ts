import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error) => {
      if (isPlatformBrowser(platformId)) {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          router.navigate(['/login']);
          alert('Votre session a expiré. Veuillez vous reconnecter.');
        } else if (error.status === 403) {
          alert('Accès interdit. Vous n\'avez pas les permissions nécessaires.');
        } else if (error.status === 500) {
          alert('Erreur serveur. Veuillez réessayer plus tard.');
        } else if (error.status === 0) {
          alert('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
        }
      }
      return throwError(() => error);
    })
  );
};
