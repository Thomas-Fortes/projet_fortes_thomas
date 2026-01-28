import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

// Les tokens sont maintenant dans des cookies HttpOnly (pas dans la réponse JSON)
export interface AuthResponse {
  message: string;
  user: User;
}
