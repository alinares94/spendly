import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LucideAngularModule, LoaderCircle } from 'lucide-angular';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center" [style.min-height]="minHeight()">
      <lucide-angular
        [img]="LoaderCircle"
        class="animate-spin text-[var(--color-primary)]"
        [class]="sizeClass()"
      />
    </div>
  `,
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  minHeight = input<string>('200px');
  readonly LoaderCircle = LoaderCircle;

  sizeClass() {
    return { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[this.size()];
  }
}
