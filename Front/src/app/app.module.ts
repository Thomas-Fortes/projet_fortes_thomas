import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';

import { AppComponent } from './app.component';
import { PollutionListComponent } from './components/pollution-list/pollution-list.component';
import { PollutionFormComponent } from './components/pollution-form/pollution-form.component';
import { PollutionDetailComponent } from './components/pollution-detail/pollution-detail.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';

import { PollutionService } from './services/pollution.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

import { FavoritesState } from './store/favorites.state';
import { AuthState } from './store/auth.state';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

// Configuration des routes
const routes: Routes = [
  { path: '', redirectTo: '/pollutions', pathMatch: 'full' },
  { path: 'pollutions', component: PollutionListComponent },
  { path: 'pollutions/new', component: PollutionFormComponent, canActivate: [AuthGuard] },
  { path: 'pollutions/edit/:id', component: PollutionFormComponent, canActivate: [AuthGuard] },
  { path: 'pollutions/:id', component: PollutionDetailComponent },
  { path: 'favorites', component: PollutionListComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [GuestGuard] },
  { path: '**', redirectTo: '/pollutions' }
];

@NgModule({
  declarations: [
    AppComponent,
    PollutionListComponent,
    PollutionFormComponent,
    PollutionDetailComponent,
    UserListComponent,
    UserFormComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgxsModule.forRoot([FavoritesState, AuthState]),
    NgxsStoragePluginModule.forRoot({
      key: ['favorites'],  // Auth n'est plus persisté - la session est vérifiée via cookies HttpOnly
      storage: StorageOption.SessionStorage
    })
  ],
  providers: [
    PollutionService,
    UserService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
