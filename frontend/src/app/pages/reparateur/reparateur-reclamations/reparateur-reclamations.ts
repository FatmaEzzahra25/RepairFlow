import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReparateurService } from '../../../core/services/reparateur';

@Component({
  selector: 'app-reparateur-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparateur-reclamations.html',
  styleUrls: ['./reparateur-reclamations.css']
})
export class ReparateurReclamationsComponent implements OnInit, OnDestroy {
  reclamations = signal<any[]>([]);
  loading = signal(true);

  selectedReclamation = signal<any | null>(null);
  showViewModal = signal(false);
  showContactModal = signal(false);

  statusFilter = 'TOUS';
  searchQuery = '';

  private searchChanged = new Subject<string>();

  constructor(
    private reparateurService: ReparateurService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadReclamations());

    this.searchQuery = '';
    this.loadReclamations();
  }

  ngOnDestroy(): void {
    this.searchChanged.complete();
  }

  loadReclamations(): void {
    this.loading.set(true);

    this.reparateurService.getReclamations(this.statusFilter, this.searchQuery).subscribe({
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

  onFilterChange(): void {
    this.loadReclamations();
  }

  onSearchChange(): void {
    this.searchChanged.next(this.searchQuery);
  }

  resetFilters(): void {
    this.statusFilter = 'TOUS';
    this.searchQuery = '';
    this.loadReclamations();
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
