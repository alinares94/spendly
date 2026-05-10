import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  input,
  output,
  effect,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule, X, TrendingDown, TrendingUp } from 'lucide-angular';
import { TransactionService } from '@core/services/transaction.service';
import { CategoryService } from '@core/services/category.service';
import { Transaction, TransactionType, CreateTransactionDto } from '@core/models/transaction.model';
import { Category } from '@core/models/category.model';
import { CategorySelectComponent } from '@shared/components/category-select/category-select.component';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, CategorySelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
        (click)="onBackdrop($event)"
      >
        <div
          class="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="card-header">
            <h2 class="card-title">
              {{ editingTransaction() ? 'Editar movimiento' : 'Nuevo movimiento' }}
            </h2>
            <button class="btn-ghost btn-sm p-1" (click)="close.emit()">
              <lucide-angular [img]="X" class="w-4 h-4" />
            </button>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-section">
            <!-- Type tabs -->
            <div class="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
              <button
                type="button"
                class="flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                [class.bg-[var(--color-expense)]]="form.value.type === 'expense'"
                [class.text-white]="form.value.type === 'expense'"
                [class.text-[var(--color-text-muted)]]="form.value.type !== 'expense'"
                (click)="setType('expense')"
              >
                <lucide-angular [img]="TrendingDown" class="w-4 h-4" /> Gasto
              </button>
              <button
                type="button"
                class="flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                [class.bg-[var(--color-income)]]="form.value.type === 'income'"
                [class.text-white]="form.value.type === 'income'"
                [class.text-[var(--color-text-muted)]]="form.value.type !== 'income'"
                (click)="setType('income')"
              >
                <lucide-angular [img]="TrendingUp" class="w-4 h-4" /> Ingreso
              </button>
            </div>

            <!-- Amount -->
            <div class="form-field">
              <label class="form-label">Importe</label>
              <div class="input-group">
                <input
                  type="number"
                  class="input pl-10"
                  [class.input-error]="fieldInvalid('amount')"
                  formControlName="amount"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
                <span class="input-group-icon font-medium">€</span>
              </div>
              @if (fieldInvalid('amount')) {
                <span class="form-error">Introduce un importe válido</span>
              }
            </div>

            <!-- Description -->
            <div class="form-field">
              <label class="form-label">Descripción</label>
              <input
                type="text"
                class="input"
                formControlName="description"
                placeholder="Descripción del movimiento"
              />
            </div>

            <!-- Category -->
            <div class="form-field">
              <label class="form-label">Categoría</label>
              <app-category-select
                [categories]="filteredCategories()"
                formControlName="category_id"
              />
            </div>

            <!-- Date -->
            <div class="form-field">
              <label class="form-label">Fecha</label>
              <input
                type="date"
                class="input"
                [class.input-error]="fieldInvalid('date')"
                formControlName="date"
              />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="close.emit()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="isLoading() || form.invalid"
              >
                @if (isLoading()) { Guardando... }
                @else { {{ editingTransaction() ? 'Guardar cambios' : 'Crear movimiento' }} }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class TransactionFormComponent implements OnInit {
  readonly X = X;
  readonly TrendingDown = TrendingDown;
  readonly TrendingUp = TrendingUp;

  visible = input.required<boolean>();
  editingTransaction = input<Transaction | null>(null);
  close = output<void>();
  saved = output<void>();

  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  categories = signal<Category[]>([]);

  filteredCategories = signal<Category[]>([]);

  form = new FormGroup({
    type: new FormControl<TransactionType>('expense', Validators.required),
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    description: new FormControl<string>(''),
    category_id: new FormControl<string>(''),
    date: new FormControl<string>(
      new Date().toISOString().slice(0, 10),
      Validators.required
    ),
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      const tx = this.editingTransaction();
      if (tx) {
        this.form.patchValue({
          type: tx.type,
          amount: tx.amount,
          description: tx.description ?? '',
          category_id: tx.category_id ?? '',
          date: tx.date,
        });
      } else {
        this.form.reset({
          type: 'expense',
          amount: null,
          description: '',
          category_id: '',
          date: new Date().toISOString().slice(0, 10),
        });
      }
      this.updateFilteredCategories();
    });
  }

  async ngOnInit() {
    const cats = await this.categoryService.getCategories();
    this.categories.set(cats);
    this.updateFilteredCategories();
  }

  setType(type: TransactionType) {
    this.form.patchValue({ type, category_id: '' });
    this.updateFilteredCategories();
  }

  updateFilteredCategories() {
    const type = this.form.value.type ?? 'expense';
    this.filteredCategories.set(
      this.categories().filter((c) => c.type === type)
    );
  }

  fieldInvalid(field: string) {
    const c = this.form.get(field)!;
    return c.invalid && c.touched;
  }

  onBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement) === event.currentTarget) this.close.emit();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const dto: CreateTransactionDto = {
        type: this.form.value.type!,
        amount: this.form.value.amount!,
        description: this.form.value.description || null,
        category_id: this.form.value.category_id || null,
        date: this.form.value.date!,
      };
      const tx = this.editingTransaction();
      if (tx) {
        await this.transactionService.updateTransaction(tx.id, dto);
      } else {
        await this.transactionService.createTransaction(dto);
      }
      this.saved.emit();
      this.close.emit();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      this.isLoading.set(false);
    }
  }
}
