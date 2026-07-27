import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './client-layout/client-layout';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard';
import { ClientProduitsComponent } from './client-produits/client-produits';
import { ClientReclamationsComponent } from './client-reclamations/client-reclamations';
import { ProfilePageComponent } from '../../shared/components/profile-page/profile-page';

export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'produits', component: ClientProduitsComponent },
      { path: 'reclamations', component: ClientReclamationsComponent },
      { path: 'profil', component: ProfilePageComponent },
    ]
  }
];
