import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ClientService } from '../../../core/services/client';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css']
})
export class ClientDashboardComponent implements OnInit {
  stats: any = {
    totalProduits: 0,
    enCours: 0,
    prets: 0,
    reclamations: 0
  };

  produitsParStatut: Record<string, number> = {};
  produitsRecents: any[] = [];

  statutLabels: Record<string, string> = {
    RECU: 'Reçu',
    EN_COURS: 'En cours',
    REPARE: 'Réparé',
    PRET: 'Prêt'
  };

  loading = true;

  constructor(
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    this.clientService.getMesProduits().subscribe({
      next: (produits) => {
        this.stats.totalProduits = produits.length;
        this.stats.enCours = produits.filter((p: any) => p.statut === 'EN_COURS').length;
        this.stats.prets = produits.filter((p: any) => p.statut === 'PRET').length;

        this.buildStatutBreakdown(produits);
        this.buildProduitsRecents(produits);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.logError('Erreur produits:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.clientService.getMesReclamations().subscribe({
      next: (reclamations) => {
        this.stats.reclamations = reclamations.length;
        this.cdr.detectChanges();
      },
      error: (err: any) => this.logError('Erreur réclamations:', err)
    });
  }

  private buildStatutBreakdown(produits: any[]): void {
    const map: Record<string, number> = {};
    for (const p of produits) {
      const statut = p.statut || 'INCONNU';
      map[statut] = (map[statut] || 0) + 1;
    }
    this.produitsParStatut = map;
  }

  private buildProduitsRecents(produits: any[]): void {
    this.produitsRecents = [...produits]
      .sort((a, b) => new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime())
      .slice(0, 5);
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
