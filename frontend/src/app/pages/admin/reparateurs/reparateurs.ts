import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../../core/services/admin';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-reparateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparateurs.html',
  styleUrls: ['./reparateurs.css']
})
export class ReparateursComponent implements OnInit {
  reparateurs: any[] = [];
  showModal = false;
  isEdit = false;
  editingId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  isDeleting: number | null = null;
  errorMessage = '';

  formData = {
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    adresse: ''
  };

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadReparateurs();
  }

  loadReparateurs(): void {
    this.isLoading = true;
    this.adminService.getReparateurs().subscribe({
      next: (data) => {
        this.reparateurs = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toast.error('Erreur lors du chargement des réparateurs');
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.isEdit = false;
    this.editingId = null;
    this.formData = { prenom: '', nom: '', email: '', motDePasse: '', telephone: '', adresse: '' };
    this.showModal = true;
  }

  openEditModal(rep: any): void {
    this.isEdit = true;
    this.editingId = rep.id;
    this.formData = {
      prenom: rep.prenom || '',
      nom: rep.nom || '',
      email: rep.email || '',
      motDePasse: '',
      telephone: rep.telephone || '',
      adresse: rep.adresse || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveReparateur(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email || !this.formData.motDePasse ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.isSubmitting = false;
      return;
    }

    this.errorMessage = '';

    if (this.isEdit && this.editingId) {
      this.adminService.updateReparateur(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadReparateurs();
          this.closeModal();
          this.isSubmitting = false;
          this.toast.success('Réparateur modifié avec succès ✅');
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.toast.error('Erreur lors de la modification ❌');
        }
      });
    } else {
      this.adminService.createReparateur(this.formData).subscribe({
        next: () => {
          this.loadReparateurs();
          this.closeModal();
          this.isSubmitting = false;
          this.toast.success('Réparateur créé avec succès ✅');
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.toast.error('Erreur lors de la création ❌');
        }
      });
    }
  }

  deleteReparateur(id: number): void {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm('Supprimer ce réparateur ?')) {
        this.isDeleting = id;
        this.adminService.deleteReparateur(id).subscribe({
          next: () => {
            this.loadReparateurs();
            this.isDeleting = null;
            this.toast.success('Réparateur supprimé ✅');
          },
          error: (err: any) => {
            this.isDeleting = null;
            this.toast.error('Erreur lors de la suppression ❌');
          }
        });
      }
    }
  }
}
