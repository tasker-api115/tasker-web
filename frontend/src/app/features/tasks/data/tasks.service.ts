import { Injectable, inject, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { Task, TaskRow, toTask } from './task.model';

const TASK_COLUMNS =
  'id_tarea, id_proyecto, numero_tarea, nombre, descripcion, fecha_inicio, fecha_fin, estado, complejidad, ejecuta(id_usuario, usuario(nombre, apellido))';

export type TasksStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Acceso a las tareas de un proyecto en Supabase.
 * Los permisos de lectura los garantiza la política RLS `tarea_acceso` (solo integrantes).
 */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly client = inject(SUPABASE_CLIENT);

  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly statusState = signal<TasksStatus>('idle');

  readonly tasks = this.tasksState.asReadonly();
  readonly status = this.statusState.asReadonly();

  async loadByProject(projectId: string): Promise<void> {
    if (!this.client) {
      this.statusState.set('error');
      return;
    }
    this.tasksState.set([]);
    this.statusState.set('loading');
    try {
      const { data, error } = await this.client
        .from('tarea')
        .select(TASK_COLUMNS)
        .eq('id_proyecto', projectId)
        .order('numero_tarea', { ascending: true })
        .returns<TaskRow[]>();

      if (error || !data) {
        this.statusState.set('error');
        return;
      }
      this.tasksState.set(data.map(toTask));
      this.statusState.set('ready');
    } catch {
      this.statusState.set('error');
    }
  }
}