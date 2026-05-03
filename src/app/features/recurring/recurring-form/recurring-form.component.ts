import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  input,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule, X, TrendingDown, TrendingUp } from 'lucide-angular';
import { RecurringService } from '@core/services/recurring.service';
import { CategoryService } from '@core/services/category.service';
import {
  RecurringTransaction,
  RecurringType,
  RecurringFrequency,
  CreateRecurringDto,
} from '@core/models/recurring-transaction.model';
import { Category } from '@core/models/category.model';

@Component({
  selector: 'app-recurring-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
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
              {{ editing() ? 'Editar recurrente' : 'Nuevo recurrente' }}
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
              <button type="button"
                class="flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                [class.bg-[var(--color-expense)]]="form.value.type === 'expense'"
                [class.text-white]="form.value.type === 'expense'"
                [class.text-[var(--color-text-muted)]]="form.value.type !== 'expense'"
                (click)="setType('expense')">
                <lucide-angular [img]="TrendingDown" class="w-4 h-4" /> Gasto
              </button>
              <button type="button"
                class="flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                [class.bg-[var(--color-income)]]="form.value.type === 'income'"
                [class.text-white]="form.value.type === 'income'"
                [class.text-[var(--color-text-muted)]]="form.value.type !== 'income'"
                (click)="setType('income')">
                <lucide-angular [img]="TrendingUp" class="w-4 h-4" /> Ingreso
              </button>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Importe</label>
                <div class="input-group">
                  <input type="number" class="input pl-10" formControlName="amount"
                    [class.input-error]="fieldInvalid('amount')"
                    placeholder="0.00" min="0.01" step="0.01"/>
                  <span class="input-group-icon font-medium">€</span>
                </div>
                @if (fieldInvalid('amount')) {
                  <span class="form-error">Importe requerido</span>
                }
              </div>

              <div class="form-field">
                <label class="form-label">Frecuencia</label>
                <select class="input" formControlName="frequency">
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">Descripción</label>
              <input type="text" class="input" formControlName="description"
                [class.input-error]="fieldInvalid('description')"
                placeholder="Ej: Sueldo, Netflix, Hipoteca..." />
              @if (fieldInvalid('description')) {
                <span class="form-error">La descripción es requerida</span>
              }
            </div>

            <div class="form-field">
              <label class="form-label">Categoría</label>
              <select class="input" formControlName="category_id">
                <option value="">Sin categoría</option>
                @for (cat of filteredCategories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Fecha inicio</label>
                <input type="date" class="input" formControlName="start_date"
                  [class.input-error]="fieldInvalid('start_date')"/>
              </div>
              <div class="form-field">
                <label class="form-label">Fecha fin <span class="text-[var(--color-text-muted)]">(opcional)</span></label>
                <input type="date" class="input" formControlName="end_date"/>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="close.emit()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) { Guardando... }
                @else { {{ editing() ? 'Guardar cambios' : 'Crear recurrente' }} }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class RecurringFormComponent implements OnInit {
  visible = input.required<boolean>();
  editing = input<RecurringTransaction | null>(null);
  close = output<void>();
  saved = output<void>();

  TrendingUp = TrendingUp;
  TrendingDown = TrendingDown;
  X = X;
  
  private recurringService = inject(RecurringService);
  private categoryService = inject(CategoryService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  categories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);

  form = new FormGroup({
    type: new FormControl<RecurringType>('expense', Validators.required),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: new FormControl<string>('', Validators.required),
    category_id: new FormControl<string>(''),
    frequency: new FormControl<RecurringFrequency>('monthly', Validators.required),
    start_date: new FormControl<string>(new Date().toISOString().slice(0, 10), Validators.required),
    end_date: new FormControl<string>(''),
  });

  async ngOnInit() {
    const cats = await this.categoryService.getCategories();
    this.categories.set(cats);
    this.updateFilteredCategories();

    const rec = this.editing();
    if (rec) {
      this.form.patchValue({
        type: rec.type,
        amount: rec.amount,
        description: rec.description ?? '',
        category_id: rec.category_id ?? '',
        frequency: rec.frequency,
        start_date: rec.start_date,
        end_date: rec.end_date ?? '',
      });
      this.updateFilteredCategories();
    }
  }

  setType(type: RecurringType) {
    this.form.patchValue({ type, category_id: '' });
    this.updateFilteredCategories();
  }

  updateFilteredCategories() {
    const type = this.form.value.type ?? 'expense';
    this.filteredCategories.set(this.categories().filter((c) => c.type === type));
  }

  fieldInvalid(field: string) {
    const c = this.form.get(field)!;
    return c.invalid && c.touched;
  }

  onBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement) === event.currentTarget) this.close.emit();
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const dto: CreateRecurringDto = {
        type: this.form.value.type!,
        amount: this.form.value.amount!,
        description: this.form.value.description || null,
        category_id: this.form.value.category_id || null,
        frequency: this.form.value.frequency!,
        start_date: this.form.value.start_date!,
        end_date: this.form.value.end_date || null,
      };
      const rec = this.editing();
      if (rec) {
        await this.recurringService.updateRecurring(rec.id, dto);
      } else {
        await this.recurringService.createRecurring(dto);
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
