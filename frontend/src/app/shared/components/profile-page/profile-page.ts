import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilService } from '../../../core/services/profil';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css']
})
export class ProfilePageComponent implements OnInit {
  user: any = null;
  loading = true;
  saving = false;
  uploadingPhoto = false;
  successMessage = '';
  errorMessage = '';

  photoPreviewUrl: string | null = null;
  selectedPhotoFile: File | null = null;
  isDraggingPhoto = false;

  formData = {
    nom: '',
    prenom: '',
    telephone: '',
    adresse: ''
  };

  roleLabels: { [key: string]: string } = {
    ADMIN: 'Administrateur',
    REPARATEUR: 'Réparateur',
    CLIENT: 'Client'
  };

  constructor(private profilService: ProfilService) {}

  ngOnInit(): void {
    this.profilService.getMe().subscribe({
      next: (user) => {
        this.user = user;
        this.formData = {
          nom: user.nom || '',
          prenom: user.prenom || '',
          telephone: user.telephone || '',
          adresse: user.adresse || ''
        };
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre profil.';
        this.loading = false;
      }
    });
  }

  get roleLabel(): string {
    return this.roleLabels[this.user?.role] || this.user?.role || '';
  }

  getPhotoUrl(photoUrl: string | null | undefined): string {
    return this.profilService.getPhotoUrl(photoUrl);
  }

  saveInfos(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.profilService.updateMe(this.formData).subscribe({
      next: (user) => {
        this.user = user;
        this.saving = false;
        this.successMessage = 'Informations mises à jour avec succès.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private setPhotoFile(file: File): void {
    if (!this.isImageFile(file)) {
      this.errorMessage = 'Le fichier doit être une image.';
      return;
    }
    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string;
      this.uploadPhoto();
    };
    reader.readAsDataURL(file);
  }

  uploadPhoto(): void {
    if (!this.selectedPhotoFile) return;
    this.uploadingPhoto = true;
    this.errorMessage = '';
    this.profilService.uploadPhoto(this.selectedPhotoFile).subscribe({
      next: (user) => {
        this.user = user;
        this.uploadingPhoto = false;
        this.selectedPhotoFile = null;
        this.photoPreviewUrl = null;
        this.successMessage = 'Photo de profil mise à jour.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.uploadingPhoto = false;
        this.errorMessage = "Erreur lors de l'envoi de la photo.";
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setPhotoFile(input.files[0]);
    }
  }

  onPhotoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = true;
  }

  onPhotoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = false;
  }

  onPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.setPhotoFile(files[0]);
    }
  }
}
