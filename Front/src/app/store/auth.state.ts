import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

// Actions
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: { user: User }) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class UpdateUser {
  static readonly type = '[Auth] Update User';
  constructor(public user: User) {}
}

// State Model - Plus de tokens stockés (ils sont dans les cookies HttpOnly)
export interface AuthStateModel {
  user: User | null;
  isAuthenticated: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
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
      isAuthenticated: true
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      user: null,
      isAuthenticated: false
    });
  }

  @Action(UpdateUser)
  updateUser(ctx: StateContext<AuthStateModel>, action: UpdateUser) {
    ctx.patchState({
      user: action.user
    });
  }
}
