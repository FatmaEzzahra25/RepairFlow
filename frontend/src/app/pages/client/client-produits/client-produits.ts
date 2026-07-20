import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ClientService } from '../../../core/services/client';

@Component({
  selector: 'app-client-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-produits.html',
  styleUrls: ['./client-produits.css']
})
export class ClientProduitsComponent implements OnInit {
  produits: any[] = [];
  loading = true;
  showReclamationModal = false;
  selectedProduit: any = null;
  errorMessage = '';

  reclamationForm = {
    produitId: null as number | null,
    typeProbleme: '',
    description: ''
  };

  typesProbleme = [
    'Dysfonctionnement après réparation',
    'Problème non résolu',
    'Nouveau problème',
    'Autre'
  ];

  statuts = ['RECU', 'EN_COURS', 'REPARE', 'PRET'];

  constructor(
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.clientService.getMesProduits().subscribe({
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

  getStatusIndex(statut: string): number {
    return this.statuts.indexOf(statut);
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'RECU': '#10B981',
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

  isStepActive(produitStatut: string, stepIndex: number): boolean {
    const currentIndex = this.getStatusIndex(produitStatut);
    return stepIndex <= currentIndex;
  }

  isStepCurrent(produitStatut: string, stepIndex: number): boolean {
    return this.getStatusIndex(produitStatut) === stepIndex;
  }

  openReclamationModal(produit: any): void {
    this.selectedProduit = produit;
    this.reclamationForm = {
      produitId: produit.id,
      typeProbleme: '',
      description: ''
    };
    this.showReclamationModal = true;
  }

  closeReclamationModal(): void {
    this.showReclamationModal = false;
    this.selectedProduit = null;
  }

  saveReclamation(): void {
    if (!this.reclamationForm.produitId || !this.reclamationForm.typeProbleme || !this.reclamationForm.description) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.clientService.createReclamation({
      produitId: this.reclamationForm.produitId,
      description: `[${this.reclamationForm.typeProbleme}] ${this.reclamationForm.description}`
    }).subscribe({
      next: () => {
        this.closeReclamationModal();
        alert('Réclamation envoyée avec succès !');
      },
      error: (err: any) => this.logError('Erreur création réclamation:', err)
    });
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
