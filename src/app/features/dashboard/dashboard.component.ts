import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { LucideAngularModule, Wallet, TrendingDown, TrendingUp, Scale, ChartPie, ArrowDownLeft, ArrowUpRight } from 'lucide-angular';
import { getCategoryIcon } from '@core/utils/category-icons';

import { TransactionService } from '@core/services/transaction.service';
import { BudgetService } from '@core/services/budget.service';
import { ThemeService } from '@core/services/theme.service';
import { Transaction } from '@core/models/transaction.model';
import { Budget } from '@core/models/budget.model';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { MonthPickerComponent } from '@shared/components/month-picker/month-picker.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgxEchartsDirective,
    LucideAngularModule,
    StatCardComponent,
    MonthPickerComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
    DatePipe,
  ],
  providers: [provideEchartsCore({ echarts })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private budgetService = inject(BudgetService);
  themeService = inject(ThemeService);

  readonly Wallet = Wallet;
  readonly TrendingDown = TrendingDown;
  readonly TrendingUp = TrendingUp;
  readonly Scale = Scale;
  readonly ChartPie = ChartPie;
  readonly ArrowDownLeft = ArrowDownLeft;
  readonly ArrowUpRight = ArrowUpRight;
  readonly getCategoryIcon = getCategoryIcon;

  isLoading = signal(true);
  transactions = signal<Transaction[]>([]);
  budgets = signal<Budget[]>([]);
  monthlySummary = signal<{ month: string; income: number; expense: number }[]>([]);

  selectedMonth = this.transactionService.selectedMonth;

  totalIncome = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
  );

  totalExpenses = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpenses());

  expensesByCategory = computed(() => {
    const map = new Map<string, { name: string; total: number; color: string | null }>();
    for (const t of this.transactions()) {
      if (t.type !== 'expense') continue;
      const key = t.category_id ?? 'sin-categoria';
      const name = t.category?.name ?? 'Sin categoría';
      const color = t.category?.color ?? null;
      const prev = map.get(key) ?? { name, total: 0, color };
      map.set(key, { ...prev, total: prev.total + t.amount });
    }
    return Array.from(map.values());
  });

  themeMode = computed<'dark' | 'light'>(() =>
    this.themeService.isDark() ? 'dark' : 'light'
  );

  pieChartOptions = computed<EChartsOption>(() => {
    const data = this.expensesByCategory().map((category) => ({
      value: category.total,
      name: category.name,
      itemStyle: category.color ? { color: category.color } : undefined,
    }));
    const colors = this.expensesByCategory()
      .map((category) => category.color)
      .filter((color): color is string => !!color);
    const borderColor = this.themeMode() === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} € ({d}%)',
      },
      legend: {
        bottom: 0,
        left: 'center',
        textStyle: { color: 'var(--color-text)' },
      },
      series: [
        {
          name: 'Gastos',
          type: 'pie',
          radius: ['38%', '68%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor,
            borderWidth: 1,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
      color: colors.length ? colors : undefined,
    };
  });

  barChartOptions = computed<EChartsOption>(() => {
    const summary = this.monthlySummary();
    const labels = summary.map((s) => {
      const [y, m] = s.month.split('-');
      return new Date(+y, +m - 1, 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    });
    const isDark = this.themeMode() === 'dark';
    const axisLineColor = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(15, 23, 42, 0.12)';
    const splitLineColor = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';
    const labelColor = isDark ? 'rgba(226, 232, 240, 0.85)' : 'var(--color-text-muted)';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow', label: { color: 'var(--color-text)' } },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `${item.marker} ${item.seriesName}: ${item.value.toFixed(2)} €`;
        },
      },
      legend: {
        top: 0,
        textStyle: { color: 'var(--color-text)' },
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '12%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: labels,
          axisTick: { alignWithLabel: true, lineStyle: { color: axisLineColor } },
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { color: labelColor },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: labelColor },
        },
      ],
      series: [
        {
          name: 'Ingresos',
          type: 'bar',
          barWidth: '32%',
          data: summary.map((s) => s.income),
          itemStyle: {
            color: '#22c55e',
            borderRadius: [6, 6, 0, 0],
          },
        },
        {
          name: 'Gastos',
          type: 'bar',
          barWidth: '32%',
          data: summary.map((s) => s.expense),
          itemStyle: {
            color: '#ef4444',
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };
  });

  balanceTrendOptions = computed<EChartsOption>(() => {
    const summary = this.monthlySummary();
    const labels = summary.map((s) => {
      const [y, m] = s.month.split('-');
      return new Date(+y, +m - 1, 1).toLocaleDateString('es-ES', { month: 'short' });
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} €',
      },
      grid: {
        left: '0%',
        right: '0%',
        top: '10%',
        bottom: '0%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: 'var(--color-text-muted)' },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          splitLine: { show: false },
          axisLabel: { color: 'var(--color-text-muted)' },
        },
      ],
      series: [
        {
          name: 'Balance',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { color: 'rgba(59, 130, 246, 0.16)' },
          lineStyle: { color: '#3b82f6', width: 3 },
          data: summary.map((s) => s.income - s.expense),
        },
      ],
    };
  });

  async ngOnInit() {
    await this.loadData();
  }

  async onMonthChange(month: string) {
    this.transactionService.selectedMonth.set(month);
    this.isLoading.set(true);
    try {
      const [txs, budgets] = await Promise.all([
        this.transactionService.getTransactions(),
        this.budgetService.getBudgetUsage(month),
      ]);
      this.transactions.set(txs);
      this.budgets.set(budgets);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadData() {
    this.isLoading.set(true);
    try {
      const month = this.selectedMonth();
      const [txs, budgets, summary] = await Promise.all([
        this.transactionService.getTransactions(),
        this.budgetService.getBudgetUsage(month),
        this.transactionService.getLast6MonthsSummary(),
      ]);
      this.transactions.set(txs);
      this.budgets.set(budgets);
      this.monthlySummary.set(summary);
    } finally {
      this.isLoading.set(false);
    }
  }
}
