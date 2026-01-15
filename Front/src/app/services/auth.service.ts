import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, AuthResponse, RefreshResponse } from '../models/auth.model';
import { Login, Logout, RefreshTokens } from '../store/auth.state';
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
   */
  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap(response => {
        this.store.dispatch(new Login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        }));
      })
    );
  }

  /**
   * Connexion d'un utilisateur
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.store.dispatch(new Login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        }));
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.store.dispatch(new Logout());
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.store.dispatch(new RefreshTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        }));
      })
    );
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(data: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, data);
  }
}
