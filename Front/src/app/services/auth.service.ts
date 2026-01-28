import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.model';
import { Login, Logout } from '../store/auth.state';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   * Les tokens sont stockés dans des cookies HttpOnly par le serveur
   */
  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data, { withCredentials: true }).pipe(
      tap(response => {
        // On ne stocke que les infos user dans le store (pas les tokens)
        this.store.dispatch(new Login({ user: response.user }));
      })
    );
  }

  /**
   * Connexion d'un utilisateur
   * Les tokens sont stockés dans des cookies HttpOnly par le serveur
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data, { withCredentials: true }).pipe(
      tap(response => {
        // On ne stocke que les infos user dans le store (pas les tokens)
        this.store.dispatch(new Login({ user: response.user }));
      })
    );
  }

  /**
   * Déconnexion - appelle le serveur pour supprimer les cookies
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.store.dispatch(new Logout());
      })
    );
  }

  /**
   * Rafraîchir le token (le serveur lit le cookie refreshToken)
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user) {
          this.store.dispatch(new Login({ user: response.user }));
        }
      })
    );
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, { withCredentials: true });
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(data: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, data, { withCredentials: true });
  }
}
