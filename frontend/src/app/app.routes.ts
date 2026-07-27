import { Routes } from '@angular/router';

import { AccueilComponent } from './pages/accueil/accueil';
import { LoginComponent } from './pages/login/login';

import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout';
import { DashboardComponent } from './pages/admin/dashboard/dashboard';
import { ReparateursComponent } from './pages/admin/reparateurs/reparateurs';
import { CategoriesComponent } from './pages/admin/categories/categories';
import { AdminProduitsComponent } from './pages/admin/produits/produits';

import { ClientLayoutComponent } from './pages/client/client-layout/client-layout';
import { ClientDashboardComponent } from './pages/client/client-dashboard/client-dashboard';
import { ClientProduitsComponent } from './pages/client/client-produits/client-produits';
import { ClientReclamationsComponent } from './pages/client/client-reclamations/client-reclamations';

import { ReparateurLayoutComponent } from './pages/reparateur/reparateur-layout/reparateur-layout';
import { ReparateurDashboardComponent } from './pages/reparateur/reparateur-dashboard/reparateur-dashboard';
import { ReparateurProduitsComponent } from './pages/reparateur/reparateur-produits/reparateur-produits';
import { ReparateurClientsComponent } from './pages/reparateur/reparateur-clients/reparateur-clients';
import { ReparateurCategoriesComponent } from './pages/reparateur/reparateur-categories/reparateur-categories';
import { ReparateurReclamationsComponent } from './pages/reparateur/reparateur-reclamations/reparateur-reclamations';

import { ProfilePageComponent } from './shared/components/profile-page/profile-page';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    component: AccueilComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },


  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [
      authGuard,
      roleGuard(['ROLE_ADMIN'])
    ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'reparateurs',
        component: ReparateursComponent
      },
      {
        path: 'categories',
        component: CategoriesComponent
      },
      {
        path: 'produits',
        component: AdminProduitsComponent
      },
      {
        path: 'profil',
        component: ProfilePageComponent
      }
    ]
  },


  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [
      authGuard,
      roleGuard(['ROLE_CLIENT'])
    ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: ClientDashboardComponent
      },
      {
        path: 'produits',
        component: ClientProduitsComponent
      },
      {
        path: 'reclamations',
        component: ClientReclamationsComponent
      },
      {
        path: 'profil',
        component: ProfilePageComponent
      }
    ]
  },


  {
    path: 'reparateur',
    component: ReparateurLayoutComponent,
    canActivate: [
      authGuard,
      roleGuard(['ROLE_REPARATEUR'])
    ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: ReparateurDashboardComponent
      },
      {
        path: 'produits',
        component: ReparateurProduitsComponent
      },
      {
        path: 'clients',
        component: ReparateurClientsComponent
      },
      {
        path: 'categories',
        component: ReparateurCategoriesComponent
      },
      {
        path: 'reclamations',
        component: ReparateurReclamationsComponent
      },
      {
        path: 'profil',
        component: ProfilePageComponent
      }
    ]
  }
];
