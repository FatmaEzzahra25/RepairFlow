import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../core/services/theme';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.css']
})
export class AccueilComponent {

  stats = [
    { value: '3', label: 'Espaces utilisateurs' },
    { value: '4', label: 'Étapes de suivi' },
    { value: '100%', label: 'Gratuit' },
    { value: 'Temps réel', label: 'Mise à jour du statut' }
  ];

  features = [
    {
      icon: '📦',
      color: 'blue',
      title: 'Gestion des Produits',
      desc: "Enregistrez chaque appareil avec sa description de panne et son association client obligatoire."
    },
    {
      icon: '🧑‍💻',
      color: 'green',
      title: 'Espace Client Dédié',
      desc: 'Vos clients consultent en temps réel la liste et le statut de leurs produits déposés.'
    },
    {
      icon: '📋',
      color: 'orange',
      title: 'Gestion des Réclamations',
      desc: 'Centralisez les réclamations post-réparation et clôturez les dossiers résolus.'
    },
    {
      icon: '📊',
      color: 'purple',
      title: 'Tableau de Bord Admin',
      desc: "Supervisez l'activité globale de l'atelier et gérez les comptes réparateurs."
    },
    {
      icon: '🔐',
      color: 'red',
      title: 'Comptes & Rôles Sécurisés',
      desc: 'Connexion sécurisée par rôle (Admin, Réparateur, Client) avec authentification JWT.'
    },
    {
      icon: '🌓',
      color: 'teal',
      title: 'Mode Sombre & Responsive',
      desc: 'Interface adaptée à tous les écrans, avec mode sombre pour un confort optimal.'
    }
  ];

  steps = [
    {
      icon: '📥',
      title: 'Réception du produit',
      desc: "Le réparateur enregistre l'appareil et le client associé."
    },
    {
      icon: '🔧',
      title: 'Diagnostic & Réparation',
      desc: 'Le statut est mis à jour en temps réel : Reçu → En cours → Réparé → Prêt.'
    },
    {
      icon: '🔔',
      title: 'Suivi client',
      desc: 'Le client suit l’avancement de sa réparation depuis son espace personnel.'
    },
    {
      icon: '✅',
      title: 'Restitution & Clôture',
      desc: "Une fois prêt, le client récupère son appareil réparé à l'atelier."
    }
  ];

  constructor(
    private router: Router,
    public theme: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollTo(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
