import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideUsers,
  lucideColumns3,
  lucideCalendarDays,
  lucideChartNoAxesCombined,
  lucidePencil,
} from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { EditProjectDialog } from '../components/edit-project-dialog/edit-project-dialog';
import { ProjectSummary } from '../components/project-summary/project-summary';
import { ProjectMembers } from '../components/project-members/project-members';
import { ProjectKanban } from '../components/project-kanban/project-kanban';
import { Project } from '../data/project.model';
import { ProjectDetail } from '../data/project-detail.model';
import { ProjectDetailService } from '../data/project-detail.service';
import { ProjectsService } from '../data/projects.service';
import { CreateTaskDialog } from '../../projects/components/create-task-dialog/create-task-dialog';

type DetailStatus = 'loading' | 'ready' | 'error' | 'unavailable';
type DetailSection = 'summary' | 'members' | 'kanban';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    ZardButtonComponent,
    EditProjectDialog,
    ProjectSummary,
    ProjectMembers,
    ProjectKanban,
    CreateTaskDialog,
  ],
  viewProviders: [
    provideIcons({
      lucideLayoutDashboard,
      lucideUsers,
      lucideColumns3,
      lucideCalendarDays,
      lucideChartNoAxesCombined,
      lucidePencil,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-detail-page.html',
  styleUrl: '../components/project-detail-content.css',
})
export class ProjectDetailPage {
  private readonly service = inject(ProjectDetailService);
  private readonly projects = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private projectId: string | null = null;
  private requestId = 0;

  protected readonly status = signal<DetailStatus>('loading');
  protected readonly detail = signal<ProjectDetail | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly activeSection = signal<DetailSection>('summary');
  protected readonly announcement = signal('');
  protected readonly editOpen = signal(false);

  protected readonly isOwner = computed(() => {
    const project = this.detail()?.project;

    return (
      project !== undefined &&
      project.ownerId === this.projects.currentUserId()
    );
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.requestId++;
    });

    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, queryParams]) => {
        const projectId = params.get('projectId') ?? '';
        const section = queryParams.get('seccion');

        this.activeSection.set(
          section === 'kanban'
            ? 'kanban'
            : section === 'integrantes'
              ? 'members'
              : 'summary',
        );

        // Cambiar la pestaña no vuelve a consultar el proyecto.
        if (projectId === this.projectId) {
          return;
        }

        this.projectId = projectId;
        this.editOpen.set(false);
        void this.load();
      });
  }

  protected selectSection(section: DetailSection): void {
    this.activeSection.set(section);

    // Conserva la sección seleccionada al actualizar el navegador.
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        seccion:
          section === 'summary'
            ? null
            : section === 'members'
              ? 'integrantes'
              : 'kanban',
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected retry(): void {
    void this.load();
  }

  protected openEdit(): void {
    if (this.isOwner()) {
      this.editOpen.set(true);
    }
  }

  protected onUpdated(project: Project): void {
    this.detail.update((current) => {
      if (!current || current.project.id !== project.id) {
        return current;
      }

      return { ...current, project };
    });

    this.announcement.set('Información del proyecto actualizada.');
  }

  private async load(): Promise<void> {
    const requestId = ++this.requestId;
    const projectId = this.projectId;

    this.detail.set(null);
    this.errorMessage.set('');
    this.status.set('loading');

    if (!projectId) {
      this.status.set('unavailable');
      return;
    }

    const result = await this.service.load(projectId);

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
          : 'No pudimos cargar la información del proyecto.',
      );

      this.status.set('error');
      return;
    }

    this.detail.set(result.detail);
    this.status.set('ready');
  }
}