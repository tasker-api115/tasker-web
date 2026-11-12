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
  path: 'registro',
  title: 'Crear cuenta | Tasker',
  canActivate: [guestGuard],
  loadComponent: () =>
    import('./features/auth/pages/register-page').then((m) => m.RegisterPage),
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
        path: 'proyectos',
        title: 'Proyectos | Tasker',
        loadComponent: () =>
          import('./features/projects/pages/projects-page').then((m) => m.ProjectsPage),
      },
      {
        path: 'proyectos/:projectId/tablero',
        title: 'Tablero Kanban | Tasker',
        loadComponent: () =>
          import('./features/tasks/pages/task-board-page').then((m) => m.TaskBoardPage),
      },
      {
        path: 'proyectos/:projectId',
        title: 'Detalle del proyecto | Tasker',
        loadComponent: () =>
          import('./features/projects/pages/project-detail-page').then(
            (m) => m.ProjectDetailPage,
          ),
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