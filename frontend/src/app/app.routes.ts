import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión | Tasker',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio | Tasker',
        loadComponent: () => import('./features/home/pages/home-page').then((m) => m.HomePage),
      },
      {
        path: 'tareas',
        title: 'Tareas | Tasker',
        loadComponent: () => import('./features/tasks/pages/tasks-page').then((m) => m.TasksPage),
      },
      {
        path: '**',
        title: 'Página no encontrada | Tasker',
        loadComponent: () =>
          import('./features/not-found/pages/not-found-page').then((m) => m.NotFoundPage),
      },
    ],
  },
];