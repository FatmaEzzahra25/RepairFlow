import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface ProduitsFilter {
  reparateurId?: string | null;
  statut?: string | null;
  q?: string | null;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${API_BASE_URL}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getStatistiques(jours: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques`, { params: { jours: String(jours) } });
  }

  getReparateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reparateurs`);
  }

  createReparateur(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reparateurs`, data);
  }

  updateReparateur(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reparateurs/${id}`, data);
  }

  deleteReparateur(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reparateurs/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  createCategorie(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }

  updateCategorie(id: number, categorie: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, categorie);
  }

  deleteCategorie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  getProduits(filters: ProduitsFilter = {}): Observable<PageResponse<any>> {
    let params = new HttpParams();
    if (filters.reparateurId && filters.reparateurId !== 'TOUS') {
      params = params.set('reparateurId', filters.reparateurId);
    }
    if (filters.statut && filters.statut !== 'TOUS') {
      params = params.set('statut', filters.statut);
    }
    if (filters.q && filters.q.trim()) {
      params = params.set('q', filters.q.trim());
    }
    params = params.set('page', String(filters.page ?? 0));
    params = params.set('size', String(filters.size ?? 10));
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/produits`, { params });
  }

  deleteProduit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produits/${id}`);
  }
}
