import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ReparateurService } from '../../../core/services/reparateur';

@Component({
  selector: 'app-reparateur-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparateur-dashboard.html',
  styleUrls: ['./reparateur-dashboard.css']
})
export class ReparateurDashboardComponent implements OnInit {
  stats: any = {
    totalProduits: 0,
    produitsEnCours: 0,
    produitsRepares: 0,
    totalClients: 0,
    reclamationsOuvertes: 0
  };

  produitsParCategorie: Record<string, number> = {};
  produitsParStatut: Record<string, number> = {};
  activiteParJour: Record<string, number> = {};

  loading = true;

  constructor(
    private reparateurService: ReparateurService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadProduits();
  }

  loadStats(): void {
    this.loading = true;
    this.reparateurService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.logError('Erreur stats:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProduits(): void {
    this.reparateurService.getProduits().subscribe({
      next: (produits) => {
        this.buildCategorieBreakdown(produits);
        this.buildStatutBreakdown(produits);
        this.buildActiviteBreakdown(produits);
        this.cdr.detectChanges();
      },
      error: (err: any) => this.logError('Erreur produits:', err)
    });
  }

  private buildCategorieBreakdown(produits: any[]): void {
    const map: Record<string, number> = {};
    for (const p of produits) {
      const cat = p.categorie?.libelle || 'Non catégorisé';
      map[cat] = (map[cat] || 0) + 1;
    }
    this.produitsParCategorie = map;
  }

  private buildStatutBreakdown(produits: any[]): void {
    const map: Record<string, number> = {};
    for (const p of produits) {
      const statut = p.statut || 'INCONNU';
      map[statut] = (map[statut] || 0) + 1;
    }
    this.produitsParStatut = map;
  }

  private buildActiviteBreakdown(produits: any[]): void {
    const map: Record<string, number> = {};
    const aujourdhui = new Date();
    for (let i = 15; i >= 0; i--) {
      const jour = new Date(aujourdhui);
      jour.setDate(jour.getDate() - i);
      const key = jour.toISOString().slice(0, 10);
      map[key] = 0;
    }
    for (const p of produits) {
      if (p.dateDepot) {
        const key = String(p.dateDepot).slice(0, 10);
        if (key in map) {
          map[key]++;
        }
      }
    }
    this.activiteParJour = map;
  }

  get totalProduitsCategorie(): number {
    return Object.values(this.produitsParCategorie).reduce((a, b) => a + b, 0);
  }

  getBarHeight(value: number): number {
    const values = Object.values(this.activiteParJour);
    const max = values.length ? Math.max(1, ...values) : 1;
    return value === 0 ? 2 : Math.max(6, (value / max) * 100);
  }

  getFirstDay(): string {
    const keys = Object.keys(this.activiteParJour);
    return keys.length ? keys[0] : '';
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
