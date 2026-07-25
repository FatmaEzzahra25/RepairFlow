import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ReparateurService } from '../../../core/services/reparateur';
import { API_BASE_URL } from '../../../core/services/api.config';

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

  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  isDraggingPhoto = false;
  uploadingPhoto = false;

  formData = {
    nom: '',
    descriptionPanne: '',
    clientEmail: '',
    categorieId: null as number | null
  };

  statuts = ['RECU', 'EN_COURS', 'REPARE', 'PRET', 'LIVRE'];

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
    this.resetPhotoSelection();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetPhotoSelection();
  }

  resetPhotoSelection(): void {
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
    this.isDraggingPhoto = false;
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private setPhotoFile(file: File): void {
    if (!this.isImageFile(file)) {
      this.errorMessage = 'Le fichier doit être une image.';
      return;
    }
    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string;
      this.cdr.detectChanges();

      // En mode "édition" (modal détails d'un produit existant), on envoie
      // la photo tout de suite : pas besoin d'un clic supplémentaire.
      if (this.viewingProduit) {
        this.uploadPhotoForViewingProduit();
      }
    };
    reader.readAsDataURL(file);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setPhotoFile(input.files[0]);
    }
  }

  onPhotoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = true;
  }

  onPhotoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = false;
  }

  onPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.setPhotoFile(files[0]);
    }
  }

  removeSelectedPhoto(): void {
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
  }

  saveProduit(): void {
    if (!this.formData.nom || !this.formData.descriptionPanne || !this.formData.clientEmail || !this.formData.categorieId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.reparateurService.createProduit(this.formData).subscribe({
      next: (created: any) => {
        if (this.selectedPhotoFile && created?.id) {
          this.uploadingPhoto = true;
          this.reparateurService.uploadProduitPhoto(created.id, this.selectedPhotoFile).subscribe({
            next: () => {
              this.uploadingPhoto = false;
              this.loadProduits();
              this.closeModal();
            },
            error: (err: any) => {
              this.uploadingPhoto = false;
              this.logError('Erreur upload photo:', err);
              this.loadProduits();
              this.closeModal();
            }
          });
        } else {
          this.loadProduits();
          this.closeModal();
        }
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
    this.resetPhotoSelection();
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.viewingProduit = null;
    this.observationInput = '';
    this.resetPhotoSelection();
    this.cdr.detectChanges();
  }

  uploadPhotoForViewingProduit(): void {
    if (!this.viewingProduit || !this.selectedPhotoFile) return;
    this.uploadingPhoto = true;
    this.reparateurService.uploadProduitPhoto(this.viewingProduit.id, this.selectedPhotoFile).subscribe({
      next: (updated: any) => {
        this.uploadingPhoto = false;
        this.viewingProduit.photoUrl = updated.photoUrl;
        this.resetPhotoSelection();
        this.loadProduits();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.uploadingPhoto = false;
        this.logError('Erreur upload photo:', err);
      }
    });
  }

  getPhotoUrl(photoUrl: string | null | undefined): string {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http')) return photoUrl;
    const serverRoot = API_BASE_URL.replace(/\/api\/v1$/, '');
    return `${serverRoot}${photoUrl}`;
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
      'PRET': '#3B82F6',
      'LIVRE': '#8B5CF6'
    };
    return colors[statut] || '#6B7280';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'RECU': 'Reçu',
      'EN_COURS': 'En cours',
      'REPARE': 'Réparé',
      'PRET': 'Prêt',
      'LIVRE': 'Livré'
    };
    return labels[statut] || statut;
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
