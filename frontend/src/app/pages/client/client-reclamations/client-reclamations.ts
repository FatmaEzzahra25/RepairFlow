import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ClientService } from '../../../core/services/client';

@Component({
  selector: 'app-client-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-reclamations.html',
  styleUrls: ['./client-reclamations.css']
})
export class ClientReclamationsComponent implements OnInit {
  reclamations: any[] = [];
  loading = true;
  statusFilter = 'TOUS';

  constructor(
    private clientService: ClientService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    this.clientService.getMesReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.logError('Erreur chargement réclamations:', err);
        this.loading = false;
      }
    });
  }

  get filteredReclamations(): any[] {
    if (this.statusFilter === 'TOUS') return this.reclamations;
    return this.reclamations.filter(r => r.statut === this.statusFilter);
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}