import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./categories-list/categories-list.component').then(
        (m) => m.CategoriesListComponent
      ),
  },
];
