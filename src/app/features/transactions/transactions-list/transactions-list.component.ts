import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, LucideIconData, CreditCard, Plus, Pencil, Trash2, ArrowDownLeft, ArrowUpRight, X } from 'lucide-angular';
import { TransactionService } from '@core/services/transaction.service';
import { CategoryService } from '@core/services/category.service';
import { Transaction, TransactionType } from '@core/models/transaction.model';
import { Category } from '@core/models/category.model';
import { MonthPickerComponent } from '@shared/components/month-picker/month-picker.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { CategoryBadgeComponent } from '@shared/components/category-badge/category-badge.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    MonthPickerComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    CategoryBadgeComponent,
    ConfirmDialogComponent,
    TransactionFormComponent,
    LucideAngularModule,
    CurrencyPipe,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions-list.component.html',
})
export class TransactionsListComponent implements OnInit {
  readonly CreditCard = CreditCard;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly ArrowDownLeft = ArrowDownLeft;
  readonly ArrowUpRight = ArrowUpRight;
  readonly X = X;

  transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  isLoading = signal(true);
  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);

  showForm = signal(false);
  editingTransaction = signal<Transaction | null>(null);
  showDeleteDialog = signal(false);
  deletingId = signal<string | null>(null);

  totalIncome = computed(() =>
    this.transactions().filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  );
  totalExpenses = computed(() =>
    this.transactions().filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  );

  async ngOnInit() {
    const cats = await this.categoryService.getCategories();
    this.categories.set(cats);
    await this.loadTransactions();
  }

  async loadTransactions() {
    this.isLoading.set(true);
    try {
      const data = await this.transactionService.getTransactions();
      this.transactions.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onMonthChange(month: string) {
    this.transactionService.selectedMonth.set(month);
    await this.loadTransactions();
  }

  onTypeFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.transactionService.selectedType.set((value as TransactionType) || null);
    this.loadTransactions();
  }

  onCategoryFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.transactionService.selectedCategoryId.set(value || null);
    this.loadTransactions();
  }

  openCreate() {
    this.editingTransaction.set(null);
    this.showForm.set(true);
  }

  openEdit(tx: Transaction) {
    this.editingTransaction.set(tx);
    this.showForm.set(true);
  }

  openDelete(tx: Transaction) {
    this.deletingId.set(tx.id);
    this.showDeleteDialog.set(true);
  }

  async confirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    try {
      await this.transactionService.deleteTransaction(id);
      await this.loadTransactions();
    } finally {
      this.showDeleteDialog.set(false);
      this.deletingId.set(null);
    }
  }
}
