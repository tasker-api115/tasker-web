import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideUserPlus } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { AuthService } from '../../../../core/auth/auth.service';
import { Project } from '../../../projects/data/project.model';

const INPUT_CLASSES =
  'h-9 w-full rounded-md border border-input bg-input/30 px-2.5 ' +
  'text-sm text-foreground placeholder:text-muted-foreground ' +
  'outline-none transition-colors focus-visible:border-ring ' +
  'focus-visible:ring-3 focus-visible:ring-ring/50';

const TEXTAREA_CLASSES =
  'min-h-24 w-full resize-y rounded-md border border-input ' +
  'bg-input/30 px-2.5 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground outline-none transition-colors ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

/**
 * Botón y modal visual para crear tareas desde Kanban.
 *
 * Alcance:
 * - Mostrar el botón únicamente al propietario.
 * - Abrir y cerrar el modal.
 * - Presentar los campos del diseño.
 * - Conservar lo escrito al cerrar y volver a abrir.
 *
 * Pendientes:
 * - Validaciones definitivas.
 * - Selección de responsables.
 * - Guardado y actualización del tablero.
 */
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
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly project = input.required<Project>();

  protected readonly open = signal(false);
  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly textareaClasses = TEXTAREA_CLASSES;

  protected readonly isOwner = computed(
    () => this.auth.session()?.user.id === this.project().ownerId,
  );

  protected readonly form = this.fb.group({
    name: [''],
    description: [''],
    startDate: [''],
    dueDate: [''],
  });

  protected openDialog(): void {
    if (!this.isOwner()) {
      return;
    }

    this.open.set(true);
  }
}