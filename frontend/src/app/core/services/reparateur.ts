import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ReparateurService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/produits`);
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

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reparateur/clients`);
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

  getReclamations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reparateur/reclamations`);
  }

  cloturerReclamation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reparateur/reclamations/${id}/cloturer`, {});
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reparateur/stats`);
  }
}
