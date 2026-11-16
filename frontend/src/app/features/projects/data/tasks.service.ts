import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { CreateTaskResult, TaskDraft } from './task-create.model';

interface CreatedTaskRow {
  id_tarea: string;
  id_proyecto: string;
  numero_tarea: number;
  nombre: string;
  estado: string;
  prioridad: string;
  fecha_fin: string | null;
}

function isCreatedTaskRow(value: unknown): value is CreatedTaskRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row['id_tarea'] === 'string' &&
    typeof row['id_proyecto'] === 'string' &&
    typeof row['numero_tarea'] === 'number' &&
    Number.isInteger(row['numero_tarea']) &&
    row['numero_tarea'] > 0 &&
    typeof row['nombre'] === 'string' &&
    typeof row['estado'] === 'string' &&
    typeof row['prioridad'] === 'string' &&
    (row['fecha_fin'] === null || typeof row['fecha_fin'] === 'string')
  );
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly auth = inject(AuthService);

  async create(
    projectId: string,
    draft: TaskDraft,
  ): Promise<CreateTaskResult> {
    const client = this.client;

    if (!client) {
      return {
        ok: false,
        message: 'La conexión con Supabase no está configurada.',
      };
    }

    try {
      await this.auth.ready;

      if (!this.auth.session()) {
        return {
          ok: false,
          message: 'Tu sesión expiró. Inicia sesión nuevamente.',
        };
      }

      /*
       * DEPENDENCIA DE BACKEND:
       * Implementar esta RPC con el contrato descrito al final.
       * Debe devolver un objeto JSON con la tarea creada.
       */
      const { data, error } = await client.rpc('create_project_task', {
        p_project_id: projectId,
        p_name: draft.name,
        p_description: draft.description,
        p_start_date: draft.startDate,
        p_due_date: draft.dueDate,
      });

      if (error) {
        switch (error.code) {
          case 'PGRST202':
          case '42883':
            return {
              ok: false,
              message:
                'El servicio de creación de tareas todavía no está disponible.',
            };

          case '42501':
            return {
              ok: false,
              message:
                'No tienes permiso para crear tareas en este proyecto.',
            };

          case '23514':
          case '22007':
          case '22008':
          case '22023':
            return {
              ok: false,
              message:
                'Los datos no cumplen las reglas del proyecto. Revisa el nombre y las fechas.',
            };

          case '23503':
            return {
              ok: false,
              message:
                'El proyecto ya no está disponible. Actualiza la página.',
            };

          default:
            return {
              ok: false,
              message:
                'No pudimos confirmar el guardado. Revisa el listado de tareas antes de volver a intentarlo.',
            };
        }
      }

      const response: unknown = data;

      if (
        !isCreatedTaskRow(response) ||
        response.id_proyecto !== projectId ||
        response.estado !== 'pendiente'
      ) {
        return {
          ok: false,
          message:
            'El servidor devolvió una respuesta inesperada. Actualiza el proyecto para comprobar si la tarea se creó antes de reintentar.',
        };
      }

      return {
        ok: true,
        task: {
          id: response.id_tarea,
          projectId: response.id_proyecto,
          number: response.numero_tarea,
          name: response.nombre,
          status: response.estado,
          priority: response.prioridad,
          endDate: response.fecha_fin,
        },
      };
    } catch {
      return {
        ok: false,
        message:
          'Se perdió la conexión. No pudimos confirmar el guardado; revisa las tareas antes de volver a intentarlo.',
      };
    }
  }
}