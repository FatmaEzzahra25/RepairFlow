import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-reparateur-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparateur-navbar.html',
  styleUrls: ['./reparateur-navbar.css']
})
export class ReparateurNavbarComponent {
  notifications = 0;

  pageTitles: { [key: string]: string } = {
    '/reparateur/dashboard': 'Tableau de Bord',
  };

  pageSubtitles: { [key: string]: string } = {
    '/reparateur/dashboard': "Vue d'ensemble de votre activité",
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
    return this.pageSubtitles[this.router.url] || 'Gérez vos tâches et optimisez vos réparations.';
  }

  logout(): void {
    this.auth.logout();
  }
}
