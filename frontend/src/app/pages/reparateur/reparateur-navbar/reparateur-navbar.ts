import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reparateur-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparateur-navbar.html',
  styleUrls: ['./reparateur-navbar.css']
})
export class ReparateurNavbarComponent {
  notifications = 0;
  darkMode = false;

  pageTitles: { [key: string]: string } = {
    '/reparateur/dashboard': 'Tableau de Bord',
    //'/reparateur/produits': 'Gestion des Produits',
    //'/reparateur/clients': 'Gestion des Clients',
    //'/reparateur/reclamations': 'Gestion des Réclamations',
    //'/reparateur/categories': 'Catégories de Produits',
  };

  pageSubtitles: { [key: string]: string } = {
    '/reparateur/dashboard': "Vue d'ensemble de votre activité",
    //'/reparateur/produits': 'Enregistrez et suivez les produits en réparation',
    //'/reparateur/clients': 'Gérez les comptes clients de votre atelier',
    //'/reparateur/reclamations': 'Traitez et répondez aux réclamations de vos clients',
    //'/reparateur/categories': "Consultez les catégories d'équipements",
  };

  constructor(
    private auth: AuthService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('darkMode');
      this.darkMode = saved === 'true';
      if (this.darkMode) {
        document.querySelector('app-root')?.classList.add('dark-mode');
      }
    }
  }

  get pageTitle(): string {
    return this.pageTitles[this.router.url] || 'RepairFlow';
  }

  get pageSubtitle(): string {
    return this.pageSubtitles[this.router.url] || 'Gérez vos tâches et optimisez vos réparations.';
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (isPlatformBrowser(this.platformId)) {
      const appRoot = document.querySelector('app-root');
      if (appRoot) {
        appRoot.classList.toggle('dark-mode', this.darkMode);
      }
      localStorage.setItem('darkMode', this.darkMode.toString());
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
