import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait until Supabase has resolved the initial session before deciding
  return toObservable(auth.sessionLoaded).pipe(
    filter((loaded) => loaded),
    take(1),
    map(() =>
      auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login'])
    )
  );
};
