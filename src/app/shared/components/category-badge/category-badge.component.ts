import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { Category } from '@core/models/category.model';
import { getCategoryIcon } from '@core/utils/category-icons';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (category()) {
      <span
        class="badge"
        [style.background-color]="badgeBg()"
        [style.color]="category()!.color ?? 'inherit'"
      >
        @if (lucideIcon()) {
          <lucide-angular [img]="lucideIcon()!" class="w-3.5 h-3.5" />
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

  lucideIcon = computed<LucideIconData | null>(() =>
    getCategoryIcon(this.category()?.icon)
  );

  badgeBg() {
    const color = this.category()?.color;
    if (!color) return 'var(--color-bg-secondary)';
    return `${color}20`;
  }
}
