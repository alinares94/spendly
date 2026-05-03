import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-month-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2">
      <button
        class="btn-ghost btn-sm p-1.5"
        (click)="changeMonth(-1)"
        aria-label="Mes anterior"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <span class="text-sm font-medium text-[var(--color-text-primary)] min-w-[110px] text-center">
        {{ formattedMonth() }}
      </span>

      <button
        class="btn-ghost btn-sm p-1.5"
        (click)="changeMonth(1)"
        [disabled]="isFutureMonth()"
        aria-label="Mes siguiente"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  `,
})
export class MonthPickerComponent {
  value = input.required<string>();
  valueChange = output<string>();

  formattedMonth() {
    const [year, month] = this.value().split('-');
    const date = new Date(+year, +month - 1, 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  isFutureMonth() {
    const now = new Date().toISOString().slice(0, 7);
    return this.value() >= now;
  }

  changeMonth(delta: number) {
    const [year, month] = this.value().split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.valueChange.emit(newMonth);
  }
}
