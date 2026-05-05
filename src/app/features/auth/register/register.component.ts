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
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LucideAngularModule, LogIn, Mail, UserPlus } from 'lucide-angular';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3 inline-flex justify-center">
          <lucide-angular [img]="UserPlus" class="h-10 w-10" />
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Crear cuenta</h1>
        <p class="text-sm text-[var(--color-text-muted)] mt-1">Empieza a controlar tus finanzas</p>
      </div>

      @if (success()) {
        <div class="card-elevated text-center py-8">
          <lucide-angular [img]="Mail" class="mx-auto mb-4 h-10 w-10 text-[var(--color-primary)]" />
          <h2 class="text-lg font-semibold mb-2">¡Revisa tu email!</h2>
          <p class="text-sm text-[var(--color-text-muted)] mb-4">
            Te hemos enviado un enlace de confirmación a <strong>{{ form.value.email }}</strong>.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          <a routerLink="/auth/login" class="btn-primary inline-flex items-center gap-2">
            <lucide-angular [img]="LogIn" class="h-4 w-4" />
            Ir al login
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
                [class.input-error]="fieldInvalid('email')"
                formControlName="email"
                placeholder="tu@email.com"
                autocomplete="email"
              />
              @if (fieldInvalid('email')) {
                <span class="form-error">Introduce un email válido</span>
              }
            </div>

            <div class="form-field">
              <label class="form-label" for="password">Contraseña</label>
              <input
                id="password"
                type="password"
                class="input"
                [class.input-error]="fieldInvalid('password')"
                formControlName="password"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              @if (fieldInvalid('password')) {
                <span class="form-error">La contraseña debe tener al menos 6 caracteres</span>
              }
            </div>

            <div class="form-field">
              <label class="form-label" for="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                class="input"
                [class.input-error]="confirmInvalid()"
                formControlName="confirmPassword"
                placeholder="Repite la contraseña"
                autocomplete="new-password"
              />
              @if (confirmInvalid()) {
                <span class="form-error">Las contraseñas no coinciden</span>
              }
            </div>

            <button
              type="submit"
              class="btn-primary w-full btn-lg"
              [disabled]="isLoading() || form.invalid"
            >
              @if (isLoading()) {
                <span class="animate-spin">⏳</span>
                Creando cuenta...
              } @else {
                Crear cuenta
              }
            </button>
          </form>

          <p class="text-center text-sm text-[var(--color-text-muted)] mt-4">
            ¿Ya tienes cuenta?
            <a routerLink="/auth/login" class="font-medium">Inicia sesión</a>
          </p>
        </div>
      }
    </div>
  `,
})
export class RegisterComponent {
  readonly LogIn = LogIn;
  readonly Mail = Mail;
  readonly UserPlus = UserPlus;

  private auth = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  success = signal(false);

  form = new FormGroup(
    {
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl<string>('', Validators.required),
    },
    { validators: passwordsMatch }
  );

  fieldInvalid(field: string) {
    const c = this.form.get(field)!;
    return c.invalid && c.touched;
  }

  confirmInvalid() {
    const c = this.form.get('confirmPassword')!;
    return (
      (c.touched && c.invalid) ||
      (c.touched && this.form.hasError('passwordsMismatch'))
    );
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.auth.signUp(this.form.value.email!, this.form.value.password!);
      this.success.set(true);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error al crear la cuenta'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
