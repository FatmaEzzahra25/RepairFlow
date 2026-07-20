import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
        [class.info]="toast.type === 'info'"
      >
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border-left: 4px solid #3B82F6;
      animation: slideIn 0.3s ease;
      min-width: 280px;
    }
    .toast.success { border-left-color: #10B981; }
    .toast.error { border-left-color: #EF4444; }
    .toast.info { border-left-color: #3B82F6; }
    .toast-icon { font-size: 18px; }
    .toast-message { flex: 1; font-size: 14px; color: #374151; }
    .toast-close {
      background: none;
      border: none;
      font-size: 18px;
      color: #9CA3AF;
      cursor: pointer;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
