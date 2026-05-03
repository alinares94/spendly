import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-elevated">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <p class="stat-label">{{ label() }}</p>
          <p
            class="stat-value mt-1"
            [class.text-[var(--color-income)]]="colorType() === 'income'"
            [class.text-[var(--color-expense)]]="colorType() === 'expense'"
          >
            {{ amount() | currency:'EUR':'symbol':'1.2-2':'es' }}
          </p>
          @if (trend() !== null) {
            <p [class]="trend()! >= 0 ? 'stat-trend-up' : 'stat-trend-down'" class="mt-1">
              {{ trend()! >= 0 ? '▲' : '▼' }}
              {{ trend()! | number:'1.1-1' }}% vs mes anterior
            </p>
          }
        </div>
        <div class="text-3xl ml-3 flex-shrink-0">{{ icon() }}</div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  amount = input.required<number>();
  icon = input<string>('💰');
  trend = input<number | null>(null);
  colorType = input<'income' | 'expense' | null>(null);
}
