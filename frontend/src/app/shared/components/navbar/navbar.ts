import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';
import { ProfilService } from '../../../core/services/profil';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {

  @Input() basePath = 'admin';

  @Input() pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Tableau de Bord',
  };

  @Input() pageSubtitles: { [key: string]: string } = {
    '/admin/dashboard': "Vue d'ensemble de l'activité RepairFlow",
  };

  @Input() defaultSubtitle = "Pilotez l'activité et supervisez le flux de travail.";

  notifications = 3;
  currentUser: any = null;

  roleLabels: { [key: string]: string } = {
    ADMIN: 'Admin',
    REPARATEUR: 'Réparateur',
    CLIENT: 'Client'
  };

  constructor(
    private auth: AuthService,
    public router: Router,
    public theme: ThemeService,
    private profilService: ProfilService
  ) {}

  ngOnInit(): void {
    this.profilService.currentUser$.subscribe(user => this.currentUser = user);
    this.profilService.loadMe();
  }

  get userName(): string {
    return this.roleLabels[this.currentUser?.role] || 'Utilisateur';
  }

  get profileRoute(): string {
    return `/${this.basePath}/profil`;
  }

  getPhotoUrl(photoUrl: string | null | undefined): string {
    return this.profilService.getPhotoUrl(photoUrl);
  }

  goToProfile(): void {
    this.router.navigate([this.profileRoute]);
  }

  get pageTitle(): string {
    return this.pageTitles[this.router.url] || 'RepairFlow';
  }

  get pageSubtitle(): string {
    return this.pageSubtitles[this.router.url] || this.defaultSubtitle;
  }

  logout(): void {
    this.auth.logout();
  }
}
