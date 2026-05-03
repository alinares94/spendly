import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { LucideAngularModule, LucideIconData, TrendingUp, TrendingDown } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, NgClass, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-elevated">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <p class="stat-label">{{ label() }}</p>
          <p
            class="stat-value mt-1"
            [class.text-[var(--color-income)]]="colorType() === 'income'"
            [class.text-[var(--color-expense)]]="colorType() === 'expense'"
          >
            {{ amount() | currency:'EUR':'symbol':'1.2-2' }}
          </p>
          @if (trend() !== null) {
            <div class="flex items-center gap-1 mt-1.5"
              [class.text-[var(--color-income)]]="trend()! >= 0"
              [class.text-[var(--color-expense)]]="trend()! < 0">
              <lucide-angular [img]="trend()! >= 0 ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
              <span class="text-xs">{{ trend()! | number:'1.1-1' }}% vs mes anterior</span>
            </div>
          }
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          [ngClass]="colorType() === 'income' ? 'bg-green-100' : colorType() === 'expense' ? 'bg-red-100' : 'bg-blue-100'"
        >
          <lucide-angular
            [img]="icon()"
            class="w-5 h-5"
            [class.text-[var(--color-income)]]="colorType() === 'income'"
            [class.text-[var(--color-expense)]]="colorType() === 'expense'"
            [class.text-[var(--color-primary)]]="!colorType()"
          />
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  amount = input.required<number>();
  icon = input.required<LucideIconData>();
  trend = input<number | null>(null);
  colorType = input<'income' | 'expense' | null>(null);

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
}
