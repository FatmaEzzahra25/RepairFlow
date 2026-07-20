import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  loading = true;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (isPlatformBrowser(this.platformId)) {
          console.error('Erreur dashboard:', err);
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getBarHeight(value: number): number {
    const activite = this.stats?.activiteParJour || {};
    const values = Object.values(activite).map((v: any) => Number(v));
    const max = values.length ? Math.max(1, ...values) : 1;
    return value === 0 ? 2 : Math.max(6, (value / max) * 100);
  }

  getFirstDay(): string {
    const activite = this.stats?.activiteParJour || {};
    const keys = Object.keys(activite);
    return keys.length ? keys[0] : '';
  }
}
