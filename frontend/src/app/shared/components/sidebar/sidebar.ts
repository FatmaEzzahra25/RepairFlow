import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ProfilService } from '../../../core/services/profil';

export interface SidebarMenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  @Input() basePath = 'admin';

  @Input() menuItems: SidebarMenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '🔧', label: 'Réparateurs', route: '/admin/reparateurs' },
    { icon: '📁', label: 'Catégories', route: '/admin/categories' },
    { icon: '📦', label: 'Produits', route: '/admin/produits' },
  ];

  currentUser: any = null;

  roleLabels: { [key: string]: string } = {
    ADMIN: 'Administrateur',
    REPARATEUR: 'Réparateur',
    CLIENT: 'Client'
  };

  isCollapsed = false;

  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    public router: Router,
    private profilService: ProfilService
  ) {}

  ngOnInit(): void {
    this.profilService.currentUser$.subscribe(user => this.currentUser = user);
    this.profilService.loadMe();
  }

  get roleLabel(): string {
    return this.roleLabels[this.currentUser?.role] || '';
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

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  logout(): void {
    this.authService.logout();
  }
}
