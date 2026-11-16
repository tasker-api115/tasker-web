import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Task } from './task.model';
import { TaskEditDraft } from './task-board.service';

/** Fecha opcional con formato `AAAA-MM-DD` que exista en el calendario. */
export const optionalDateValidator: ValidatorFn = (control) => {
  const value: unknown = control.value;

  if (value === '' || value === null) {
    return null;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { invalidDate: true };
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? { invalidDate: true }
    : null;
};

/** La entrega no puede ser anterior al inicio (`tarea_fechas_check`). */
export const dateOrderValidator: ValidatorFn = (group) => {
  const start = group.get('startDate');
  const due = group.get('dueDate');

  if (!start || !due || start.invalid || due.invalid) {
    return null;
  }

  return start.value && due.value && due.value < start.value ? { dateOrder: true } : null;
};

export function createTaskEditForm() {
  return new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
      description: new FormControl('', { nonNullable: true }),
      startDate: new FormControl('', { nonNullable: true, validators: [optionalDateValidator] }),
      dueDate: new FormControl('', { nonNullable: true, validators: [optionalDateValidator] }),
    },
    { validators: dateOrderValidator },
  );
}

export type TaskEditForm = ReturnType<typeof createTaskEditForm>;
export type TaskEditFormValue = ReturnType<TaskEditForm['getRawValue']>;

export function taskToFormValue(task: Task): TaskEditFormValue {
  return {
    name: task.name,
    description: task.description ?? '',
    startDate: task.startDate ?? '',
    dueDate: task.dueDate ?? '',
  };
}

export function formValueToDraft(value: TaskEditFormValue): TaskEditDraft {
  return {
    name: value.name.trim(),
    description: value.description.trim() || null,
    startDate: value.startDate || null,
    dueDate: value.dueDate || null,
  };
}

/** Indica si el borrador cambia algo respecto de la tarea guardada. */
export function draftDiffersFrom(draft: TaskEditDraft, task: Task): boolean {
  return (
    draft.name !== task.name ||
    draft.description !== (task.description?.trim() || null) ||
    draft.startDate !== task.startDate ||
    draft.dueDate !== task.dueDate
  );
}
