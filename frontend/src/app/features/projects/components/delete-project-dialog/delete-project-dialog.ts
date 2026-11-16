import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { Project } from '../../data/project.model';
import { DeleteProjectResult, ProjectsService } from '../../data/projects.service';

type DeleteProjectFailure = Extract<DeleteProjectResult, { ok: false }>['reason'];

const DELETE_ERROR_MESSAGES: Record<DeleteProjectFailure, string> = {
  'not-authenticated': 'Tu sesión expiró. Inicia sesión de nuevo e inténtalo otra vez.',
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed': 'No se pudo eliminar: el proyecto ya no existe o no tienes permiso.',
  'has-tasks': 'No se pudo eliminar: el proyecto tiene tareas asociadas.',
  unknown: 'No se pudo eliminar el proyecto. Inténtalo de nuevo.',
};

/** Modal de confirmación para eliminar un proyecto (HU-25 / SCRUM-36). */
@Component({
  selector: 'app-delete-project-dialog',
  imports: [ZardDialogImports, ZardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-project-dialog.html',
})
export class DeleteProjectDialog {
  private readonly projects = inject(ProjectsService);
  private wasOpen = false;

  /** Proyecto que se va a eliminar. */
  readonly project = input<Project | null>(null);
  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el proyecto ya eliminado en Supabase. */
  readonly deleted = output<Project>();

  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  constructor() {
    // Cada vez que el modal se abre, se limpia el error anterior.
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen && !this.wasOpen) {
          this.deleteError.set(null);
        }
        this.wasOpen = isOpen;
      });
    });
  }

  protected async confirm(): Promise<void> {
    const project = this.project();
    if (this.deleting() || !project) {
      return;
    }
    this.deleting.set(true);
    this.deleteError.set(null);

    const result = await this.projects.remove(project.id);
    this.deleting.set(false);

    if (result.ok) {
      this.deleted.emit(project);
      this.open.set(false);
      return;
    }
    this.deleteError.set(DELETE_ERROR_MESSAGES[result.reason]);
  }
}