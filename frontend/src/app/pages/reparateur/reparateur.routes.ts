import { Routes } from '@angular/router';
import { ReparateurLayoutComponent } from './reparateur-layout/reparateur-layout';
import { ReparateurDashboardComponent } from './reparateur-dashboard/reparateur-dashboard';
import { ReparateurProduitsComponent } from './reparateur-produits/reparateur-produits';
import { ReparateurClientsComponent } from './reparateur-clients/reparateur-clients';
import { ReparateurCategoriesComponent } from './reparateur-categories/reparateur-categories';
import { ReparateurReclamationsComponent } from './reparateur-reclamations/reparateur-reclamations';

export const reparateurRoutes: Routes = [
  {
    path: '',
    component: ReparateurLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ReparateurDashboardComponent },
      { path: 'produits', component: ReparateurProduitsComponent },
      { path: 'clients', component: ReparateurClientsComponent },
      { path: 'categories', component: ReparateurCategoriesComponent },
      { path: 'reclamations', component: ReparateurReclamationsComponent },
    ]
  }
];
