import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { PageHeading } from '@/shared/components/page-heading/page-heading';
import { ProjectDetail } from '../data/project-detail.model';
import { ProjectDetailService } from '../data/project-detail.service';
import { formatProjectDate } from '../utils/format-project-date';

type DetailStatus = 'loading' | 'ready' | 'error' | 'unavailable';

/**
 * TODO(integración frontend):
 * Reemplazar null por las rutas reales cuando estén disponibles.
 *
 * Estas funciones deben devolver los comandos para RouterLink,
 * incluyendo el identificador del proyecto.
 */
const PROJECT_LINKS: {
  kanban: ((projectId: string) => string[]) | null;
  timeline: ((projectId: string) => string[]) | null;
} = {
  kanban: null,
  timeline: null,
};

const STATUS_LABELS: Readonly<Record<string, string>> = {
  pendiente: 'Por hacer',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const PRIORITY_LABELS: Readonly<Record<string, string>> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    PageHeading,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardCardImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.css',
})
export class ProjectDetailPage {
  private readonly service = inject(ProjectDetailService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private projectId = '';
  private requestId = 0;

  protected readonly status = signal<DetailStatus>('loading');
  protected readonly detail = signal<ProjectDetail | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly formatDate = formatProjectDate;

  protected readonly progress = computed(() => {
    const tasks = this.detail()?.tasks ?? [];

    // Regla provisional: confirmar con el equipo.
    // Las tareas canceladas no participan en el cálculo.
    const considered = tasks.filter((task) => task.status !== 'cancelada');
    const completed = considered.filter(
      (task) => task.status === 'completada',
    ).length;

    return {
      total: considered.length,
      completed,
      percentage:
        considered.length === 0
          ? 0
          : Math.round((completed / considered.length) * 100),
    };
  });

  protected readonly kanbanLink = computed(() => {
    const id = this.detail()?.project.id;

    return id ? (PROJECT_LINKS.kanban?.(id) ?? null) : null;
  });

  protected readonly timelineLink = computed(() => {
    const id = this.detail()?.project.id;

    return id ? (PROJECT_LINKS.timeline?.(id) ?? null) : null;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.requestId++;
    });

    this.route.paramMap
      .pipe(
        map((params) => params.get('projectId') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((projectId) => {
        this.projectId = projectId;
        void this.load();
      });
  }

  protected retry(): void {
    void this.load();
  }

  protected statusLabel(value: string): string {
    return STATUS_LABELS[value] ?? 'Estado no reconocido';
  }

  protected priorityLabel(value: string): string {
    return PRIORITY_LABELS[value] ?? 'Prioridad no reconocida';
  }

  private async load(): Promise<void> {
    const requestId = ++this.requestId;

    this.detail.set(null);
    this.errorMessage.set('');
    this.status.set('loading');

    if (!this.projectId) {
      this.status.set('unavailable');
      return;
    }

    const result = await this.service.load(this.projectId);

    if (requestId !== this.requestId) {
      return;
    }

    if (!result.ok) {
      if (result.reason === 'unavailable') {
        this.status.set('unavailable');
        return;
      }

      this.errorMessage.set(
        result.reason === 'not-configured'
          ? 'El servicio de proyectos no está configurado.'
          : 'No pudimos cargar la información del proyecto. Inténtalo nuevamente.',
      );

      this.status.set('error');
      return;
    }

    this.detail.set(result.detail);
    this.status.set('ready');
  }
}