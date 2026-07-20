import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-admin-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrls: ['./produits.css']
})
export class AdminProduitsComponent implements OnInit {
  produits: any[] = [];
  reparateurs: { id: number; nom: string }[] = [];
  loading = true;

  selectedReparateurId: string = 'TOUS';
  statutFilter: string = 'TOUS';
  searchTerm: string = '';

  statutLabels: Record<string, string> = {
    RECU: 'Reçu',
    EN_COURS: 'En cours',
    REPARE: 'Réparé',
    PRET: 'Prêt'
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.adminService.getProduits().subscribe({
      next: (data) => {
        this.produits = data || [];
        this.buildReparateursList();
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

  private buildReparateursList(): void {
    const map = new Map<number, string>();
    for (const p of this.produits) {
      if (p.reparateur && p.reparateur.id) {
        const nomComplet = `${p.reparateur.prenom || ''} ${p.reparateur.nom || ''}`.trim() || p.reparateur.email;
        map.set(p.reparateur.id, nomComplet);
      }
    }
    this.reparateurs = Array.from(map.entries()).map(([id, nom]) => ({ id, nom }));
  }

  get filteredProduits(): any[] {
    return this.produits.filter(p => {
      const matchReparateur =
        this.selectedReparateurId === 'TOUS' ||
        (p.reparateur && String(p.reparateur.id) === this.selectedReparateurId);

      const matchStatut = this.statutFilter === 'TOUS' || p.statut === this.statutFilter;

      const term = this.searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        (p.nom || '').toLowerCase().includes(term) ||
        (p.client && `${p.client.prenom || ''} ${p.client.nom || ''}`.toLowerCase().includes(term));

      return matchReparateur && matchStatut && matchSearch;
    });
  }

  resetFilters(): void {
    this.selectedReparateurId = 'TOUS';
    this.statutFilter = 'TOUS';
    this.searchTerm = '';
  }

  clientNom(p: any): string {
    if (!p.client) return '—';
    return `${p.client.prenom || ''} ${p.client.nom || ''}`.trim() || p.client.email;
  }

  reparateurNom(p: any): string {
    if (!p.reparateur) return '—';
    return `${p.reparateur.prenom || ''} ${p.reparateur.nom || ''}`.trim() || p.reparateur.email;
  }

  statutClass(p: any): string {
    return (p.statut || '').toLowerCase();
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
