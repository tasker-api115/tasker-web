import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';

export type SaveAssigneesResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'not-configured' | 'not-member' | 'not-allowed' | 'unknown';
    };

/** Código que lanza `tasker_privado.validar_asignacion()` (RAISE EXCEPTION sin código). */
const RAISE_EXCEPTION_CODE = 'P0001';
/** Violación de RLS. */
const INSUFFICIENT_PRIVILEGE_CODE = '42501';

/** Mensaje para la interfaz según el motivo del fallo. */
export function assigneesErrorMessage(reason: Exclude<SaveAssigneesResult, { ok: true }>['reason']): string {
  switch (reason) {
    case 'not-member':
      return 'Solo puedes asignar integrantes registrados en el proyecto.';
    case 'not-allowed':
      return 'No tienes permiso para asignar responsables en esta tarea.';
    case 'not-configured':
      return 'La conexión con Supabase no está configurada.';
    default:
      return 'No pudimos guardar los responsables. Inténtalo nuevamente.';
  }
}

/**
 * Asignación de responsables a una tarea. Guarda en `public.ejecuta`.
 *
 * Validación en frontend: solo se envían ids que estén en la lista de integrantes
 * del proyecto (HU-51). La base de datos lo vuelve a validar con el trigger
 * `ejecuta_validar` → `tasker_privado.validar_asignacion()`, que rechaza a cualquier
 * usuario que no sea miembro del proyecto de la tarea.
 *
 * TODO(backend): la política RLS `ejecuta_acceso` usa `accede_tarea(id_tarea)`, lo que
 * permite a cualquier integrante del proyecto insertar/borrar asignaciones. La HU indica
 * que asigna el PROPIETARIO; restringir INSERT/DELETE de `ejecuta` con
 * `tasker_privado.es_propietario(id_proyecto de la tarea)`. En frontend ya solo el
 * propietario ve los controles para asignar.
 *
 * TODO(backend): el reemplazo se hace en dos pasos (DELETE de los que salen + INSERT de
 * los que entran), así que no es atómico. Lo ideal es una RPC, por ejemplo
 * `set_task_assignees(p_task_id uuid, p_user_ids uuid[])`, que haga ambos pasos en una
 * transacción. Cuando exista, sustituir el cuerpo de `replace()` por la llamada a la RPC.
 */
@Injectable({ providedIn: 'root' })
export class TaskAssignmentsService {
  private readonly client = inject(SUPABASE_CLIENT);

  /**
   * Deja como responsables de la tarea exactamente `nextIds`.
   * @param currentIds responsables actuales (vacío si la tarea es nueva).
   * @param allowedIds ids de los integrantes del proyecto.
   */
  async replace(
    taskId: string,
    currentIds: readonly string[],
    nextIds: readonly string[],
    allowedIds: readonly string[],
  ): Promise<SaveAssigneesResult> {
    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }

    const allowed = new Set(allowedIds);
    if (nextIds.some((id) => !allowed.has(id))) {
      return { ok: false, reason: 'not-member' };
    }

    const current = new Set(currentIds);
    const next = new Set(nextIds);
    const toRemove = [...current].filter((id) => !next.has(id));
    const toAdd = [...next].filter((id) => !current.has(id));

    try {
      if (toRemove.length > 0) {
        const { error } = await this.client
          .from('ejecuta')
          .delete()
          .eq('id_tarea', taskId)
          .in('id_usuario', toRemove);

        if (error) {
          return { ok: false, reason: this.reasonFor(error.code) };
        }
      }

      if (toAdd.length > 0) {
        const { error } = await this.client.from('ejecuta').insert(
          toAdd.map((id_usuario) => ({
            id_tarea: taskId,
            id_usuario,
            rol_tarea: 'responsable',
          })),
        );

        if (error) {
          return { ok: false, reason: this.reasonFor(error.code) };
        }
      }

      return { ok: true };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  private reasonFor(code: string | undefined): 'not-member' | 'not-allowed' | 'unknown' {
    if (code === RAISE_EXCEPTION_CODE) {
      return 'not-member';
    }
    if (code === INSUFFICIENT_PRIVILEGE_CODE) {
      return 'not-allowed';
    }
    return 'unknown';
  }
}