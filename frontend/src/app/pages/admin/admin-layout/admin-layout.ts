import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, SidebarMenuItem } from '../../../shared/components/sidebar/sidebar';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;

  menuItems: SidebarMenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '🔧', label: 'Réparateurs', route: '/admin/reparateurs' },
    { icon: '📁', label: 'Catégories', route: '/admin/categories' },
    { icon: '📦', label: 'Produits', route: '/admin/produits' },
    { icon: '📈', label: 'Statistiques', route: '/admin/statistiques' },
  ];

  pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Tableau de Bord',
    '/admin/statistiques': 'Statistiques & historique',
  };

  pageSubtitles: { [key: string]: string } = {
    '/admin/dashboard': "Vue d'ensemble de l'activité RepairFlow",
    '/admin/statistiques': "Analysez l'activité sur des périodes plus longues",
  };

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }
}
