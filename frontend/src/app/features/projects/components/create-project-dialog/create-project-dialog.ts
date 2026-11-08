import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { ZardFieldImports } from '@/shared/components/field/field.imports';
import { ZardInputComponent } from '@/shared/components/input/input.component';
import { ZardTextareaComponent } from '@/shared/components/textarea/textarea.component';
import { Project, ProjectDraft } from '../../data/project.model';
import { CreateProjectResult, ProjectsService } from '../../data/projects.service';
import { dateRangeValidator, requiredText } from '../../validators/project-validators';

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
 * - Solo el nombre es obligatorio, porque `proyecto.nombre` es `NOT NULL`. La coherencia de
 *   fechas replica `CHECK (fecha_fin >= fecha_inicio)`. No se añaden límites no definidos.
 * - Cerrar sin guardar no borra lo escrito: la política de descarte sigue pendiente y
 *   DESIGN.md prohíbe la pérdida silenciosa. El formulario se limpia tras crear con éxito.
 */
@Component({
  selector: 'app-create-project-dialog',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    ZardDialogImports,
    ZardFieldImports,
    ZardInputComponent,
    ZardTextareaComponent,
    ZardButtonComponent,
  ],
  viewProviders: [provideIcons({ lucidePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-project-dialog.html',
  styleUrl: './create-project-dialog.css',
})
export class CreateProjectDialog {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly projects = inject(ProjectsService);
  private readonly document = inject(DOCUMENT);

  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el proyecto ya guardado en Supabase. */
  readonly created = output<Project>();

  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      name: ['', [requiredText]],
      description: [''],
      startDate: [''],
      endDate: [''],
    },
    { validators: dateRangeValidator('startDate', 'endDate') },
  );

  protected get nameInvalid(): boolean {
    return this.submitted() && this.form.controls.name.invalid;
  }

  protected get dateRangeInvalid(): boolean {
    return this.submitted() && this.form.hasError('dateRange');
  }

  protected async submit(): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.focusFirstInvalidField();
      return;
    }

    this.saving.set(true);
    this.form.disable();
    const result = await this.projects.create(this.toDraft());
    this.form.enable();
    this.saving.set(false);

    if (result.ok) {
      this.resetForm();
      this.created.emit(result.project);
      this.open.set(false);
      return;
    }
    this.saveError.set(SAVE_ERROR_MESSAGES[result.reason]);
  }

  private resetForm(): void {
    this.form.reset();
    this.submitted.set(false);
    this.saveError.set(null);
  }

  private toDraft(): ProjectDraft {
    const { name, description, startDate, endDate } = this.form.getRawValue();
    return {
      name: name.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };
  }

  private focusFirstInvalidField(): void {
    const id = this.form.controls.name.invalid
      ? 'project-name'
      : this.form.hasError('dateRange')
        ? 'project-end-date'
        : null;
    if (id) {
      this.document.getElementById(id)?.focus();
    }
  }
}
