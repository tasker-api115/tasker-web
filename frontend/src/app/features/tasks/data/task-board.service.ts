import { Injectable, inject, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { Task, TaskRow, toTask } from './task.model';

const TASK_COLUMNS =
  'id_tarea, id_proyecto, numero_tarea, nombre, descripcion, fecha_inicio, fecha_fin, estado, complejidad, ejecuta(id_usuario, usuario(nombre, apellido))';

export type TaskBoardStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Lectura de las tareas de un proyecto para el tablero Kanban. RLS: `tarea_acceso`. */
@Injectable({ providedIn: 'root' })
export class TaskBoardService {
  private readonly client = inject(SUPABASE_CLIENT);

  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly statusState = signal<TaskBoardStatus>('idle');

  readonly tasks = this.tasksState.asReadonly();
  readonly status = this.statusState.asReadonly();

  /** Con `silent` se recarga sin vaciar el tablero ni mostrar "Cargando…". */
  async loadByProject(projectId: string, silent = false): Promise<void> {
    if (!this.client) {
      this.statusState.set('error');
      return;
    }
    if (!silent) {
      this.tasksState.set([]);
      this.statusState.set('loading');
    }
    try {
      const { data, error } = await this.client
        .from('tarea')
        .select(TASK_COLUMNS)
        .eq('id_proyecto', projectId)
        .order('numero_tarea', { ascending: true })
        .returns<TaskRow[]>();

      if (error || !data) {
        if (!silent) {
          this.statusState.set('error');
        }
        return;
      }
      this.tasksState.set(data.map(toTask));
      this.statusState.set('ready');
    } catch {
      if (!silent) {
        this.statusState.set('error');
      }
    }
  }
}