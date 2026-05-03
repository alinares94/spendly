import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
        (click)="onBackdropClick($event)"
      >
        <div
          class="card max-w-sm w-full"
          (click)="$event.stopPropagation()"
        >
          <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-2">
            {{ title() }}
          </h3>
          <p class="text-sm text-[var(--color-text-muted)] mb-6">
            {{ message() }}
          </p>
          <div class="flex gap-3 justify-end">
            <button class="btn-secondary" (click)="cancel.emit()">
              Cancelar
            </button>
            <button class="btn-danger" (click)="confirm.emit()">
              {{ confirmLabel() }}
            </button>
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

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
