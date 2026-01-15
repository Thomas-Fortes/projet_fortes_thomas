import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

// Actions
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: { user: User; accessToken: string; refreshToken: string }) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class RefreshTokens {
  static readonly type = '[Auth] Refresh Tokens';
  constructor(public payload: { accessToken: string; refreshToken: string }) {}
}

export class UpdateUser {
  static readonly type = '[Auth] Update User';
  constructor(public user: User) {}
}

// State Model
export interface AuthStateModel {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  }
})
@Injectable()
export class AuthState {

  @Selector()
  static getUser(state: AuthStateModel): User | null {
    return state.user;
  }

  @Selector()
  static getAccessToken(state: AuthStateModel): string | null {
    return state.accessToken;
  }

  @Selector()
  static getRefreshToken(state: AuthStateModel): string | null {
    return state.refreshToken;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static getUserId(state: AuthStateModel): number | null {
    return state.user?.id || null;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({
      user: action.payload.user,
      accessToken: action.payload.accessToken,
      refreshToken: action.payload.refreshToken,
      isAuthenticated: true
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    });
  }

  @Action(RefreshTokens)
  refreshTokens(ctx: StateContext<AuthStateModel>, action: RefreshTokens) {
    ctx.patchState({
      accessToken: action.payload.accessToken,
      refreshToken: action.payload.refreshToken
    });
  }

  @Action(UpdateUser)
  updateUser(ctx: StateContext<AuthStateModel>, action: UpdateUser) {
    ctx.patchState({
      user: action.user
    });
  }
}
