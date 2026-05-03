import { Routes } from '@angular/router';

export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./budgets-list/budgets-list.component').then(
        (m) => m.BudgetsListComponent
      ),
  },
];
