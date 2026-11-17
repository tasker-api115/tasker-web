import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert, lucideUserPlus } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { AssigneePicker } from '../../../projects/components/assignee-picker/assignee-picker';
import { ProjectMember } from '../../../projects/data/project-detail.model';
import {
  TaskAssignmentsService,
  assigneesErrorMessage,
} from '../../../projects/data/task-assignments.service';
import { TaskBoardService, UpdateTaskResult } from '../../data/task-board.service';
import {
  createTaskEditForm,
  draftDiffersFrom,
  formValueToDraft,
  taskToFormValue,
} from '../../data/task-form';
import { TASK_STATUS_LABELS, Task, makeAssignee } from '../../data/task.model';

type UpdateTaskFailure = Extract<UpdateTaskResult, { ok: false }>['reason'];

const SAVE_ERROR_MESSAGES: Record<UpdateTaskFailure, string> = {
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed':
    'La tarea ya no existe o no tienes permiso para editarla. Los datos se conservaron.',
  invalid: 'Los datos no cumplen las reglas de la tarea. Revisa las fechas.',
  unknown: 'Los datos se conservaron. Puedes volver a intentarlo.',
};

const INPUT_CLASSES =
  'h-9 w-full rounded-md border border-input bg-input/30 px-2.5 text-sm text-foreground ' +
  'placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring ' +
  'focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive ' +
  'disabled:opacity-60';

const TEXTAREA_CLASSES =
  'min-h-24 w-full resize-y rounded-md border border-input bg-input/30 px-2.5 py-2 text-sm ' +
  'text-foreground placeholder:text-muted-foreground outline-none transition-colors ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60';

/**
 * Modal para editar una tarea (HU-28 / SCRUM-41). Solo lo abre el propietario; el trigger
 * `tarea_permisos` vuelve a validar el permiso al guardar.
 *
 * Igual que editar proyecto (HU-24): valida al enviar y luego en vivo, no llama a Supabase
 * si no hay cambios y no se cierra con clic fuera mientras haya cambios sin guardar.
 */
@Component({
  selector: 'app-edit-task-dialog',
  imports: [ReactiveFormsModule, NgIcon, ZardDialogImports, ZardButtonComponent, AssigneePicker],
  viewProviders: [provideIcons({ lucideCircleAlert, lucideUserPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-task-dialog.html',
  styleUrl: './edit-task-dialog.css',
})
export class EditTaskDialog {
  private readonly board = inject(TaskBoardService);
  private readonly assignments = inject(TaskAssignmentsService);
  private readonly formElement = viewChild<ElementRef<HTMLFormElement>>('taskForm');
  private wasOpen = false;

  readonly task = input<Task | null>(null);
  readonly projectName = input('');
  /** Integrantes registrados en el proyecto (HU-51): los únicos que se pueden asignar. */
  readonly members = input<readonly ProjectMember[]>([]);
  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con la tarea ya guardada en Supabase. */
  readonly updated = output<Task>();

  protected readonly form = createTaskEditForm();
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  /** Responsables elegidos en el formulario. */
  protected readonly selectedAssignees = signal<readonly string[]>([]);

  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly textareaClasses = TEXTAREA_CLASSES;
  protected readonly statusLabels = TASK_STATUS_LABELS;

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Hay cambios sin guardar: el clic fuera no debe descartarlos en silencio. */
  protected readonly dirty = computed(() => {
    this.formValue();
    const task = this.task();
    return (
      task !== null &&
      (draftDiffersFrom(formValueToDraft(this.form.getRawValue()), task) ||
        this.assigneesChanged(task))
    );
  });

  protected readonly assigneeNames = computed(
    () =>
      this.task()
        ?.assignees.map((assignee) => assignee.name)
        .join(', ') || 'Sin responsable',
  );

  constructor() {
    // Al abrir se cargan los valores guardados y se limpia el intento anterior.
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        const task = this.task();
        if (isOpen && !this.wasOpen && task) {
          this.form.reset(taskToFormValue(task));
          this.form.enable();
          this.submitted.set(false);
          this.saveError.set(null);
          this.selectedAssignees.set(task.assignees.map((assignee) => assignee.id));
        }
        this.wasOpen = isOpen;
      });
    });
  }

  protected get nameInvalid(): boolean {
    return this.submitted() && this.form.controls.name.invalid;
  }

  protected get startDateInvalid(): boolean {
    return this.submitted() && this.form.controls.startDate.invalid;
  }

  protected get dueDateInvalid(): boolean {
    return (
      this.submitted() && (this.form.controls.dueDate.invalid || this.form.hasError('dateOrder'))
    );
  }

  protected get showValidationAlert(): boolean {
    return this.submitted() && this.form.invalid;
  }

  protected async submit(): Promise<void> {
    const task = this.task();
    if (this.saving() || !task) {
      return;
    }

    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const draft = formValueToDraft(this.form.getRawValue());
    const draftChanged = draftDiffersFrom(draft, task);
    const assigneesChanged = this.assigneesChanged(task);

    if (!draftChanged && !assigneesChanged) {
      this.open.set(false);
      return;
    }

    this.saving.set(true);
    this.form.disable({ emitEvent: false });

    try {
      let saved = task;

      if (draftChanged) {
        const result = await this.board.update(task.id, draft);
        if (!result.ok) {
          this.saveError.set(SAVE_ERROR_MESSAGES[result.reason]);
          return;
        }
        saved = result.task;
      }

      if (assigneesChanged) {
        /*
         * Responsables: se guardan en `ejecuta` después de los datos de la tarea.
         * TODO(backend): no es atómico con el UPDATE de `tarea`; ver la RPC sugerida en
         * projects/data/task-assignments.service.ts.
         */
        const nextIds = this.selectedAssignees();
        const assigned = await this.assignments.replace(
          task.id,
          task.assignees.map((assignee) => assignee.id),
          nextIds,
          this.members().map((member) => member.id),
        );

        if (!assigned.ok) {
          if (draftChanged) {
            // Los datos sí se guardaron: se avisa para no ocultar ese cambio.
            this.updated.emit(saved);
            this.saveError.set(
              `Se guardaron los datos de la tarea, pero no los responsables. ${assigneesErrorMessage(assigned.reason)}`,
            );
          } else {
            this.saveError.set(assigneesErrorMessage(assigned.reason));
          }
          return;
        }

        const names = new Map(this.members().map((member) => [member.id, member.name]));
        saved =
          this.board.setAssignees(
            task.id,
            nextIds.map((id) => makeAssignee(id, names.get(id) ?? 'Sin nombre')),
          ) ?? saved;
      }

      this.updated.emit(saved);
      this.open.set(false);
    } catch {
      this.saveError.set(SAVE_ERROR_MESSAGES.unknown);
    } finally {
      this.saving.set(false);
      this.form.enable({ emitEvent: false });
    }
  }

  /** Los responsables marcados difieren de los guardados. */
  private assigneesChanged(task: Task): boolean {
    const current = new Set(task.assignees.map((assignee) => assignee.id));
    const next = this.selectedAssignees();
    return next.length !== current.size || next.some((id) => !current.has(id));
  }

  private focusFirstInvalid(): void {
    const controls = this.form.controls;
    const fieldId = controls.name.invalid
      ? 'edit-task-name'
      : controls.startDate.invalid
        ? 'edit-task-start-date'
        : 'edit-task-due-date';

    this.formElement()?.nativeElement.querySelector<HTMLElement>(`#${fieldId}`)?.focus();
  }
}
