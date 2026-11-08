import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideFolderOpen,
  lucidePlus,
  lucideRefreshCcw,
} from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { ZardEmptyComponent } from '@/shared/components/empty/empty.component';
import { PageHeading } from '@/shared/components/page-heading/page-heading';
import { CreateProjectDialog } from '../components/create-project-dialog/create-project-dialog';
import { Project } from '../data/project.model';
import { ProjectsService } from '../data/projects.service';
import { formatProjectDate } from '../utils/format-project-date';

/**
 * Página de proyectos.
 *
 * HU-21 aporta el botón y el modal de creación, y la actualización del listado al crear.
 * El listado completo (progreso, acciones por proyecto) corresponde a HU-22.
 */
@Component({
  selector: 'app-projects-page',
  imports: [
    NgIcon,
    PageHeading,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardCardImports,
    ZardEmptyComponent,
    CreateProjectDialog,
  ],
  viewProviders: [
    provideIcons({ lucidePlus, lucideFolderOpen, lucideCircleAlert, lucideRefreshCcw }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.css',
})
export class ProjectsPage {
  protected readonly store = inject(ProjectsService);

  protected readonly createOpen = signal(false);
  protected readonly lastCreatedId = signal<string | null>(null);
  protected readonly announcement = signal('');
  protected readonly formatDate = formatProjectDate;

  constructor() {
    void this.store.load();
  }

  protected openCreate(): void {
    this.createOpen.set(true);
  }

  protected retry(): void {
    void this.store.load();
  }

  protected onCreated(project: Project): void {
    this.lastCreatedId.set(project.id);
    this.announcement.set(`Proyecto «${project.name}» creado.`);
  }

  protected isOwner(project: Project): boolean {
    return project.ownerId === this.store.currentUserId();
  }
}
