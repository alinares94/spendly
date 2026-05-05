import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconData,
  LayoutDashboard,
  CreditCard,
  RefreshCw,
  Target,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Banknote,
} from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar h-full" [class.w-64]="!collapsed()" [class.w-16]="collapsed()">
      <!-- Logo -->
      <div class="sidebar-header">
        @if (!collapsed()) {
          <div class="sidebar-logo">
            <lucide-angular [img]="Banknote" class="w-5 h-5" />
            <span>Spendly</span>
          </div>
        } @else {
          <div class="mx-auto text-[var(--color-primary)]">
            <lucide-angular [img]="Banknote" class="w-5 h-5" />
          </div>
        }
        <button
          class="btn-ghost btn-sm p-1.5 ml-auto"
          (click)="toggleCollapse.emit()"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          @if (collapsed()) {
            <lucide-angular [img]="ChevronRight" class="w-4 h-4" />
          } @else {
            <lucide-angular [img]="ChevronLeft" class="w-4 h-4" />
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
            <lucide-angular [img]="item.icon" class="w-5 h-5 flex-shrink-0" />
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
          [class.justify-center]="collapsed()"
          (click)="onSignOut()"
          [title]="collapsed() ? 'Cerrar sesión' : ''"
        >
          <lucide-angular [img]="LogOut" class="w-5 h-5 flex-shrink-0 text-[var(--color-danger)]" />
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

  readonly Banknote = Banknote;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly LogOut = LogOut;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',     path: '/dashboard',    icon: LayoutDashboard },
    { label: 'Movimientos',   path: '/transactions', icon: CreditCard },
    { label: 'Recurrentes',   path: '/recurring',    icon: RefreshCw },
    { label: 'Presupuestos',  path: '/budgets',      icon: Target },
    { label: 'Categorías',    path: '/categories',   icon: Tag },
    { label: 'Configuración', path: '/settings',     icon: Settings },
  ];

  async onSignOut() {
    await this.auth.signOut();
  }
}
