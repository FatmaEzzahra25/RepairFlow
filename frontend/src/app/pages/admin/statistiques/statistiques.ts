import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminService } from '../../../core/services/admin';

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

@Component({
  selector: 'app-admin-statistiques',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './statistiques.html',
  styleUrls: ['./statistiques.css']
})
export class AdminStatistiquesComponent implements OnInit {
  stats: any = null;
  loading = true;

  periodes = [
    { label: '7 jours', jours: 7 },
    { label: '30 jours', jours: 30 },
    { label: '90 jours', jours: 90 },
    { label: '6 mois', jours: 180 },
    { label: '1 an', jours: 365 }
  ];

  selectedJours = 30;

  // ---- Line chart : activité par réparateur ----
  lineChartType: 'line' = 'line';
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // ---- Bar chart : produits par catégorie ----
  barChartType: 'bar' = 'bar';
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // ---- Pie chart : statuts des produits ----
  pieChartType: 'pie' = 'pie';
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const data = ctx.dataset.data as number[];
            const total = data.reduce((a, b) => a + b, 0);
            const value = ctx.parsed as unknown as number;
            const pct = total ? Math.round((value / total) * 100) : 0;
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      }
    }
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadStatistiques();
  }

  selectPeriode(jours: number): void {
    if (jours === this.selectedJours) return;
    this.selectedJours = jours;
    this.loadStatistiques();
  }

  loadStatistiques(): void {
    this.loading = true;
    this.adminService.getStatistiques(this.selectedJours).subscribe({
      next: (data) => {
        this.stats = data;
        this.buildCharts(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (isPlatformBrowser(this.platformId)) {
          console.error('Erreur statistiques:', err);
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildCharts(data: any): void {
    // --- Line chart : une courbe par réparateur ---
    const activiteParReparateur: Record<string, Record<string, number>> = data?.activiteParReparateur || {};
    const noms = Object.keys(activiteParReparateur);
    const labels = noms.length ? Object.keys(activiteParReparateur[noms[0]]) : [];

    this.lineChartData = {
      labels: this.formatLabels(labels, data?.granularite),
      datasets: noms.map((nom, i) => ({
        label: nom,
        data: Object.values(activiteParReparateur[nom]),
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
        tension: 0.35,
        fill: false,
        pointRadius: 2
      }))
    };

    // --- Bar chart : produits par catégorie ---
    const parCategorie: Record<string, number> = data?.produitsParCategorie || {};
    this.barChartData = {
      labels: Object.keys(parCategorie),
      datasets: [{
        label: 'Produits',
        data: Object.values(parCategorie),
        backgroundColor: PALETTE,
        borderRadius: 6
      }]
    };

    // --- Pie chart : statuts des produits ---
    const parStatut: Record<string, number> = data?.produitsParStatut || {};
    const statutColors: Record<string, string> = {
      RECU: '#EF4444',
      EN_COURS: '#F59E0B',
      REPARE: '#10B981',
      PRET: '#3B82F6'
    };
    const statutLabels = Object.keys(parStatut);
    this.pieChartData = {
      labels: statutLabels,
      datasets: [{
        data: Object.values(parStatut),
        backgroundColor: statutLabels.map(s => statutColors[s] || '#9CA3AF')
      }]
    };
  }

  private formatLabels(labels: string[], granularite: string): string[] {
    if (granularite === 'mois') {
      return labels.map(l => {
        const [year, month] = l.split('-');
        const date = new Date(+year, +month - 1, 1);
        return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      });
    }
    return labels.map(l => {
      const date = new Date(l);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });
  }
}
