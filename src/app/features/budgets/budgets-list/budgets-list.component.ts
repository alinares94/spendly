import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideAngularModule, Target, TriangleAlert, Plus, X } from 'lucide-angular';
import { getCategoryIcon } from '@core/utils/category-icons';
import { BudgetService } from '@core/services/budget.service';
import { Budget } from '@core/models/budget.model';
import { MonthPickerComponent } from '@shared/components/month-picker/month-picker.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BudgetFormComponent } from '../budget-form/budget-form.component';

@Component({
  selector: 'app-budgets-list',
  standalone: true,
  imports: [
    MonthPickerComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BudgetFormComponent,
    LucideAngularModule,
    CurrencyPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './budgets-list.component.html',
})
export class BudgetsListComponent implements OnInit {
  readonly Target = Target;
  readonly TriangleAlert = TriangleAlert;
  readonly Plus = Plus;
  readonly X = X;
  readonly getCategoryIcon = getCategoryIcon;

  private budgetService = inject(BudgetService);

  selectedMonth = signal<string>(new Date().toISOString().slice(0, 7));
  isLoading = signal(true);
  budgets = signal<Budget[]>([]);
  showForm = signal(false);
  editing = signal<Budget | null>(null);
  showDeleteDialog = signal(false);
  deletingId = signal<string | null>(null);

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.isLoading.set(true);
    try {
      this.budgets.set(await this.budgetService.getBudgetUsage(this.selectedMonth()));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onMonthChange(month: string) {
    this.selectedMonth.set(month);
    await this.load();
  }

  openCreate() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(b: Budget) {
    this.editing.set(b);
    this.showForm.set(true);
  }

  openDelete(b: Budget) {
    this.deletingId.set(b.id);
    this.showDeleteDialog.set(true);
  }

  async confirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    try {
      await this.budgetService.deleteBudget(id);
      await this.load();
    } finally {
      this.showDeleteDialog.set(false);
      this.deletingId.set(null);
    }
  }

  progressClass(pct: number | undefined) {
    const p = pct ?? 0;
    if (p > 90) return 'progress-bar-danger';
    if (p > 70) return 'progress-bar-warning';
    return 'progress-bar-ok';
  }
}
