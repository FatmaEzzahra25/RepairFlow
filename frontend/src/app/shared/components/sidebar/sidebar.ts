import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  menuItems = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '🔧', label: 'Réparateurs', route: '/admin/reparateurs' },
    { icon: '📁', label: 'Catégories', route: '/admin/categories' },
    { icon: '📦', label: 'Produits', route: '/admin/produits' },
    //{ icon: '📈', label: 'Statistiques', route: '/admin/statistiques' },
  ];

  bottomItems = [
    { icon: '⚙️', label: 'Paramètres', route: '/admin/parametres' },
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
