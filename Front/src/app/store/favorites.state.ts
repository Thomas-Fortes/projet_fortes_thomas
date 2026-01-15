import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Pollution } from '../models/pollution.model';

export class AddFavorite {
  static readonly type = '[Favorites] Add';
  constructor(public pollution: Pollution) {}
}

export class RemoveFavorite {
  static readonly type = '[Favorites] Remove';
  constructor(public pollutionId: number) {}
}

export class ClearFavorites {
  static readonly type = '[Favorites] Clear';
}

export interface FavoritesStateModel {
  favorites: Pollution[];
}

@State<FavoritesStateModel>({
  name: 'favorites',
  defaults: {
    favorites: []
  }
})
@Injectable()
export class FavoritesState {

  @Selector()
  static getFavorites(state: FavoritesStateModel): Pollution[] {
    return state.favorites;
  }

  @Selector()
  static getFavoritesCount(state: FavoritesStateModel): number {
    return state.favorites.length;
  }

  @Selector()
  static isFavorite(state: FavoritesStateModel) {
    return (pollutionId: number) => {
      return state.favorites.some(p => p.id === pollutionId);
    };
  }

  @Action(AddFavorite)
  addFavorite(ctx: StateContext<FavoritesStateModel>, action: AddFavorite) {
    const state = ctx.getState();
    const alreadyExists = state.favorites.some(p => p.id === action.pollution.id);

    if (!alreadyExists) {
      ctx.patchState({
        favorites: [...state.favorites, action.pollution]
      });
    }
  }

  @Action(RemoveFavorite)
  removeFavorite(ctx: StateContext<FavoritesStateModel>, action: RemoveFavorite) {
    const state = ctx.getState();
    const filteredFavorites = state.favorites.filter(p => p.id !== action.pollutionId);

    ctx.patchState({
      favorites: filteredFavorites
    });
  }

  @Action(ClearFavorites)
  clearFavorites(ctx: StateContext<FavoritesStateModel>) {
    ctx.patchState({
      favorites: []
    });
  }
}
