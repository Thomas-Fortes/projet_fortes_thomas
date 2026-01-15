import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pollution } from '../models/pollution.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PollutionService {
  private apiUrl = `${environment.apiUrl}/pollutions`;

  constructor(private http: HttpClient) { }

  /**
   * Obtenir toutes les pollutions avec filtres optionnels
   */
  getAllPollutions(filters?: { search?: string; type?: string; statut?: string }): Observable<Pollution[]> {
    let params = new HttpParams();
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.statut) {
      params = params.set('statut', filters.statut);
    }
    return this.http.get<Pollution[]>(this.apiUrl, { params });
  }

  /**
   * Obtenir une pollution par son ID
   */
  getPollutionById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une nouvelle pollution (JSON)
   */
  createPollution(pollution: Pollution): Observable<Pollution> {
    return this.http.post<Pollution>(this.apiUrl, pollution);
  }

  /**
   * Créer une nouvelle pollution avec fichier (FormData)
   */
  createPollutionWithFile(formData: FormData): Observable<Pollution> {
    return this.http.post<Pollution>(this.apiUrl, formData);
  }

  /**
   * Mettre à jour une pollution existante (JSON)
   */
  updatePollution(id: number, pollution: Partial<Pollution>): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.apiUrl}/${id}`, pollution);
  }

  /**
   * Mettre à jour une pollution avec fichier (FormData)
   */
  updatePollutionWithFile(id: number, formData: FormData): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Supprimer une pollution
   */
  deletePollution(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtenir les pollutions de l'utilisateur connecté
   */
  getMyPollutions(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(`${this.apiUrl}/user/me`);
  }
}
