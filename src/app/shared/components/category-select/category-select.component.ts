import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  forwardRef,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, ChevronDown, LucideIconData } from 'lucide-angular';
import { Category } from '@core/models/category.model';
import { getCategoryIcon } from '@core/utils/category-icons';

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <button
        type="button"
        class="input w-full flex items-center gap-2 text-left cursor-pointer"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        @if (selectedCategory(); as cat) {
          @if (iconFor(cat.icon); as icon) {
            <lucide-angular [img]="icon" class="w-4 h-4 flex-shrink-0" [style.color]="cat.color ?? 'inherit'" />
          }
          <span class="flex-1 truncate">{{ cat.name }}</span>
        } @else {
          <span class="flex-1 text-[var(--color-text-muted)]">{{ placeholder() }}</span>
        }
        <lucide-angular
          [img]="ChevronDown"
          class="w-4 h-4 flex-shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
          [class.rotate-180]="isOpen()"
        />
      </button>

      @if (isOpen()) {
        <div
          class="absolute z-20 w-full mt-1 bg-[var(--color-bg-card)] border border-[var(--color-border)]
                 rounded-lg shadow-lg max-h-52 overflow-y-auto"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm flex items-center gap-2
                   hover:bg-[var(--color-bg-secondary)] transition-colors"
            (click)="select('')"
          >
            <span class="text-[var(--color-text-muted)]">{{ placeholder() }}</span>
          </button>
          @for (cat of categories(); track cat.id) {
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm flex items-center gap-2
                     hover:bg-[var(--color-bg-secondary)] transition-colors"
              [class.bg-[var(--color-bg-secondary)]]="value() === cat.id"
              [class.font-medium]="value() === cat.id"
              (click)="select(cat.id)"
            >
              @if (iconFor(cat.icon); as icon) {
                <lucide-angular [img]="icon" class="w-4 h-4 flex-shrink-0" [style.color]="cat.color ?? 'inherit'" />
              }
              <span>{{ cat.name }}</span>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class CategorySelectComponent implements ControlValueAccessor {
  categories = input.required<Category[]>();
  placeholder = input('Sin categoría');

  readonly ChevronDown = ChevronDown;
  private el = inject(ElementRef);

  isOpen = signal(false);
  value = signal<string>('');
  isDisabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  selectedCategory = computed(() => {
    const id = this.value();
    if (!id) return null;
    return this.categories().find(c => c.id === id) ?? null;
  });

  iconFor(iconName: string | null): LucideIconData | null {
    return getCategoryIcon(iconName);
  }

  toggle() {
    if (this.isDisabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) this.onTouched();
  }

  select(id: string) {
    this.value.set(id);
    this.onChange(id);
    this.onTouched();
    this.isOpen.set(false);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
