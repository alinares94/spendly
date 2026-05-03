import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '@core/services/category.service';
import { Category, CategoryType } from '@core/models/category.model';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#84cc16',
];

const PRESET_ICONS = [
  '🏠', '🍔', '🚗', '💊', '👗', '📱', '✈️', '🎮',
  '💰', '💼', '🎓', '🛒', '⚡', '💧', '🐾', '🎵',
];

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
        (click)="onBackdrop($event)">
        <div class="card w-full max-w-md max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="card-header">
            <h2 class="card-title">{{ editing() ? 'Editar categoría' : 'Nueva categoría' }}</h2>
            <button class="btn-ghost btn-sm p-1" (click)="close.emit()">✕</button>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-section">
            <!-- Type tabs -->
            @if (!editing()) {
              <div class="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                <button type="button" class="flex-1 py-2 text-sm font-medium transition-colors"
                  [class.bg-[var(--color-expense)]]="form.value.type === 'expense'"
                  [class.text-white]="form.value.type === 'expense'"
                  [class.text-[var(--color-text-muted)]]="form.value.type !== 'expense'"
                  (click)="form.patchValue({ type: 'expense' })">💸 Gasto</button>
                <button type="button" class="flex-1 py-2 text-sm font-medium transition-colors"
                  [class.bg-[var(--color-income)]]="form.value.type === 'income'"
                  [class.text-white]="form.value.type === 'income'"
                  [class.text-[var(--color-text-muted)]]="form.value.type !== 'income'"
                  (click)="form.patchValue({ type: 'income' })">💰 Ingreso</button>
              </div>
            }

            <div class="form-field">
              <label class="form-label">Nombre</label>
              <input type="text" class="input" formControlName="name"
                [class.input-error]="fieldInvalid('name')"
                placeholder="Ej: Alimentación, Sueldo..." />
              @if (fieldInvalid('name')) {
                <span class="form-error">El nombre es requerido</span>
              }
            </div>

            <!-- Color picker -->
            <div class="form-field">
              <label class="form-label">Color</label>
              <div class="flex flex-wrap gap-2">
                @for (color of presetColors; track color) {
                  <button
                    type="button"
                    class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    [style.background-color]="color"
                    [class.border-[var(--color-text-primary)]]="form.value.color === color"
                    [class.border-transparent]="form.value.color !== color"
                    (click)="form.patchValue({ color })"
                  ></button>
                }
                <input type="color" class="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  formControlName="color" title="Color personalizado" />
              </div>
            </div>

            <!-- Icon picker -->
            <div class="form-field">
              <label class="form-label">Icono</label>
              <div class="flex flex-wrap gap-2">
                @for (icon of presetIcons; track icon) {
                  <button
                    type="button"
                    class="w-9 h-9 rounded-lg text-lg border transition-all hover:scale-110"
                    [class.border-[var(--color-primary)]]="form.value.icon === icon"
                    [class.bg-[var(--color-bg-secondary)]]="form.value.icon === icon"
                    [class.border-transparent]="form.value.icon !== icon"
                    [class.hover:bg-[var(--color-bg-secondary)]]="form.value.icon !== icon"
                    (click)="form.patchValue({ icon })"
                  >{{ icon }}</button>
                }
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="close.emit()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) { Guardando... }
                @else { {{ editing() ? 'Guardar cambios' : 'Crear categoría' }} }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CategoryFormComponent implements OnInit {
  visible = input.required<boolean>();
  editing = input<Category | null>(null);
  close = output<void>();
  saved = output<void>();

  private categoryService = inject(CategoryService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  presetColors = PRESET_COLORS;
  presetIcons = PRESET_ICONS;

  form = new FormGroup({
    type: new FormControl<CategoryType>('expense', Validators.required),
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
    color: new FormControl<string>(PRESET_COLORS[5]),
    icon: new FormControl<string>(PRESET_ICONS[0]),
  });

  ngOnInit() {
    const cat = this.editing();
    if (cat) {
      this.form.patchValue({
        type: cat.type,
        name: cat.name,
        color: cat.color ?? PRESET_COLORS[5],
        icon: cat.icon ?? PRESET_ICONS[0],
      });
    }
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
      const cat = this.editing();
      if (cat) {
        await this.categoryService.updateCategory(cat.id, {
          name: this.form.value.name!,
          color: this.form.value.color ?? null,
          icon: this.form.value.icon ?? null,
        });
      } else {
        await this.categoryService.createCategory({
          type: this.form.value.type!,
          name: this.form.value.name!,
          color: this.form.value.color ?? null,
          icon: this.form.value.icon ?? null,
        });
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
