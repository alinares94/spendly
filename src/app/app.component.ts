import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { RecurringService } from '@core/services/recurring.service';
import { BudgetService } from '@core/services/budget.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  private readonly _theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly recurringService = inject(RecurringService);
  private readonly budgetService = inject(BudgetService);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.recurringService.processRecurring().catch(console.error);
        this.budgetService.processBudgets().catch(console.error);
      }
    });
  }
}
