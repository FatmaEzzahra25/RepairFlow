import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, SidebarMenuItem } from '../../../shared/components/sidebar/sidebar';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-reparateur-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './reparateur-layout.html',
  styleUrls: ['./reparateur-layout.css']
})
export class ReparateurLayoutComponent {
  isSidebarCollapsed = false;

  menuItems: SidebarMenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/reparateur/dashboard' },
    { icon: '📦', label: 'Produits', route: '/reparateur/produits' },
    { icon: '👤', label: 'Clients', route: '/reparateur/clients' },
    //{ icon: '📁', label: 'Catégories', route: '/reparateur/categories' },
    { icon: '📝', label: 'Réclamations', route: '/reparateur/reclamations' },
  ];

  pageTitles: { [key: string]: string } = {
    '/reparateur/dashboard': 'Tableau de Bord',
  };

  pageSubtitles: { [key: string]: string } = {
    '/reparateur/dashboard': "Vue d'ensemble de votre activité",
  };

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }
}
