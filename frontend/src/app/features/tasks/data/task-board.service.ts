
import { Injectable, inject, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import {
  Task,
  TaskRow,
  TaskStatus,
  isOverdue,
  toTask,
} from './task.model';

const TASK_COLUMNS =
  'id_tarea, id_proyecto, numero_tarea, nombre, descripcion, fecha_inicio, fecha_fin, estado, complejidad, ejecuta(id_usuario, usuario(nombre, apellido))';

export type TaskBoardStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DeleteTaskResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason:
        | 'not-configured'
        | 'not-allowed'
        | 'has-dependencies'
        | 'unknown';
    };

export type UpdateTaskStatusResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'not-configured' | 'not-allowed' | 'unknown';
    };

/** Código de PostgreSQL cuando otra tabla (dependencias) impide borrar. */
const FOREIGN_KEY_VIOLATION_CODE = '23503';

/**
 * Lectura de las tareas de un proyecto para el tablero Kanban.
 * RLS: tarea_acceso.
 */
@Injectable({ providedIn: 'root' })
export class TaskBoardService {
  private readonly client = inject(SUPABASE_CLIENT);

  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly statusState = signal<TaskBoardStatus>('idle');

  readonly tasks = this.tasksState.asReadonly();
  readonly status = this.statusState.asReadonly();

  /** Con silent se recarga sin vaciar el tablero ni mostrar "Cargando…". */
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

  /**
   * Elimina una tarea (HU-29). Sus asignaciones se borran en cascada.
   * Si no se borra ninguna fila, la tarea ya no existe o el usuario no tiene permiso.
   */
  async remove(taskId: string): Promise<DeleteTaskResult> {
    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }

    try {
      const { data, error } = await this.client
        .from('tarea')
        .delete()
        .eq('id_tarea', taskId)
        .select('id_tarea');

      if (error?.code === FOREIGN_KEY_VIOLATION_CODE) {
        return { ok: false, reason: 'has-dependencies' };
      }

      if (error) {
        return { ok: false, reason: 'unknown' };
      }

      if (!data || data.length === 0) {
        return { ok: false, reason: 'not-allowed' };
      }

      this.tasksState.update((list) =>
        list.filter((task) => task.id !== taskId)
      );

      return { ok: true };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  /**
   * Cambia el estado de una tarea (HU-33). Actualiza el tablero de inmediato y, si Supabase
   * no guarda el cambio, vuelve al estado anterior.
   */
  async updateStatus(
    taskId: string,
    status: TaskStatus
  ): Promise<UpdateTaskStatusResult> {
    const previous = this.tasksState().find((task) => task.id === taskId);

    if (!previous) {
      return { ok: false, reason: 'unknown' };
    }

    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }

    const apply = (value: TaskStatus) =>
      this.tasksState.update((list) =>
        list.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: value,
                overdue: isOverdue(task.dueDate, value),
              }
            : task
        )
      );

    apply(status);

    try {
      const { data, error } = await this.client
        .from('tarea')
        .update({ estado: status })
        .eq('id_tarea', taskId)
        .select('id_tarea');

      if (error || !data || data.length === 0) {
        apply(previous.status);

        return {
          ok: false,
          reason: error ? 'unknown' : 'not-allowed',
        };
      }

      return { ok: true };
    } catch {
      apply(previous.status);
      return { ok: false, reason: 'unknown' };
    }
  }
}
