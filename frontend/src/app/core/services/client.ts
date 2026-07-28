import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = API_BASE_URL;
  constructor(private http: HttpClient) {}

  getMesProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/produits/mes-produits`);
  }

  getMesReclamations(statut?: string | null): Observable<any[]> {
    let params = new HttpParams();
    if (statut && statut !== 'TOUS') params = params.set('statut', statut);
    return this.http.get<any[]>(`${this.apiUrl}/reclamations/mes-reclamations`, { params });
  }

  createReclamation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reclamations`, data);
  }
}
