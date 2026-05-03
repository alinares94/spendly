import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RecurringService } from '@core/services/recurring.service';
import { RecurringTransaction } from '@core/models/recurring-transaction.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { CategoryBadgeComponent } from '@shared/components/category-badge/category-badge.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { RecurringFormComponent } from '../recurring-form/recurring-form.component';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    EmptyStateComponent,
    CategoryBadgeComponent,
    ConfirmDialogComponent,
    RecurringFormComponent,
    CurrencyPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recurring-list.component.html',
})
export class RecurringListComponent implements OnInit {
  private recurringService = inject(RecurringService);

  isLoading = signal(true);
  items = signal<RecurringTransaction[]>([]);
  showForm = signal(false);
  editing = signal<RecurringTransaction | null>(null);
  showDeleteDialog = signal(false);
  deletingId = signal<string | null>(null);

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.isLoading.set(true);
    try {
      this.items.set(await this.recurringService.getRecurring());
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreate() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(item: RecurringTransaction) {
    this.editing.set(item);
    this.showForm.set(true);
  }

  openDelete(item: RecurringTransaction) {
    this.deletingId.set(item.id);
    this.showDeleteDialog.set(true);
  }

  async toggleActive(item: RecurringTransaction) {
    await this.recurringService.toggleActive(item.id, !item.active);
    await this.load();
  }

  async confirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    try {
      await this.recurringService.deleteRecurring(id);
      await this.load();
    } finally {
      this.showDeleteDialog.set(false);
      this.deletingId.set(null);
    }
  }

  freqLabel(f: string) {
    const map: Record<string, string> = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    };
    return map[f] ?? f;
  }
}
