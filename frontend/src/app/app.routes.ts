import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
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
