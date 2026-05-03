import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="text-5xl mb-4">{{ icon() }}</div>
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
  icon = input<string>('📭');
  title = input<string>('Sin resultados');
  message = input<string>('No hay datos para mostrar.');
  actionLabel = input<string | null>(null);
  action = output<void>();
}
