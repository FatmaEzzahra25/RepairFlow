import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${API_BASE_URL}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
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

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/produits`);
  }

  deleteProduit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produits/${id}`);
  }
}
