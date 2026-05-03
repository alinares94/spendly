import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Category } from '@core/models/category.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (category()) {
      <span
        class="badge"
        [style.background-color]="badgeBg()"
        [style.color]="category()!.color ?? 'inherit'"
      >
        @if (category()!.icon) {
          <span>{{ category()!.icon }}</span>
        }
        {{ category()!.name }}
      </span>
    } @else {
      <span class="badge-neutral">Sin categoría</span>
    }
  `,
})
export class CategoryBadgeComponent {
  category = input<Category | null | undefined>(null);

  badgeBg() {
    const color = this.category()?.color;
    if (!color) return 'var(--color-bg-secondary)';
    return `${color}20`;
  }
}
