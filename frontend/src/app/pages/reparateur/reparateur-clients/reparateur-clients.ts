import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReparateurService } from '../../../core/services/reparateur';

@Component({
  selector: 'app-reparateur-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparateur-clients.html',
  styleUrls: ['./reparateur-clients.css']
})
export class ReparateurClientsComponent implements OnInit, OnDestroy {
  clients: any[] = [];
  loading = true;
  showModal = false;
  isEdit = false;
  editingId: number | null = null;
  searchQuery = '';
  showPassword = false;
  errorMessage = '';

  formData = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    motDePasse: '',
    envoyerEmail: true
  };

  private searchChanged = new Subject<void>();

  constructor(
    private reparateurService: ReparateurService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadClients());

    this.loadClients();
  }

  ngOnDestroy(): void {
    this.searchChanged.complete();
  }

  loadClients(): void {
    this.loading = true;
    this.reparateurService.getClients(this.searchQuery).subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.logError('Erreur chargement clients:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.searchChanged.next();
  }

  getInitials(prenom: string, nom: string): string {
    const p = prenom ? prenom.charAt(0).toUpperCase() : '';
    const n = nom ? nom.charAt(0).toUpperCase() : '';
    return p + n || '👤';
  }

  openAddModal(): void {
    this.isEdit = false;
    this.editingId = null;
    this.showPassword = false;
    this.formData = {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      motDePasse: '',
      envoyerEmail: true
    };
    this.showModal = true;
  }

  openEditModal(client: any): void {
    this.isEdit = true;
    this.editingId = client.id;
    this.showPassword = false;
    this.formData = {
      prenom: client.prenom,
      nom: client.nom,
      email: client.email,
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      motDePasse: '',
      envoyerEmail: false
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveClient(): void {
    if (!this.formData.prenom || !this.formData.nom || !this.formData.email || !this.formData.telephone ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const data = { ...this.formData };

    if (this.isEdit && this.editingId) {
      if (data.motDePasse && data.motDePasse.trim() !== '') {
        data.envoyerEmail = true;
      } else {
        delete (data as any).motDePasse;
        delete (data as any).envoyerEmail;
      }

      this.reparateurService.updateClient(this.editingId, data).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (err: any) => this.logError('Erreur modification client:', err)
      });
    } else {
      this.reparateurService.createClient(data).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (err: any) => this.logError('Erreur création client:', err)
      });
    }
  }

  deleteClient(id: number): void {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm('Supprimer ce client ?')) {
        this.reparateurService.deleteClient(id).subscribe({
          next: () => this.loadClients(),
          error: (err: any) => this.logError('Erreur suppression client:', err)
        });
      }
    }
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
