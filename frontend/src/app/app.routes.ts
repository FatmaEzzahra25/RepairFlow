import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil';
import { LoginComponent } from './pages/login/login';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout';
import { DashboardComponent } from './pages/admin/dashboard/dashboard';
import { ReparateursComponent } from './pages/admin/reparateurs/reparateurs';
import { CategoriesComponent } from './pages/admin/categories/categories';
import { AdminProduitsComponent } from './pages/admin/produits/produits';
import { reparateurRoutes } from './pages/reparateur/reparateur.routes';
import { clientRoutes } from './pages/client/client.routes';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reparateurs', component: ReparateursComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'produits', component: AdminProduitsComponent },
    ]
  },
  {
    path: 'reparateur',
    canActivate: [authGuard, roleGuard(['ROLE_REPARATEUR'])],
    children: reparateurRoutes
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard(['ROLE_CLIENT'])],
    children: clientRoutes
  },
];
