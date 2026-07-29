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

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  statutLabels: Record<string, string> = {
    RECU: 'Reçu',
    EN_COURS: 'En cours',
    REPARE: 'Réparé',
    PRET: 'Prêt'
  };

  private searchChanged = new Subject<string>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadProduits();
    });

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
      q: this.searchTerm,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (data) => {
        this.produits = data?.content || [];
        this.totalPages = data?.totalPages ?? 0;
        this.totalElements = data?.totalElements ?? 0;
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

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProduits();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
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
    this.currentPage = 0;
    this.loadProduits();
  }

  onSearchChange(): void {
    this.searchChanged.next(this.searchTerm);
  }

  resetFilters(): void {
    this.selectedReparateurId = 'TOUS';
    this.statutFilter = 'TOUS';
    this.searchTerm = '';
    this.currentPage = 0;
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
