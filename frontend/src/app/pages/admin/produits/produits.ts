import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-admin-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrls: ['./produits.css']
})
export class AdminProduitsComponent implements OnInit, OnDestroy {
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

  private searchChanged = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadProduits());

    this.loadReparateurs();
    this.loadProduits();
  }

  ngOnDestroy(): void {
    this.searchChanged.complete();
  }

  loadProduits(): void {
    this.loading = true;
    this.adminService.getProduits({
      reparateurId: this.selectedReparateurId,
      statut: this.statutFilter,
      q: this.searchTerm
    }).subscribe({
      next: (data) => {
        this.produits = data || [];
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

  private loadReparateurs(): void {
    this.adminService.getReparateurs().subscribe({
      next: (data) => {
        this.reparateurs = (data || []).map((r: any) => ({
          id: r.id,
          nom: `${r.prenom || ''} ${r.nom || ''}`.trim() || r.email
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => this.logError('Erreur chargement réparateurs:', err)
    });
  }

  onFilterChange(): void {
    this.loadProduits();
  }

  onSearchChange(): void {
    this.searchChanged.next();
  }

  resetFilters(): void {
    this.selectedReparateurId = 'TOUS';
    this.statutFilter = 'TOUS';
    this.searchTerm = '';
    this.loadProduits();
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
