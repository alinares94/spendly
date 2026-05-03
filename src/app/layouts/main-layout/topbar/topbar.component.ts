import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <button
        class="btn-ghost btn-sm p-2 lg:hidden"
        (click)="menuToggle.emit()"
        aria-label="Abrir menú"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div class="flex-1 lg:hidden"></div>

      <div class="flex items-center gap-3 ml-auto">
        <!-- Theme toggle -->
        <button
          class="btn-ghost btn-sm p-2"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
        >
          @if (themeService.isDark()) {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          } @else {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          }
        </button>

        <!-- User avatar -->
        <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold">
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

  userInitial() {
    const email = this.auth.currentUser()?.email ?? '';
    return email.charAt(0).toUpperCase() || '?';
  }
}
