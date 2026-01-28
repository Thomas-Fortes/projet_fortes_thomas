import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FavoritesState } from './store/favorites.state';
import { AuthState, Login, Logout } from './store/auth.state';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'EcoSignal';
  mobileMenuOpen = false;

  @Select(FavoritesState.getFavoritesCount) favoritesCount$!: Observable<number>;
  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.getUser) user$!: Observable<User | null>;

  constructor(
    private store: Store,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier si la session est valide au démarrage (cookie HttpOnly)
    this.authService.getProfile().subscribe({
      next: (user) => {
        // Session valide, mettre à jour le store
        this.store.dispatch(new Login({ user }));
      },
      error: () => {
        // Session invalide, s'assurer que le store est vide
        this.store.dispatch(new Logout());
      }
    });
  }

  logout(): void {
    // Appeler l'API pour supprimer les cookies HttpOnly
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // En cas d'erreur, forcer la déconnexion locale
        this.store.dispatch(new Logout());
        this.router.navigate(['/login']);
      }
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
