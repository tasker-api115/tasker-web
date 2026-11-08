import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { Project, ProjectDraft, ProjectRow, toProject } from './project.model';

const PROJECT_COLUMNS =
  'id_proyecto, id_usuario_propietario, nombre, descripcion, fecha_inicio, fecha_fin, created_at';

export type ProjectsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type CreateProjectResult =
  | { readonly ok: true; readonly project: Project }
  | { readonly ok: false; readonly reason: 'not-authenticated' | 'not-configured' | 'unknown' };

/**
 * Acceso a los proyectos del usuario en Supabase y estado compartido del listado.
 *
 * Los permisos los garantizan las políticas RLS de `public.proyecto`: solo se leen
 * proyectos propios o donde el usuario es integrante, y solo se insertan con el
 * usuario autenticado como propietario.
 */
@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly auth = inject(AuthService);

  private readonly projectsState = signal<readonly Project[]>([]);
  private readonly statusState = signal<ProjectsStatus>('idle');

  readonly projects = this.projectsState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly currentUserId = computed(() => this.auth.session()?.user.id ?? null);

  async load(): Promise<void> {
    if (!this.client) {
      this.statusState.set('error');
      return;
    }
    this.statusState.set('loading');
    try {
      const { data, error } = await this.client
        .from('proyecto')
        .select(PROJECT_COLUMNS)
        .order('created_at', { ascending: false })
        .returns<ProjectRow[]>();

      if (error || !data) {
        this.statusState.set('error');
        return;
      }
      this.projectsState.set(data.map(toProject));
      this.statusState.set('ready');
    } catch {
      this.statusState.set('error');
    }
  }

  /** Crea el proyecto con el usuario autenticado como propietario y lo agrega al inicio del listado. */
  async create(draft: ProjectDraft): Promise<CreateProjectResult> {
    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }
    const ownerId = this.currentUserId();
    if (!ownerId) {
      return { ok: false, reason: 'not-authenticated' };
    }

    try {
      const { data, error } = await this.client
        .from('proyecto')
        .insert({
          id_usuario_propietario: ownerId,
          nombre: draft.name,
          descripcion: draft.description,
          fecha_inicio: draft.startDate,
          fecha_fin: draft.endDate,
        })
        .select(PROJECT_COLUMNS)
        .single<ProjectRow>();

      if (error || !data) {
        return { ok: false, reason: 'unknown' };
      }
      const project = toProject(data);
      this.projectsState.update((list) => [project, ...list.filter((p) => p.id !== project.id)]);
      if (this.statusState() === 'idle') {
        this.statusState.set('ready');
      }
      return { ok: true, project };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }
}
