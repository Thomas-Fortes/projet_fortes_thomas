import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Logout } from '../store/auth.state';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter withCredentials pour envoyer les cookies HttpOnly automatiquement
    // Uniquement pour les requêtes vers notre API
    if (request.url.startsWith(environment.apiUrl)) {
      request = request.clone({
        withCredentials: true
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401 (non autorisé)
        if (error.status === 401) {
          // Vérifier si c'est une erreur de token expiré
          if (error.error?.code === 'TOKEN_EXPIRED') {
            return this.handle401Error(request, next);
          }
          // Sinon, déconnexion
          this.store.dispatch(new Logout());
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      // Le serveur lit le refreshToken depuis le cookie
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          // Rejouer la requête originale (le nouveau token est dans le cookie)
          return next.handle(request.clone({ withCredentials: true }));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.store.dispatch(new Logout());
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(refreshed => refreshed === true),
      take(1),
      switchMap(() => next.handle(request.clone({ withCredentials: true })))
    );
  }
}
