import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';

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
    public theme: ThemeService
  ) {}

  get pageTitle(): string {
    return this.pageTitles[this.router.url] || 'RepairFlow';
  }

  get pageSubtitle(): string {
    return this.pageSubtitles[this.router.url] || 'Pilotez l\'activité et supervisez le flux de travail.';
  }

  logout(): void {
    this.auth.logout();
  }
}
