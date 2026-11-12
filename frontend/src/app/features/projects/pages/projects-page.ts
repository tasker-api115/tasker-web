
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideFolderOpen,
  lucidePencil,
  lucidePlus,
  lucideRefreshCcw,
  lucideTrash2,
} from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { ZardEmptyComponent } from '@/shared/components/empty/empty.component';
import { PageHeading } from '@/shared/components/page-heading/page-heading';
import { CreateProjectDialog } from '../components/create-project-dialog/create-project-dialog';
import { EditProjectDialog } from '../components/edit-project-dialog/edit-project-dialog';
import { DeleteProjectDialog } from '../components/delete-project-dialog/delete-project-dialog';
import { Project } from '../data/project.model';
import { ProjectsService } from '../data/projects.service';
import { formatProjectDate } from '../utils/format-project-date';
import { RouterLink } from '@angular/router';

/**
 * Página de proyectos.
 *
 * HU-21 aporta la creación y HU-24 la edición; ambas actualizan el listado sin recargar.
 * El listado completo (progreso, consultar, eliminar) corresponde a HU-22, HU-23 y HU-25.
 */
@Component({
  selector: 'app-projects-page',
  imports: [
    RouterLink,
    NgIcon,
    PageHeading,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardCardImports,
    ZardEmptyComponent,
    CreateProjectDialog,
    EditProjectDialog,
    DeleteProjectDialog,
  ],
  viewProviders: [
    provideIcons({
      lucidePlus,
      lucidePencil,
      lucideFolderOpen,
      lucideCircleAlert,
      lucideRefreshCcw,
      lucideTrash2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.css',
})
export class ProjectsPage {
  protected readonly store = inject(ProjectsService);

  protected readonly createOpen = signal(false);
  protected readonly editOpen = signal(false);
  protected readonly editingProject = signal<Project | null>(null);

  protected readonly deleteOpen = signal(false);
  protected readonly deletingProject = signal<Project | null>(null);

  /** Proyecto recién creado: entra con animación. */
  protected readonly lastCreatedId = signal<string | null>(null);

  /** Último proyecto creado o editado: se resalta para ubicarlo en el listado. */
  protected readonly highlightedId = signal<string | null>(null);

  protected readonly announcement = signal('');
  protected readonly formatDate = formatProjectDate;

  constructor() {
    void this.store.load();
  }

  protected openCreate(): void {
    this.createOpen.set(true);
  }

  /** Solo el propietario ve la opción; RLS vuelve a validar el permiso al guardar. */
  protected openEdit(project: Project): void {
    this.editingProject.set(project);
    this.editOpen.set(true);
  }

  /** Solo el propietario ve la opción; RLS vuelve a validar el permiso al eliminar. */
  protected openDelete(project: Project): void {
    this.deletingProject.set(project);
    this.deleteOpen.set(true);
  }

  protected retry(): void {
    void this.store.load();
  }

  protected onCreated(project: Project): void {
    this.lastCreatedId.set(project.id);
    this.highlightedId.set(project.id);
    this.announcement.set(`Proyecto «${project.name}» creado.`);
  }

  protected onUpdated(project: Project): void {
    this.highlightedId.set(project.id);
    this.announcement.set(`Proyecto «${project.name}» actualizado.`);
  }

  protected onDeleted(project: Project): void {
    if (this.highlightedId() === project.id) {
      this.highlightedId.set(null);
    }

    this.announcement.set(`Proyecto «${project.name}» eliminado.`);
  }

  protected isOwner(project: Project): boolean {
    return project.ownerId === this.store.currentUserId();
  }
}
