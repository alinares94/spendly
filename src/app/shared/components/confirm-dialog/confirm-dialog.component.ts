import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAngularModule, TriangleAlert, X } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
        (click)="onBackdropClick($event)"
      >
        <div class="card max-w-sm w-full" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center
                        justify-center flex-shrink-0">
              <lucide-angular [img]="TriangleAlert" class="w-5 h-5 text-[var(--color-danger)]" />
            </div>
            <div class="flex-1">
              <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                {{ title() }}
              </h3>
              <p class="text-sm text-[var(--color-text-muted)]">{{ message() }}</p>
            </div>
            <button class="btn-ghost btn-sm p-1 flex-shrink-0" (click)="cancel.emit()">
              <lucide-angular [img]="X" class="w-4 h-4" />
            </button>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button class="btn-secondary" (click)="cancel.emit()">Cancelar</button>
            <button class="btn-danger" (click)="confirm.emit()">{{ confirmLabel() }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  title = input<string>('Confirmar eliminación');
  message = input<string>('Esta acción no se puede deshacer.');
  confirmLabel = input<string>('Eliminar');
  visible = input.required<boolean>();
  confirm = output<void>();
  cancel = output<void>();

  readonly TriangleAlert = TriangleAlert;
  readonly X = X;

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement) === event.currentTarget) this.cancel.emit();
  }
}
