import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'explorar', pathMatch: 'full' },
  {
    path: 'explorar',
    loadComponent: () =>
      import('./pages/explorar/explorar.page').then((m) => m.ExplorarPage),
  },
  {
    path: 'ficha/:id',
    loadComponent: () =>
      import('./pages/ficha/ficha.page').then((m) => m.FichaPage),
  },
  {
    path: 'acerca',
    loadComponent: () =>
      import('./pages/acerca/acerca.page').then((m) => m.AcercaPage),
  },
  { path: '**', redirectTo: 'explorar' },
];