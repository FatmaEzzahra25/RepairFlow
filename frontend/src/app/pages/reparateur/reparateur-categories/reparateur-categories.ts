import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ReparateurService } from '../../../core/services/reparateur';

@Component({
  selector: 'app-reparateur-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparateur-categories.html',
  styleUrls: ['./reparateur-categories.css']
})
export class ReparateurCategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = true;

  constructor(
    private reparateurService: ReparateurService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.reparateurService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err: any) => {
        if (isPlatformBrowser(this.platformId)) {
          console.error('Erreur chargement catégories:', err);
        }
        this.loading = false;
      }
    });
  }
}