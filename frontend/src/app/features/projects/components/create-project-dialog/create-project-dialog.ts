import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { Project } from '../../data/project.model';
import { CreateProjectResult, ProjectsService } from '../../data/projects.service';
import { createProjectForm, projectFormToDraft } from '../project-form/project-form';
import { ProjectFormFields } from '../project-form-fields/project-form-fields';

type CreateProjectFailure = Extract<CreateProjectResult, { ok: false }>['reason'];

const SAVE_ERROR_MESSAGES: Record<CreateProjectFailure, string> = {
  'not-authenticated':
    'Tu sesión expiró. Inicia sesión de nuevo; se conservan los valores mostrados.',
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  unknown: 'No se pudo guardar el proyecto. Se conservan los valores mostrados.',
};

/**
 * Modal para crear un proyecto (HU-21 / SCRUM-32).
 *
 * - Valida al enviar; después de un intento, los errores se corrigen en vivo (DESIGN.md).
 * - Cerrar sin guardar no borra lo escrito: la política de descarte sigue pendiente y
 *   DESIGN.md prohíbe la pérdida silenciosa. El formulario se limpia tras crear con éxito.
 */
@Component({
  selector: 'app-create-project-dialog',
  imports: [ReactiveFormsModule, NgIcon, ZardDialogImports, ZardButtonComponent, ProjectFormFields],
  viewProviders: [provideIcons({ lucidePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-project-dialog.html',
})
export class CreateProjectDialog {
  private readonly projects = inject(ProjectsService);
  private readonly fields = viewChild(ProjectFormFields);

  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el proyecto ya guardado en Supabase. */
  readonly created = output<Project>();

  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly form = createProjectForm(inject(FormBuilder));

  protected async submit(): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.fields()?.focusFirstInvalid();
      return;
    }

    this.saving.set(true);
    this.form.disable();
    const result = await this.projects.create(projectFormToDraft(this.form));
    this.form.enable();
    this.saving.set(false);

    if (result.ok) {
      this.form.reset();
      this.submitted.set(false);
      this.created.emit(result.project);
      this.open.set(false);
      return;
    }
    this.saveError.set(SAVE_ERROR_MESSAGES[result.reason]);
  }
}
