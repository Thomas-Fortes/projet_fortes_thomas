import { User } from './user.model';

export interface Pollution {
  id?: number;
  titre: string;
  description: string;
  type: string;
  localisation: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  statut?: string;
  userId: number;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}
