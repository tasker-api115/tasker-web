
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

export type UpdateTaskResult =
  | { readonly ok: true; readonly task: Task }
  | {
      readonly ok: false;
      readonly reason: 'not-configured' | 'not-allowed' | 'invalid' | 'unknown';
    };

/** Datos editables de una tarea (HU-28). */
export interface TaskEditDraft {
  readonly name: string;
  readonly description: string | null;
  readonly startDate: string | null;
  readonly dueDate: string | null;
}

/** Código de PostgreSQL cuando otra tabla (dependencias) impide borrar. */
const FOREIGN_KEY_VIOLATION_CODE = '23503';

/** Permiso rechazado por el trigger `tarea_permisos` (HU-28 / HU-31). */
const INSUFFICIENT_PRIVILEGE_CODE = '42501';

/** Restricción `CHECK` (fechas invertidas o estado no permitido para el responsable). */
const CHECK_VIOLATION_CODE = '23514';

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
   * Guarda los datos editables de una tarea (HU-28) y la reemplaza en el tablero.
   *
   * Solo el propietario puede hacerlo: el trigger `tarea_permisos` rechaza a los demás
   * (42501) y RLS oculta la fila a quien no es integrante (0 filas).
   */
  async update(taskId: string, draft: TaskEditDraft): Promise<UpdateTaskResult> {
    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }

    try {
      const { data, error } = await this.client
        .from('tarea')
        .update({
          nombre: draft.name,
          descripcion: draft.description,
          fecha_inicio: draft.startDate,
          fecha_fin: draft.dueDate,
        })
        .eq('id_tarea', taskId)
        .select(TASK_COLUMNS)
        .returns<TaskRow[]>();

      if (error?.code === INSUFFICIENT_PRIVILEGE_CODE) {
        return { ok: false, reason: 'not-allowed' };
      }

      if (error?.code === CHECK_VIOLATION_CODE) {
        return { ok: false, reason: 'invalid' };
      }

      if (error) {
        return { ok: false, reason: 'unknown' };
      }

      const row = data?.[0];

      if (!row) {
        return { ok: false, reason: 'not-allowed' };
      }

      const task = toTask(row);

      this.tasksState.update((list) =>
        list.map((existing) => (existing.id === task.id ? task : existing))
      );

      return { ok: true, task };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  /**
   * Cambia el estado de una tarea (HU-33 / HU-31). Actualiza el tablero de inmediato y, si Supabase
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

        const rejected =
          !error ||
          error.code === INSUFFICIENT_PRIVILEGE_CODE ||
          error.code === CHECK_VIOLATION_CODE;

        return {
          ok: false,
          reason: rejected ? 'not-allowed' : 'unknown',
        };
      }

      return { ok: true };
    } catch {
      apply(previous.status);
      return { ok: false, reason: 'unknown' };
    }
  }
}
