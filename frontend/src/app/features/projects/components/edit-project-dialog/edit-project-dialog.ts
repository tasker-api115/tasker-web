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
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { Project } from '../../data/project.model';
import { ProjectsService, UpdateProjectResult } from '../../data/projects.service';
import {
  createProjectForm,
  draftDiffersFrom,
  projectFormToDraft,
  projectToFormValue,
} from '../project-form/project-form';
import { ProjectFormFields } from '../project-form-fields/project-form-fields';

type UpdateProjectFailure = Extract<UpdateProjectResult, { ok: false }>['reason'];

const SAVE_ERROR_MESSAGES: Record<UpdateProjectFailure, string> = {
  'not-authenticated':
    'Tu sesión expiró. Inicia sesión de nuevo; se conservan los valores mostrados.',
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed': 'No se pudo guardar: el proyecto ya no existe o no tienes permiso para editarlo.',
  unknown: 'No se pudo guardar el proyecto. Se conservan los valores mostrados.',
};

/**
 * Modal para editar un proyecto (HU-24 / SCRUM-35).
 *
 * - Al abrirse muestra los valores guardados del proyecto.
 * - Valida igual que la creación: al enviar y, después, en vivo.
 * - Si no hay cambios, «Guardar cambios» cierra sin llamar a Supabase.
 * - Con cambios sin guardar, el clic fuera no cierra el modal (DESIGN.md: sin pérdida
 *   silenciosa). Cancelar y la X siguen siendo descartes explícitos.
 */
@Component({
  selector: 'app-edit-project-dialog',
  imports: [ReactiveFormsModule, ZardDialogImports, ZardButtonComponent, ProjectFormFields],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-project-dialog.html',
})
export class EditProjectDialog {
  private readonly projects = inject(ProjectsService);
  private readonly fields = viewChild(ProjectFormFields);
  private wasOpen = false;

  /** Proyecto que se edita; se toma al abrir el modal. */
  readonly project = input<Project | null>(null);
  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el proyecto ya actualizado en Supabase. */
  readonly updated = output<Project>();

  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly form = createProjectForm(inject(FormBuilder));

  constructor() {
    // Cada vez que el modal se abre, el formulario parte de los valores guardados.
    effect(() => {
      const isOpen = this.open();
      const project = this.project();
      untracked(() => {
        if (isOpen && !this.wasOpen && project) {
          this.form.reset(projectToFormValue(project));
          this.submitted.set(false);
          this.saveError.set(null);
        }
        this.wasOpen = isOpen;
      });
    });
  }

  protected async submit(): Promise<void> {
    const project = this.project();
    if (this.saving() || !project) {
      return;
    }
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.fields()?.focusFirstInvalid();
      return;
    }

    const draft = projectFormToDraft(this.form);
    if (!draftDiffersFrom(draft, project)) {
      this.open.set(false);
      return;
    }

    this.saving.set(true);
    this.form.disable();
    const result = await this.projects.update(project.id, draft);
    this.form.enable();
    this.saving.set(false);

    if (result.ok) {
      this.updated.emit(result.project);
      this.open.set(false);
      return;
    }
    this.saveError.set(SAVE_ERROR_MESSAGES[result.reason]);
  }
}
