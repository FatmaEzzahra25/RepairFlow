import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ProfilService {
  private apiUrl = `${API_BASE_URL}/utilisateurs`;

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadMe(): void {
    this.getMe().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateMe(data: { nom?: string; prenom?: string; telephone?: string; adresse?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  changePassword(data: { ancienMotDePasse: string; nouveauMotDePasse: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/password`, data);
  }

  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`${this.apiUrl}/me/photo`, formData).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  getPhotoUrl(photoUrl: string | null | undefined): string {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http')) return photoUrl;
    const serverRoot = API_BASE_URL.replace(/\/api\/v1$/, '');
    return `${serverRoot}${photoUrl}`;
  }
}
