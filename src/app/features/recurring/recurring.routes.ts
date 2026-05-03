import { Routes } from '@angular/router';

export const RECURRING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./recurring-list/recurring-list.component').then(
        (m) => m.RecurringListComponent
      ),
  },
];
