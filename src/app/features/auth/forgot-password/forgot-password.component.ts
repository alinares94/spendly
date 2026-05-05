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
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LucideAngularModule, ArrowLeft, LogIn, Mail } from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3 inline-flex justify-center">
          <lucide-angular [img]="Mail" class="h-10 w-10" />
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Recuperar contraseña</h1>
        <p class="text-sm text-[var(--color-text-muted)] mt-1">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      @if (success()) {
        <div class="card-elevated text-center py-8">
          <lucide-angular [img]="Mail" class="mx-auto mb-4 h-10 w-10 text-[var(--color-primary)]" />
          <h2 class="text-lg font-semibold mb-2">¡Email enviado!</h2>
          <p class="text-sm text-[var(--color-text-muted)] mb-4">
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <a routerLink="/auth/login" class="btn-primary inline-flex items-center gap-2">
            <lucide-angular [img]="LogIn" class="h-4 w-4" />
            Volver al login
          </a>
        </div>
      } @else {
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

            <button
              type="submit"
              class="btn-primary w-full btn-lg"
              [disabled]="isLoading() || form.invalid"
            >
              @if (isLoading()) {
                Enviando...
              } @else {
                Enviar enlace de recuperación
              }
            </button>
          </form>

          <p class="text-center text-sm text-[var(--color-text-muted)] mt-4">
            <a routerLink="/auth/login" class="font-medium inline-flex items-center gap-1">
              <lucide-angular [img]="ArrowLeft" class="h-4 w-4" />
              Volver al login
            </a>
          </p>
        </div>
      }
    </div>
  `,
})
export class ForgotPasswordComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly LogIn = LogIn;
  readonly Mail = Mail;

  private auth = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  success = signal(false);

  form = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
  });

  emailInvalid() {
    const c = this.form.get('email')!;
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
      await this.auth.resetPassword(this.form.value.email!);
      this.success.set(true);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error al enviar el email'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
