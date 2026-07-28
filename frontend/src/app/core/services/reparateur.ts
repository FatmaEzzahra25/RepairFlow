import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ReparateurService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  getProduits(statut?: string | null, categorieId?: string | null, q?: string | null): Observable<any[]> {
    let params = new HttpParams();
    if (statut && statut !== 'TOUS') params = params.set('statut', statut);
    if (categorieId && categorieId !== 'TOUS') params = params.set('categorieId', categorieId);
    if (q && q.trim()) params = params.set('q', q.trim());
    return this.http.get<any[]>(`${this.apiUrl}/produits`, { params });
  }

  getProduitById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/produits/${id}`);
  }

  createProduit(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/produits`, data);
  }

  updateProduitStatut(id: number, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/produits/${id}/statut?statut=${statut}`, {});
  }

  updateProduitObservation(id: number, observation: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/produits/${id}/observation?observation=${observation}`, {});
  }

  uploadProduitPhoto(id: number, photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.post(`${this.apiUrl}/produits/${id}/photo`, formData);
  }

  getClients(q?: string | null): Observable<any[]> {
    let params = new HttpParams();
    if (q && q.trim()) params = params.set('q', q.trim());
    return this.http.get<any[]>(`${this.apiUrl}/reparateur/clients`, { params });
  }

  createClient(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reparateur/clients`, data);
  }

  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reparateur/clients/${id}`, data);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reparateur/clients/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/categories`);
  }

  getReclamations(statut?: string | null, q?: string | null): Observable<any[]> {
    let params = new HttpParams();
    if (statut && statut !== 'TOUS') params = params.set('statut', statut);
    if (q && q.trim()) params = params.set('q', q.trim());
    return this.http.get<any[]>(`${this.apiUrl}/reparateur/reclamations`, { params });
  }

  cloturerReclamation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reparateur/reclamations/${id}/cloturer`, {});
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reparateur/stats`);
  }
}
