import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ReparateurService } from '../../../core/services/reparateur';

@Component({
  selector: 'app-reparateur-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparateur-produits.html',
  styleUrls: ['./reparateur-produits.css']
})
export class ReparateurProduitsComponent implements OnInit {
  produits: any[] = [];
  clients: any[] = [];
  categories: any[] = [];
  loading = true;
  showModal = false;
  viewingProduit: any = null;
  observationInput = '';
  searchQuery = '';
  statusFilter = 'TOUS';
  categoryFilter = 'TOUS';
  errorMessage = '';

  formData = {
    nom: '',
    descriptionPanne: '',
    clientEmail: '',
    categorieId: null as number | null
  };

  statuts = ['RECU', 'EN_COURS', 'REPARE', 'PRET'];

  constructor(
    private reparateurService: ReparateurService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadClients();
    this.loadCategories();
  }

  loadProduits(): void {
    this.loading = true;
    this.reparateurService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.logError('Erreur chargement produits:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClients(): void {
    this.reparateurService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => this.logError('Erreur chargement clients:', err)
    });
  }

  loadCategories(): void {
    this.reparateurService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => this.logError('Erreur chargement catégories:', err)
    });
  }

  get filteredProduits(): any[] {
    let result = this.produits;
    if (this.statusFilter !== 'TOUS') {
      result = result.filter(p => p.statut === this.statusFilter);
    }
    if (this.categoryFilter !== 'TOUS') {
      result = result.filter(p => p.categorie?.id === +this.categoryFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nom?.toLowerCase().includes(q) ||
        p.client?.nom?.toLowerCase().includes(q) ||
        p.client?.prenom?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  resetFilters(): void {
    this.statusFilter = 'TOUS';
    this.categoryFilter = 'TOUS';
    this.searchQuery = '';
  }

  openAddModal(): void {
    this.formData = { nom: '', descriptionPanne: '', clientEmail: '', categorieId: null };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProduit(): void {
    if (!this.formData.nom || !this.formData.descriptionPanne || !this.formData.clientEmail || !this.formData.categorieId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.reparateurService.createProduit(this.formData).subscribe({
      next: () => {
        this.loadProduits();
        this.closeModal();
      },
      error: (err: any) => this.logError('Erreur création produit:', err)
    });
  }

  updateStatut(id: number, statut: string): void {
    this.reparateurService.updateProduitStatut(id, statut).subscribe({
      next: () => {
        this.loadProduits();
      },
      error: (err: any) => this.logError('Erreur mise à jour statut:', err)
    });
  }

  openViewModal(p: any): void {
    this.viewingProduit = p;
    this.observationInput = p.observation || '';
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.viewingProduit = null;
    this.observationInput = '';
    this.cdr.detectChanges();
  }

  saveObservation(): void {
    if (!this.viewingProduit) return;
    this.reparateurService.updateProduitObservation(this.viewingProduit.id, this.observationInput).subscribe({
      next: () => {
        this.viewingProduit.observation = this.observationInput;
        this.loadProduits();
        this.closeViewModal();
      },
      error: (err: any) => this.logError('Erreur enregistrement observation:', err)
    });
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'RECU': '#EF4444',
      'EN_COURS': '#F59E0B',
      'REPARE': '#10B981',
      'PRET': '#3B82F6'
    };
    return colors[statut] || '#6B7280';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'RECU': 'Reçu',
      'EN_COURS': 'En cours',
      'REPARE': 'Réparé',
      'PRET': 'Prêt'
    };
    return labels[statut] || statut;
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
