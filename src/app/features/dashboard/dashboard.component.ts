import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip,
  ApexTheme,
  ApexResponsive,
} from 'ng-apexcharts';

import { TransactionService } from '@core/services/transaction.service';
import { BudgetService } from '@core/services/budget.service';
import { ThemeService } from '@core/services/theme.service';
import { Transaction } from '@core/models/transaction.model';
import { Budget } from '@core/models/budget.model';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { MonthPickerComponent } from '@shared/components/month-picker/month-picker.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  theme: ApexTheme;
  responsive: ApexResponsive[];
  labels: string[];
  colors: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgApexchartsModule,
    StatCardComponent,
    MonthPickerComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private budgetService = inject(BudgetService);
  themeService = inject(ThemeService);

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

  pieChartOptions = computed<Partial<ChartOptions>>(() => ({
    series: this.expensesByCategory().map((c) => c.total) as ApexNonAxisChartSeries,
    labels: this.expensesByCategory().map((c) => c.name),
    chart: {
      type: 'donut',
      height: 300,
      background: 'transparent',
      toolbar: { show: false },
    },
    legend: { position: 'bottom' },
    theme: { mode: this.themeMode() },
    responsive: [{ breakpoint: 480, options: { chart: { height: 250 } } }],
    tooltip: { y: { formatter: (v: number) => `${v.toFixed(2)} €` } },
    dataLabels: { enabled: false },
    plotOptions: {},
    xaxis: {},
    colors: [],
  }));

  barChartOptions = computed<Partial<ChartOptions>>(() => {
    const summary = this.monthlySummary();
    const labels = summary.map((s) => {
      const [y, m] = s.month.split('-');
      return new Date(+y, +m - 1, 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    });
    return {
      series: [
        { name: 'Ingresos', data: summary.map((s) => s.income) },
        { name: 'Gastos', data: summary.map((s) => s.expense) },
      ] as ApexAxisChartSeries,
      chart: {
        type: 'bar',
        height: 280,
        background: 'transparent',
        toolbar: { show: false },
        stacked: false,
      },
      xaxis: { categories: labels },
      colors: ['#22c55e', '#ef4444'],
      legend: { position: 'top' },
      theme: { mode: this.themeMode() },
      tooltip: { y: { formatter: (v: number) => `${v.toFixed(2)} €` } },
      plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
      dataLabels: { enabled: false },
      labels: [],
      responsive: [],
    };
  });

  balanceTrendOptions = computed<Partial<ChartOptions>>(() => {
    const summary = this.monthlySummary();
    const labels = summary.map((s) => {
      const [y, m] = s.month.split('-');
      return new Date(+y, +m - 1, 1).toLocaleDateString('es-ES', { month: 'short' });
    });
    return {
      series: [
        { name: 'Balance', data: summary.map((s) => s.income - s.expense) },
      ] as ApexAxisChartSeries,
      chart: {
        type: 'area',
        height: 160,
        background: 'transparent',
        toolbar: { show: false },
        sparkline: { enabled: true },
      },
      xaxis: { categories: labels },
      colors: ['#3b82f6'],
      theme: { mode: this.themeMode() },
      tooltip: { y: { formatter: (v: number) => `${v.toFixed(2)} €` } },
      dataLabels: { enabled: false },
      plotOptions: {},
      legend: {},
      labels: [],
      responsive: [],
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
