import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAngularModule, LucideIconData, Inbox } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center
                  justify-center mb-4 text-[var(--color-text-muted)]">
        <lucide-angular [img]="icon()" class="w-8 h-8" />
      </div>
      <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        {{ title() }}
      </h3>
      <p class="text-sm text-[var(--color-text-muted)] mb-6 max-w-xs">
        {{ message() }}
      </p>
      @if (actionLabel()) {
        <button class="btn-primary" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<LucideIconData>(Inbox);
  title = input<string>('Sin resultados');
  message = input<string>('No hay datos para mostrar.');
  actionLabel = input<string | null>(null);
  action = output<void>();
}
