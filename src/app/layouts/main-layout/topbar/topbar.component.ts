import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { LucideAngularModule, Sun, Moon, Menu } from 'lucide-angular';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <button class="btn-ghost btn-sm p-2 lg:hidden" (click)="menuToggle.emit()" aria-label="Abrir menú">
        <lucide-angular [img]="Menu" class="w-5 h-5" />
      </button>

      <div class="flex-1 lg:hidden"></div>

      <div class="flex items-center gap-2 ml-auto">
        <button
          class="btn-ghost btn-sm p-2"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
        >
          @if (themeService.isDark()) {
            <lucide-angular [img]="Sun" class="w-4 h-4" />
          } @else {
            <lucide-angular [img]="Moon" class="w-4 h-4" />
          }
        </button>

        <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center
                    text-white text-sm font-semibold select-none">
          {{ userInitial() }}
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  menuToggle = output<void>();
  themeService = inject(ThemeService);
  private auth = inject(AuthService);

  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Menu = Menu;

  userInitial() {
    return (this.auth.currentUser()?.email ?? '?').charAt(0).toUpperCase();
  }
}
