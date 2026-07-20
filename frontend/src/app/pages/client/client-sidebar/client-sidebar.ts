import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-sidebar.html',
  styleUrls: ['./client-sidebar.css']
})
export class ClientSidebarComponent {
  menuItems = [
    { icon: '📊', label: 'Dashboard', route: '/client/dashboard' },
    { icon: '📦', label: 'Mes Produits', route: '/client/produits' },
    { icon: '📝', label: 'Réclamations', route: '/client/reclamations' },
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
