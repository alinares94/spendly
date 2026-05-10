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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, RefreshCw } from 'lucide-angular';
import { BudgetService } from '@core/services/budget.service';
import { CategoryService } from '@core/services/category.service';
import { Budget, CreateBudgetDto } from '@core/models/budget.model';
import { Category } from '@core/models/category.model';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
        (click)="onBackdrop($event)">
        <div class="card w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="card-header">
            <h2 class="card-title">{{ editing() ? 'Editar presupuesto' : 'Nuevo presupuesto' }}</h2>
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
            @if (!editing()) {
              <div class="form-field">
                <label class="form-label">Mes</label>
                <input type="month" class="input" formControlName="month"
                  [class.input-error]="fieldInvalid('month')"/>
              </div>

              <div class="form-field">
                <label class="form-label">Categoría</label>
                <select class="input" formControlName="category_id"
                  [class.input-error]="fieldInvalid('category_id')">
                  <option value="">Selecciona una categoría</option>
                  @for (cat of categories(); track cat.id) {
                    @if (cat.type === 'expense') {
                      <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                    }
                  }
                </select>
                @if (fieldInvalid('category_id')) {
                  <span class="form-error">Selecciona una categoría</span>
                }
              </div>
            }

            <div class="form-field">
              <label class="form-label">Límite mensual</label>
              <div class="input-group">
                <input type="number" class="input pl-10" formControlName="limit_amount"
                  [class.input-error]="fieldInvalid('limit_amount')"
                  placeholder="0.00" min="1" step="0.01"/>
                <span class="input-group-icon font-medium">€</span>
              </div>
              @if (fieldInvalid('limit_amount')) {
                <span class="form-error">Introduce un límite válido</span>
              }
            </div>

            <label class="flex items-center gap-3 cursor-pointer select-none">
              <div class="relative">
                <input type="checkbox" class="sr-only peer" formControlName="auto_renew" />
                <div class="w-10 h-6 bg-[var(--color-border)] rounded-full peer
                            peer-checked:bg-[var(--color-primary)]
                            transition-colors"></div>
                <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow
                            peer-checked:translate-x-4 transition-transform"></div>
              </div>
              <div>
                <span class="text-sm font-medium flex items-center gap-1.5">
                  <lucide-angular [img]="RefreshCw" class="w-3.5 h-3.5" />
                  Renovar automáticamente
                </span>
                <p class="text-xs text-[var(--color-text-muted)]">Se creará cada mes con el mismo límite</p>
              </div>
            </label>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="close.emit()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) { Guardando... }
                @else { {{ editing() ? 'Guardar cambios' : 'Crear presupuesto' }} }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class BudgetFormComponent implements OnInit {
  visible = input.required<boolean>();
  editing = input<Budget | null>(null);
  close = output<void>();
  saved = output<void>();

  readonly X = X;
  readonly RefreshCw = RefreshCw;

  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  categories = signal<Category[]>([]);

  form = new FormGroup({
    month: new FormControl<string>(new Date().toISOString().slice(0, 7), Validators.required),
    category_id: new FormControl<string>('', Validators.required),
    limit_amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    auto_renew: new FormControl<boolean>(false),
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      const b = this.editing();
      if (b) {
        this.form.patchValue({ limit_amount: b.limit_amount, auto_renew: b.auto_renew });
        this.form.get('month')?.disable();
        this.form.get('category_id')?.disable();
      } else {
        this.form.reset({
          month: new Date().toISOString().slice(0, 7),
          category_id: '',
          limit_amount: null,
          auto_renew: false,
        });
        this.form.get('month')?.enable();
        this.form.get('category_id')?.enable();
      }
    });
  }

  async ngOnInit() {
    this.categories.set(await this.categoryService.getCategories('expense'));
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
      const b = this.editing();
      if (b) {
        await this.budgetService.updateBudget(b.id, {
          limit_amount: this.form.value.limit_amount!,
          auto_renew: this.form.value.auto_renew ?? false,
        });
      } else {
        const dto: CreateBudgetDto = {
          month: this.form.value.month!,
          category_id: this.form.value.category_id!,
          limit_amount: this.form.value.limit_amount!,
          auto_renew: this.form.value.auto_renew ?? false,
        };
        await this.budgetService.createBudget(dto);
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
