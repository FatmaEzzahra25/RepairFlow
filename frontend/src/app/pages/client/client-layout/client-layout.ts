import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, SidebarMenuItem } from '../../../shared/components/sidebar/sidebar';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './client-layout.html',
  styleUrls: ['./client-layout.css']
})
export class ClientLayoutComponent {
  isSidebarCollapsed = false;

  menuItems: SidebarMenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/client/dashboard' },
    { icon: '📦', label: 'Mes Produits', route: '/client/produits' },
    { icon: '📝', label: 'Réclamations', route: '/client/reclamations' },
  ];

  pageTitles: { [key: string]: string } = {
    '/client/dashboard': 'Tableau de Bord',
  };

  pageSubtitles: { [key: string]: string } = {
    '/client/dashboard': "Vue d'ensemble de vos appareils",
  };

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }
}
