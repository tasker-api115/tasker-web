import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Project, ProjectDraft } from '../../data/project.model';
import { dateRangeValidator, requiredText } from '../../validators/project-validators';

/** Formulario compartido por los modales de crear (HU-21) y editar (HU-24) proyecto. */
export type ProjectForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
}>;

/**
 * Solo el nombre es obligatorio (`proyecto.nombre` es `NOT NULL`) y la coherencia de fechas
 * replica `CHECK (fecha_fin >= fecha_inicio)`. No se añaden reglas que el equipo no ha definido.
 */
export function createProjectForm(fb: FormBuilder): ProjectForm {
  return fb.nonNullable.group(
    {
      name: ['', [requiredText]],
      description: [''],
      startDate: [''],
      endDate: [''],
    },
    { validators: dateRangeValidator('startDate', 'endDate') },
  );
}

/** Valores del formulario a partir de un proyecto guardado. */
export function projectToFormValue(project: Project): ProjectForm['value'] {
  return {
    name: project.name,
    description: project.description ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
  };
}

/** Datos normalizados para Supabase: texto recortado y vacíos como `null`. */
export function projectFormToDraft(form: ProjectForm): ProjectDraft {
  const { name, description, startDate, endDate } = form.getRawValue();
  return {
    name: name.trim(),
    description: description.trim() || null,
    startDate: startDate || null,
    endDate: endDate || null,
  };
}

/** Indica si el borrador cambia algún dato respecto del proyecto guardado. */
export function draftDiffersFrom(draft: ProjectDraft, project: Project): boolean {
  return (
    draft.name !== project.name ||
    draft.description !== (project.description ?? null) ||
    draft.startDate !== (project.startDate ?? null) ||
    draft.endDate !== (project.endDate ?? null)
  );
}
