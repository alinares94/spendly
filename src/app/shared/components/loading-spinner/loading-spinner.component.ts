import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center" [style.min-height]="minHeight()">
      <div
        class="animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"
        [class]="sizeClass()"
      ></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  minHeight = input<string>('200px');

  sizeClass() {
    const map = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return map[this.size()];
  }
}
