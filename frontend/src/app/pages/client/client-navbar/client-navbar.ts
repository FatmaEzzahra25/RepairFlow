import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-client-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-navbar.html',
  styleUrls: ['./client-navbar.css']
})
export class ClientNavbarComponent {
  notifications = 0;
  darkMode = false;

  pageTitles: { [key: string]: string } = {
    '/client/dashboard': 'Tableau de Bord',
    //'/client/produits': 'Mes Produits',
    //'/client/reclamations': 'Mes Réclamations',
  };

  pageSubtitles: { [key: string]: string } = {
    '/client/dashboard': "Vue d'ensemble de vos appareils",
    //'/client/produits': "Suivez l'état de réparation de vos appareils",
    //'/client/reclamations': 'Consultez et gérez vos réclamations',
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
    return this.pageSubtitles[this.router.url] || 'Votre espace pour suivre l\état de vos appareils.';
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
