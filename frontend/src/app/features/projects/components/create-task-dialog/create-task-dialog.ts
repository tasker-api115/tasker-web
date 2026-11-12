import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideUserPlus } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { AuthService } from '../../../../core/auth/auth.service';
import { Project } from '../../../projects/data/project.model';
import { CreatedProjectTask } from '../../data/task-create.model';
import { TasksService } from '../../data/tasks.service';

const INPUT_CLASSES =
  'h-9 w-full rounded-md border border-input bg-input/30 px-2.5 ' +
  'text-sm text-foreground placeholder:text-muted-foreground ' +
  'outline-none transition-colors focus-visible:border-ring ' +
  'focus-visible:ring-3 focus-visible:ring-ring/50 ' +
  'aria-invalid:border-destructive';

const TEXTAREA_CLASSES =
  'min-h-24 w-full resize-y rounded-md border border-input ' +
  'bg-input/30 px-2.5 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground outline-none transition-colors ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

const optionalDateValidator: ValidatorFn = (control) => {
  const value: unknown = control.value;

  if (value === '' || value === null) {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return { invalidDate: true };
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    ? { invalidDate: true }
    : null;
};

const dateOrderValidator: ValidatorFn = (group) => {
  const start = group.get('startDate');
  const due = group.get('dueDate');

  if (!start || !due || start.invalid || due.invalid) {
    return null;
  }

  const startValue: unknown = start.value;
  const dueValue: unknown = due.value;

  if (
    typeof startValue === 'string' &&
    typeof dueValue === 'string' &&
    startValue &&
    dueValue &&
    dueValue < startValue
  ) {
    return { dateOrder: true };
  }

  return null;
};

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    ZardDialogImports,
    ZardButtonComponent,
  ],
  viewProviders: [provideIcons({ lucidePlus, lucideUserPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-task-dialog.html',
})
export class CreateTaskDialog {
  private readonly auth = inject(AuthService);
  private readonly tasks = inject(TasksService);
  private readonly fb = inject(FormBuilder).nonNullable;

  private readonly formElement =
    viewChild<ElementRef<HTMLFormElement>>('taskForm');

  readonly project = input.required<Project>();
  readonly created = output<CreatedProjectTask>();

  protected readonly open = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly textareaClasses = TEXTAREA_CLASSES;

  protected readonly isOwner = computed(
    () => this.auth.session()?.user.id === this.project().ownerId,
  );

  protected readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.pattern(/\S/)]],
      description: [''],
      startDate: ['', [optionalDateValidator]],
      dueDate: ['', [optionalDateValidator]],
    },
    { validators: dateOrderValidator },
  );

  protected get nameInvalid(): boolean {
    return this.submitted() && this.form.controls.name.invalid;
  }

  protected get startDateInvalid(): boolean {
    return this.submitted() && this.form.controls.startDate.invalid;
  }

  protected get dueDateInvalid(): boolean {
    return (
      this.submitted() &&
      (this.form.controls.dueDate.invalid ||
        this.form.hasError('dateOrder'))
    );
  }

  protected openDialog(): void {
    if (!this.isOwner() || this.saving()) {
      return;
    }

    this.saveError.set(null);
    this.open.set(true);
  }

  protected async submit(): Promise<void> {
    if (this.saving()) {
      return;
    }

    this.submitted.set(true);
    this.saveError.set(null);

    if (!this.isOwner()) {
      this.saveError.set(
        'Solo el propietario puede crear tareas en este proyecto.',
      );
      return;
    }

    this.form.patchValue({
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim(),
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      const fieldId = this.form.controls.name.invalid
        ? 'create-task-name'
        : this.form.controls.startDate.invalid
          ? 'create-task-start-date'
          : 'create-task-due-date';

      this.formElement()
        ?.nativeElement.querySelector<HTMLInputElement>(`#${fieldId}`)
        ?.focus();

      return;
    }

    const projectId = this.project().id;
    const value = this.form.getRawValue();

    this.saving.set(true);
    this.form.disable();

    try {
      const result = await this.tasks.create(projectId, {
        name: value.name,
        description: value.description || null,
        startDate: value.startDate || null,
        dueDate: value.dueDate || null,
      });

      if (!result.ok) {
        this.saveError.set(result.message);
        return;
      }

      this.form.reset();
      this.submitted.set(false);
      this.open.set(false);
      this.created.emit(result.task);
    } catch {
      this.saveError.set(
        'No pudimos confirmar la operación. Revisa las tareas antes de reintentar.',
      );
    } finally {
      this.form.enable();
      this.saving.set(false);
    }
  }
}