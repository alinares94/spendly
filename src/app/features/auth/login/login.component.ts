import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LucideAngularModule, LogIn, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3 inline-flex justify-center">
          <lucide-angular [img]="LogIn" class="h-12 w-12 text-[var(--color-primary)]" />
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Bienvenido a Spendly</h1>
        <p class="text-sm text-[var(--color-text-muted)] mt-1">Inicia sesión para continuar</p>
      </div>

      <!-- Card -->
      <div class="card-elevated">
        @if (errorMessage()) {
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                      text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-section">
          <div class="form-field">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              type="email"
              class="input"
              [class.input-error]="emailInvalid()"
              formControlName="email"
              placeholder="tu@email.com"
              autocomplete="email"
            />
            @if (emailInvalid()) {
              <span class="form-error">Introduce un email válido</span>
            }
          </div>

          <div class="form-field">
            <label class="form-label" for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              class="input"
              [class.input-error]="passwordInvalid()"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (passwordInvalid()) {
              <span class="form-error">La contraseña es obligatoria</span>
            }
          </div>

          <div class="flex items-center justify-end">
            <a routerLink="/auth/forgot-password" class="text-xs text-[var(--color-primary)] inline-flex items-center gap-1">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            class="btn-primary w-full btn-lg"
            [disabled]="isLoading() || form.invalid"
          >
            @if (isLoading()) {
              <span class="animate-spin">⏳</span>
              Iniciando sesión...
            } @else {
              <lucide-angular [img]="LogIn" class="inline h-4 w-4 mr-2" />
              Iniciar sesión
            }
          </button>
        </form>

        <div class="form-divider mt-6">o</div>

        <p class="text-center text-sm text-[var(--color-text-muted)] mt-4">
          ¿No tienes cuenta?
          <a routerLink="/auth/register" class="font-medium inline-flex items-center gap-1">
            <lucide-angular [img]="UserPlus" class="h-4 w-4" />
            Regístrate
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly LogIn = LogIn;
  readonly UserPlus = UserPlus;

  private auth = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
  });

  emailInvalid() {
    const c = this.form.get('email')!;
    return c.invalid && c.touched;
  }

  passwordInvalid() {
    const c = this.form.get('password')!;
    return c.invalid && c.touched;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.auth.signIn(
        this.form.value.email!,
        this.form.value.password!
      );
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
