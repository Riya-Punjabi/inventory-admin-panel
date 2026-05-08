import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard], 
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'opening-stock',
        loadComponent: () =>
          import('./pages/opening-stock/opening-stock').then((m) => m.OpeningStock),
      },
      {
        path: 'opening-stock/new',
        loadComponent: () =>
          import('./pages/opening-stock/opening-stock').then((m) => m.AddEditOpeningStock),
      },
      {
        path: 'opening-stock/:srno/edit',
        loadComponent: () =>
          import('./pages/opening-stock/opening-stock').then((m) => m.AddEditOpeningStock),
      },
      {
        path: 'opening-stock/:srno/serial-nos',
        loadComponent: () =>
          import('./pages/opening-stock/serial-nos/serial-nos').then((m) => m.SerialNos),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },

    ]
  }

];
