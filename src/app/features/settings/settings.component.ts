import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Sun, Moon, CheckCircle } from 'lucide-angular';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';
import { SupabaseService } from '@core/services/supabase.service';
import { ThemeService } from '@core/services/theme.service';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly CheckCircle = CheckCircle;
  readonly appVersion = environment.appVersion;

  private auth = inject(AuthService);
  private supabase = inject(SupabaseService);
  themeService = inject(ThemeService);

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  passwordForm = new FormGroup({
    newPassword: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl<string>('', Validators.required),
  });

  get userEmail() {
    return this.auth.currentUser()?.email ?? '';
  }

  async onChangePassword() {
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    try {
      const { error } = await this.supabase.client.auth.updateUser({
        password: newPassword!,
      });
      if (error) throw error;
      this.successMessage.set('Contraseña actualizada correctamente');
      this.passwordForm.reset();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSignOut() {
    await this.auth.signOut();
  }

  fieldInvalid(field: string) {
    const c = this.passwordForm.get(field)!;
    return c.invalid && c.touched;
  }
}
