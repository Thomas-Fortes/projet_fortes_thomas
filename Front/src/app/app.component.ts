import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FavoritesState } from './store/favorites.state';
import { AuthState, Logout } from './store/auth.state';
import { User } from './models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EcoSignal';
  mobileMenuOpen = false;

  @Select(FavoritesState.getFavoritesCount) favoritesCount$!: Observable<number>;
  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.getUser) user$!: Observable<User | null>;

  constructor(
    private store: Store,
    private router: Router
  ) {}

  logout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
