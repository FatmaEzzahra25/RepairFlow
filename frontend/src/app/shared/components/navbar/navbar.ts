import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  userName = 'Admin';
  notifications = 3;
  darkMode = false;

  pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Tableau de Bord',
    //'/admin/reparateurs': 'Gestion des Réparateurs',
    //'/admin/categories': 'Catégories de Produits',
    //'/admin/produits': 'Gestion de Produits',
    //'/admin/statistiques': 'Statistiques',
  };

  pageSubtitles: { [key: string]: string } = {
    '/admin/dashboard': "Vue d'ensemble de l'activité RepairFlow",
    //'/admin/reparateurs': 'Gérez les techniciens de votre atelier',
    //'/admin/categories': 'Gérez les catégories d équipements',
    //'/admin/produits': 'Gérez la liste de produits',
    //'/admin/statistiques': 'Analysez les performances de votre atelier',
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
    return this.pageSubtitles[this.router.url] || 'Pilotez l\'activité et supervisez le flux de travail.';
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
