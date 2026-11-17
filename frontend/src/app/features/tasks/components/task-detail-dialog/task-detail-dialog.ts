import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { formatProjectDate } from '../../../projects/utils/format-project-date';
import { TASK_COMPLEXITY_LABELS, TASK_STATUS_LABELS, Task } from '../../data/task.model';

/**
 * Detalle de una tarea (HU-27 / SCRUM-40). El propietario puede editarla (HU-28) y eliminarla
 * (HU-29); el propietario y los responsables pueden cambiar su estado (HU-31).
 */
@Component({
  selector: 'app-task-detail-dialog',
  imports: [ZardDialogImports, ZardButtonComponent, ZardBadgeComponent, NgIcon],
  viewProviders: [provideIcons({ lucideChevronDown, lucidePencil, lucideTrash2 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-detail-dialog.html',
})
export class TaskDetailDialog {
  readonly task = input<Task | null>(null);
  readonly open = model(false);
  /** Solo el propietario ve la opción de eliminar. */
  readonly canDelete = input(false);
  /** Se emite cuando el propietario pide eliminar la tarea mostrada. */
  readonly deleteRequested = output<Task>();
  /** Solo el propietario ve la opción de editar (HU-28). */
  readonly canEdit = input(false);
  /** El propietario y los responsables de la tarea pueden cambiar su estado (HU-31). */
  readonly canChangeStatus = input(false);
  /** Quién cambia el estado, por ejemplo «Diego Pérez · responsable asignado». */
  readonly identity = input('');
  /** Aviso opcional sobre la vista, p. ej. «Solo consulta · sin edición desde el cronograma.». */
  readonly note = input('');
  readonly editRequested = output<Task>();
  readonly statusChangeRequested = output<Task>();

  protected readonly statusLabels = TASK_STATUS_LABELS;
  protected readonly complexityLabels = TASK_COMPLEXITY_LABELS;
  protected readonly formatDate = formatProjectDate;

  protected requestEdit(): void {
    const task = this.task();
    if (task) {
      this.editRequested.emit(task);
    }
  }

  protected requestStatusChange(): void {
    const task = this.task();
    if (task) {
      this.statusChangeRequested.emit(task);
    }
  }

  protected requestDelete(): void {
    const task = this.task();
    if (task) {
      this.deleteRequested.emit(task);
    }
  }
}