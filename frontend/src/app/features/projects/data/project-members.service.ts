import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { ProjectMember } from './project-detail.model';

/** Usuario registrado encontrado por correo (solo visible para el propietario). */
export interface MemberCandidate {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly isMember: boolean;
}

type CommonFailure = 'not-authenticated' | 'not-configured' | 'not-allowed' | 'unknown';

export type SearchMemberResult =
  | { readonly ok: true; readonly candidate: MemberCandidate | null }
  | { readonly ok: false; readonly reason: CommonFailure };

export type AddMemberResult =
  | { readonly ok: true; readonly member: ProjectMember }
  | { readonly ok: false; readonly reason: CommonFailure | 'duplicate' };

export type RemoveMemberResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: CommonFailure | 'owner' | 'not-member' | 'partial';
    };

interface CandidateRow {
  id_usuario: string;
  nombre: string | null;
  correo: string;
  es_integrante: boolean;
}

interface ProfileRow {
  id_usuario: string;
  nombre: string | null;
  apellido: string | null;
  correo: string | null;
}

/** Códigos de PostgreSQL que devuelve Supabase para estos casos. */
const PG_INSUFFICIENT_PRIVILEGE = '42501';
const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';
const PG_NO_DATA_FOUND = 'P0002';

/** La función no existe en Supabase (PostgREST / PostgreSQL). */
const MISSING_FUNCTION_CODES = new Set(['PGRST202', '42883']);

/**
 * Altas y bajas de integrantes (HU-51 / SCRUM-37).
 *
 * - Buscar usa la RPC `buscar_usuario_para_proyecto`, que compara contra `usuario.correo`
 *   sin depender de las políticas de lectura de `usuario`; solo el propietario puede buscar.
 *   Si la función todavía no está aplicada en Supabase, se consulta `usuario.correo`
 *   directamente (lo que permitan sus políticas RLS).
 * - Agregar inserta en `miembro_proyecto` (RLS `miembro_insert`: solo el propietario; la PK
 *   impide duplicados).
 * - Quitar usa la RPC `quitar_integrante_proyecto`, que borra en la misma transacción las
 *   asignaciones del integrante en las tareas del proyecto y su membresía. Si la función no
 *   está aplicada, se hacen los mismos borrados con las políticas existentes.
 */
@Injectable({ providedIn: 'root' })
export class ProjectMembersService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly auth = inject(AuthService);

  async search(projectId: string, email: string): Promise<SearchMemberResult> {
    const blocked = this.precondition();
    if (blocked) {
      return blocked;
    }
    try {
      const { data, error } = await this.client!.rpc('buscar_usuario_para_proyecto', {
        p_id_proyecto: projectId,
        p_correo: email.trim(),
      });
      if (error && MISSING_FUNCTION_CODES.has(error.code)) {
        return this.searchProfiles(projectId, email);
      }
      if (error) {
        console.warn('No se pudo buscar el integrante', error);
        return { ok: false, reason: this.commonReason(error.code) };
      }
      const row = (data as CandidateRow[] | null)?.[0];
      return {
        ok: true,
        candidate: row
          ? {
              id: row.id_usuario,
              name: row.nombre?.trim() || 'Nombre no disponible',
              email: row.correo,
              isMember: row.es_integrante,
            }
          : null,
      };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  async add(projectId: string, candidate: MemberCandidate): Promise<AddMemberResult> {
    const blocked = this.precondition();
    if (blocked) {
      return blocked;
    }
    try {
      const { error } = await this.client!.from('miembro_proyecto').insert({
        id_proyecto: projectId,
        id_usuario: candidate.id,
        rol_proyecto: 'colaborador',
      });
      if (error) {
        return {
          ok: false,
          reason: error.code === PG_UNIQUE_VIOLATION ? 'duplicate' : this.commonReason(error.code),
        };
      }
      return {
        ok: true,
        member: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          role: 'Integrante',
        },
      };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  async remove(projectId: string, userId: string): Promise<RemoveMemberResult> {
    const blocked = this.precondition();
    if (blocked) {
      return blocked;
    }
    try {
      const { error } = await this.client!.rpc('quitar_integrante_proyecto', {
        p_id_proyecto: projectId,
        p_id_usuario: userId,
      });
      if (!error) {
        return { ok: true };
      }
      if (MISSING_FUNCTION_CODES.has(error.code)) {
        return this.removeDirectly(projectId, userId);
      }
      if (error.code === PG_CHECK_VIOLATION) {
        return { ok: false, reason: 'owner' };
      }
      if (error.code === PG_NO_DATA_FOUND) {
        return { ok: false, reason: 'not-member' };
      }
      return { ok: false, reason: this.commonReason(error.code) };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  /** Búsqueda directa en `usuario.correo`, sin distinguir mayúsculas. */
  private async searchProfiles(projectId: string, email: string): Promise<SearchMemberResult> {
    const pattern = email.trim().replace(/[\\%_]/g, '\\$&');
    const { data, error } = await this.client!.from('usuario')
      .select('id_usuario, nombre, apellido, correo')
      .ilike('correo', pattern)
      .limit(1)
      .returns<ProfileRow[]>();

    if (error) {
      console.warn('No se pudo buscar el integrante por usuario.correo', error);
      return { ok: false, reason: this.commonReason(error.code) };
    }
    const profile = data?.[0];
    if (!profile) {
      return { ok: true, candidate: null };
    }

    const membership = await this.client!.from('miembro_proyecto')
      .select('id_usuario')
      .eq('id_proyecto', projectId)
      .eq('id_usuario', profile.id_usuario)
      .maybeSingle();

    if (membership.error) {
      return { ok: false, reason: this.commonReason(membership.error.code) };
    }

    const name = [profile.nombre, profile.apellido]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' ');

    return {
      ok: true,
      candidate: {
        id: profile.id_usuario,
        name: name || 'Nombre no disponible',
        email: profile.correo?.trim() || email.trim(),
        isMember: membership.data !== null,
      },
    };
  }

  /**
   * Baja sin la función de Supabase, con las políticas existentes: primero las asignaciones
   * del integrante en las tareas del proyecto (el trigger `miembro_validar` no deja quitar a
   * quien todavía tiene asignaciones) y después la membresía. No es una sola transacción: si
   * falla el segundo paso, las asignaciones ya se quitaron y se puede reintentar.
   */
  private async removeDirectly(projectId: string, userId: string): Promise<RemoveMemberResult> {
    const tasks = await this.client!.from('tarea')
      .select('id_tarea')
      .eq('id_proyecto', projectId)
      .returns<{ id_tarea: string }[]>();
    if (tasks.error) {
      return { ok: false, reason: this.commonReason(tasks.error.code) };
    }

    const taskIds = (tasks.data ?? []).map((task) => task.id_tarea);
    if (taskIds.length > 0) {
      const assignments = await this.client!.from('ejecuta')
        .delete()
        .eq('id_usuario', userId)
        .in('id_tarea', taskIds);
      if (assignments.error) {
        return { ok: false, reason: this.commonReason(assignments.error.code) };
      }
    }

    const membership = await this.client!.from('miembro_proyecto')
      .delete()
      .eq('id_proyecto', projectId)
      .eq('id_usuario', userId)
      .select('id_usuario');
    if (membership.error) {
      // Las asignaciones ya se quitaron: se informa para no ocultar ese cambio.
      return {
        ok: false,
        reason: taskIds.length > 0 ? 'partial' : this.commonReason(membership.error.code),
      };
    }
    // RLS oculta la fila si no es propietario; si no se borró nada, ya no era integrante.
    return membership.data.length > 0 ? { ok: true } : { ok: false, reason: 'not-member' };
  }

  private precondition(): { ok: false; reason: CommonFailure } | null {
    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }
    if (!this.auth.session()) {
      return { ok: false, reason: 'not-authenticated' };
    }
    return null;
  }

  private commonReason(code: string | undefined): CommonFailure {
    return code === PG_INSUFFICIENT_PRIVILEGE ? 'not-allowed' : 'unknown';
  }
}
