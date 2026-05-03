import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-month-picker',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                rounded-lg px-1 py-1">
      <button
        class="btn-ghost btn-sm p-1.5"
        (click)="changeMonth(-1)"
        aria-label="Mes anterior"
      >
        <lucide-angular [img]="ChevronLeft" class="w-4 h-4" />
      </button>
      <span class="text-sm font-medium text-[var(--color-text-primary)] min-w-[120px] text-center px-1">
        {{ formattedMonth() }}
      </span>
      <button
        class="btn-ghost btn-sm p-1.5"
        (click)="changeMonth(1)"
        [disabled]="isFutureMonth()"
        aria-label="Mes siguiente"
      >
        <lucide-angular [img]="ChevronRight" class="w-4 h-4" />
      </button>
    </div>
  `,
})
export class MonthPickerComponent {
  value = input.required<string>();
  valueChange = output<string>();

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  formattedMonth() {
    const [year, month] = this.value().split('-');
    const date = new Date(+year, +month - 1, 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  isFutureMonth() {
    return this.value() >= new Date().toISOString().slice(0, 7);
  }

  changeMonth(delta: number) {
    const [year, month] = this.value().split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    this.valueChange.emit(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    );
  }
}
