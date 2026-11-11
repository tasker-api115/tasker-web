import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { ProjectRow, toProject } from './project.model';
import {
  ProjectDetailResult,
  ProjectMember,
  ProjectTask,
} from './project-detail.model';

interface ProfileRow {
  id_usuario: string;
  nombre: string;
  apellido: string | null;
}

interface DetailRow extends ProjectRow {
  owner: ProfileRow | null;
}

interface MemberRow {
  id_usuario: string;
  profile: ProfileRow | null;
}

interface TaskRow {
  id_tarea: string;
  numero_tarea: number;
  nombre: string;
  estado: string;
  prioridad: string;
  fecha_fin: string | null;
}

interface QueryPage<T> {
  data: T[] | null;
  error: unknown;
}

const PAGE_SIZE = 100;

@Injectable({ providedIn: 'root' })
export class ProjectDetailService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly auth = inject(AuthService);

  async load(projectId: string): Promise<ProjectDetailResult> {
    const client = this.client;

    if (!client) {
      return { ok: false, reason: 'not-configured' };
    }

    try {
      await this.auth.ready;

      if (!this.auth.session()) {
        return { ok: false, reason: 'unavailable' };
      }

      const { data: row, error } = await client
        .from('proyecto')
        .select(`
          id_proyecto,
          id_usuario_propietario,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          created_at,
          owner:usuario!proyecto_id_usuario_propietario_fkey(
            id_usuario,
            nombre,
            apellido
          )
        `)
        .eq('id_proyecto', projectId)
        .maybeSingle<DetailRow>();

      if (error) {
        return { ok: false, reason: 'unknown' };
      }

      if (!row) {
        // No distinguir entre proyecto inexistente y proyecto oculto por RLS.
        return { ok: false, reason: 'unavailable' };
      }

      const [memberRows, taskRows] = await Promise.all([
        this.readAll<MemberRow>((from, to) =>
          client
            .from('miembro_proyecto')
            .select(`
              id_usuario,
              profile:usuario!miembro_proyecto_id_usuario_fkey(
                id_usuario,
                nombre,
                apellido
              )
            `)
            .eq('id_proyecto', projectId)
            .order('id_usuario')
            .range(from, to)
            .returns<MemberRow[]>(),
        ),
        this.readAll<TaskRow>((from, to) =>
          client
            .from('tarea')
            .select(
              'id_tarea, numero_tarea, nombre, estado, prioridad, fecha_fin',
            )
            .eq('id_proyecto', projectId)
            .order('numero_tarea')
            .range(from, to)
            .returns<TaskRow[]>(),
        ),
      ]);

      const project = toProject(row);
      const members = new Map<string, ProjectMember>();

      for (const member of memberRows) {
        members.set(member.id_usuario, {
          id: member.id_usuario,
          name: this.profileName(member.profile),

          // TODO(backend): proporcionar el correo mediante una consulta
          // autorizada para integrantes de este proyecto.
          // public.usuario actualmente no tiene una columna de correo.
          // Sustituir null por el valor de esa consulta cuando esté disponible.
          email: null,

          role:
            member.id_usuario === project.ownerId
              ? 'Propietario'
              : 'Integrante',
        });
      }

      // Garantiza que el propietario aparezca una sola vez en la interfaz.
      // Esto no crea ni modifica membresías en la base de datos.
      const ownerMember = members.get(project.ownerId);
      const ownerName = row.owner
        ? this.profileName(row.owner)
        : (ownerMember?.name ?? 'Nombre no disponible');

      members.set(project.ownerId, {
        id: project.ownerId,
        name: ownerName,
        email: ownerMember?.email ?? null,
        role: 'Propietario',
      });

      const sortedMembers = [...members.values()].sort((a, b) => {
        if (a.role !== b.role) {
          return a.role === 'Propietario' ? -1 : 1;
        }

        return a.name.localeCompare(b.name, 'es');
      });

      const tasks: ProjectTask[] = taskRows.map((task) => ({
        id: task.id_tarea,
        number: task.numero_tarea,
        name: task.nombre,
        status: task.estado,
        priority: task.prioridad,
        endDate: task.fecha_fin,
      }));

      return {
        ok: true,
        detail: {
          project,
          ownerName,
          members: sortedMembers,
          tasks,
        },
      };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  private profileName(profile: ProfileRow | null): string {
    if (!profile) {
      return 'Nombre no disponible';
    }

    return (
      [profile.nombre, profile.apellido].filter(Boolean).join(' ').trim() ||
      'Nombre no disponible'
    );
  }

  /**
   * Lee todas las páginas para no calcular cantidades o progreso
   * con un listado recortado por el límite de respuesta.
   */
  private async readAll<T>(
    fetchPage: (from: number, to: number) => PromiseLike<QueryPage<T>>,
  ): Promise<T[]> {
    const result: T[] = [];
    let offset = 0;

    while (true) {
      const { data, error } = await fetchPage(
        offset,
        offset + PAGE_SIZE - 1,
      );

      if (error || !data) {
        throw new Error('No se pudo completar la consulta del proyecto.');
      }

      if (data.length === 0) {
        return result;
      }

      result.push(...data);
      offset += data.length;
    }
  }
}