import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ReparateurSidebarComponent } from '../reparateur-sidebar/reparateur-sidebar';
import { ReparateurNavbarComponent } from '../reparateur-navbar/reparateur-navbar';

@Component({
  selector: 'app-reparateur-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReparateurSidebarComponent, ReparateurNavbarComponent],
  templateUrl: './reparateur-layout.html',
  styleUrls: ['./reparateur-layout.css']
})
export class ReparateurLayoutComponent {
  isSidebarCollapsed = false;

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }
}
