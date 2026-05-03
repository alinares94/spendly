import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transactions-list/transactions-list.component').then(
        (m) => m.TransactionsListComponent
      ),
  },
];
