import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reparateur-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reparateur-sidebar.html',
  styleUrls: ['./reparateur-sidebar.css']
})
export class ReparateurSidebarComponent {
  menuItems = [
    { icon: '📊', label: 'Dashboard', route: '/reparateur/dashboard' },
    { icon: '📦', label: 'Produits', route: '/reparateur/produits' },
    { icon: '👤', label: 'Clients', route: '/reparateur/clients' },
    { icon: '📝', label: 'Réclamations', route: '/reparateur/reclamations' },
  ];

  isCollapsed = false;

  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor(private authService: AuthService, public router: Router) {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  logout(): void {
    this.authService.logout();
  }
}
