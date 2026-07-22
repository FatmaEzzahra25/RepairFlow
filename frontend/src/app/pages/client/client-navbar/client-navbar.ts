import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-client-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-navbar.html',
  styleUrls: ['./client-navbar.css']
})
export class ClientNavbarComponent {
  notifications = 0;

  pageTitles: { [key: string]: string } = {
    '/client/dashboard': 'Tableau de Bord',
  };

  pageSubtitles: { [key: string]: string } = {
    '/client/dashboard': "Vue d'ensemble de vos appareils",
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
    return this.pageSubtitles[this.router.url] || 'Votre espace pour suivre l\'état de vos appareils.';
  }

  logout(): void {
    this.auth.logout();
  }
}
