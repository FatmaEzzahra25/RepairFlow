import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ReparateurService } from '../../../core/services/reparateur';

@Component({
  selector: 'app-reparateur-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparateur-reclamations.html',
  styleUrls: ['./reparateur-reclamations.css']
})
export class ReparateurReclamationsComponent implements OnInit {
  reclamations = signal<any[]>([]);
  loading = signal(true);

  selectedReclamation = signal<any | null>(null);
  showViewModal = signal(false);
  showContactModal = signal(false);

  statusFilter = 'TOUS';
  searchQuery = '';

  constructor(
    private reparateurService: ReparateurService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
    this.searchQuery = '';
  }

  loadReclamations(): void {
    this.loading.set(true);

    this.reparateurService.getReclamations().subscribe({
      next: (data) => {
        this.reclamations.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.logError('Erreur chargement réclamations:', err);
        this.loading.set(false);
      }
    });
  }

  get filteredReclamations(): any[] {
    let result = this.reclamations() || [];
    if (this.statusFilter !== 'TOUS') {
      result = result.filter(r => r.statut === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.produit?.nom?.toLowerCase().includes(q) ||
        r.produit?.client?.nom?.toLowerCase().includes(q) ||
        r.produit?.client?.prenom?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  cloturerReclamation(id: number): void {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm('Clôturer cette réclamation ?')) {
        this.reparateurService.cloturerReclamation(id).subscribe({
          next: () => this.loadReclamations(),
          error: (err: any) => this.logError('Erreur clôture:', err)
        });
      }
    }
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }

  openViewReclamation(r: any): void {
    this.selectedReclamation.set(r);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedReclamation.set(null);
  }

  contactClient(r: any): void {
    this.selectedReclamation.set(r);
    this.showContactModal.set(true);
  }

  closeContactModal(): void {
    this.showContactModal.set(false);
    this.selectedReclamation.set(null);
  }
}
