import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { ThemeService } from '../../core/services/theme';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onLogin(): void {
    this.errorMessage = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        const role = this.auth.getRole();
        if (role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'ROLE_REPARATEUR') {
          this.router.navigate(['/reparateur/dashboard']);
        } else {
          this.router.navigate(['/client/dashboard']);  // ← MODIFIÉ ICI
        }
        const token = this.auth.getToken();
      },
      error: (err: any) => {
        this.errorMessage = 'Email ou mot de passe incorrect';
        if (isPlatformBrowser(this.platformId)) {
          console.error('Erreur de connexion:', err);
        }
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
