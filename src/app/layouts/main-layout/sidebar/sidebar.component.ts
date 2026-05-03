import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="sidebar h-full"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <!-- Logo -->
      <div class="sidebar-header">
        @if (!collapsed()) {
          <div class="sidebar-logo">
            <span class="text-2xl">💸</span>
            <span>Spendly</span>
          </div>
        } @else {
          <span class="text-2xl mx-auto">💸</span>
        }
        <button
          class="btn-ghost btn-sm p-1.5"
          (click)="toggleCollapse.emit()"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          @if (collapsed()) {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            </svg>
          } @else {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          }
        </button>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            class="sidebar-link"
            [title]="collapsed() ? item.label : ''"
          >
            <span class="sidebar-link-icon text-xl">{{ item.icon }}</span>
            @if (!collapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button
          class="sidebar-link w-full"
          (click)="onSignOut()"
          [title]="collapsed() ? 'Cerrar sesión' : ''"
        >
          <span class="sidebar-link-icon text-xl">🚪</span>
          @if (!collapsed()) {
            <span>Cerrar sesión</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  private auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Movimientos', path: '/transactions', icon: '💳' },
    { label: 'Recurrentes', path: '/recurring', icon: '🔁' },
    { label: 'Presupuestos', path: '/budgets', icon: '🎯' },
    { label: 'Categorías', path: '/categories', icon: '🏷️' },
    { label: 'Configuración', path: '/settings', icon: '⚙️' },
  ];

  async onSignOut() {
    await this.auth.signOut();
  }
}
