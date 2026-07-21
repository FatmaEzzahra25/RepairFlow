import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


const STORAGE_KEY = 'darkMode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  darkMode = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.darkMode.set(saved === 'true');
      this.applyClass(this.darkMode());
    }
  }

  toggle(): void {
    this.setDarkMode(!this.darkMode());
  }

  setDarkMode(value: boolean): void {
    this.darkMode.set(value);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, value.toString());
      this.applyClass(value);
    }
  }

  private applyClass(value: boolean): void {
    document.documentElement.classList.toggle('dark-mode', value);
  }
}
