import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  loading = true;

  errorMessage = '';

  categoryForm = {
    libelle: '',
    description: ''
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.logError('Erreur chargement catégories:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openModal(): void {
    this.resetForm();
    this.isEditing = false;
    this.editingId = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.categoryForm = {
      libelle: '',
      description: ''
    };
  }

  editCategory(cat: any): void {
    this.isEditing = true;
    this.editingId = cat.id;
    this.categoryForm = {
      libelle: cat.libelle || '',
      description: cat.description || ''
    };
    this.showModal = true;
  }

  saveCategory(): void {
    if (!this.categoryForm.libelle || !this.categoryForm.description) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.errorMessage = '';

    const payload = {
      libelle: this.categoryForm.libelle,
      description: this.categoryForm.description
    };

    if (this.isEditing && this.editingId) {
      this.adminService.updateCategorie(this.editingId, payload).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err: any) => this.logError('Erreur modification catégorie:', err)
      });
    } else {
      this.adminService.createCategorie(payload).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err: any) => this.logError('Erreur ajout catégorie:', err)
      });
    }
  }

  deleteCategory(id: number): void {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm('Supprimer cette catégorie ?')) {
        this.adminService.deleteCategorie(id).subscribe({
          next: () => this.loadCategories(),
          error: (err: any) => this.logError('Erreur suppression:', err)
        });
      }
    }
  }

  private logError(message: string, err: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.error(message, err);
    }
  }
}
