import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile overlay -->
    @if (!sidebarCollapsed() && isMobile()) {
      <div
        class="fixed inset-0 bg-black/50 z-20 lg:hidden"
        (click)="sidebarCollapsed.set(true)"
      ></div>
    }

    <div class="flex h-screen bg-[var(--color-bg-primary)] overflow-hidden">
      <!-- Sidebar: always visible on desktop, slide-over on mobile -->
      <div
        class="flex-shrink-0 transition-all duration-300 ease-in-out"
        [class]="sidebarClasses()"
      >
        <app-sidebar
          [collapsed]="sidebarCollapsed()"
          (toggleCollapse)="toggleSidebar()"
        />
      </div>

      <!-- Main content -->
      <div class="flex flex-col flex-1 overflow-hidden min-w-0">
        <app-topbar (menuToggle)="toggleSidebar()" />
        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  sidebarCollapsed = signal<boolean>(false);
  isMobile = signal<boolean>(window.innerWidth < 1024);

  sidebarClasses() {
    if (this.isMobile()) {
      return this.sidebarCollapsed()
        ? 'fixed left-0 top-0 h-full z-30 -translate-x-full'
        : 'fixed left-0 top-0 h-full z-30 translate-x-0';
    }
    return this.sidebarCollapsed() ? 'w-16' : 'w-64';
  }

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }
}
