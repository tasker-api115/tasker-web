import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import {
  ASSIGNEE_TASK_STATUSES,
  TASK_STATUS_LABELS,
  Task,
  TaskStatus,
} from '../../data/task.model';

/**
 * Selector de estado de una tarea (HU-31 / SCRUM-44), según el frame `state-menu`.
 *
 * Ofrece Por hacer, En progreso y Completada. Si la tarea está en otro estado (En revisión
 * o Cancelada, que solo maneja el propietario desde el tablero), se muestra como actual.
 * Elegir una opción cierra el diálogo y deja el guardado al tablero, que muestra el avance.
 */
@Component({
  selector: 'app-change-task-status-dialog',
  imports: [NgIcon, ZardDialogImports, ZardButtonComponent],
  viewProviders: [provideIcons({ lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './change-task-status-dialog.html',
})
export class ChangeTaskStatusDialog {
  readonly task = input<Task | null>(null);
  /** Quién cambia el estado, por ejemplo «Diego Pérez · responsable asignado». */
  readonly identity = input('');
  /** Visibilidad del diálogo, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el estado elegido (distinto del actual). */
  readonly statusSelected = output<TaskStatus>();

  protected readonly labels = TASK_STATUS_LABELS;

  protected readonly options = computed<readonly TaskStatus[]>(() => {
    const current = this.task()?.status;
    return current && !ASSIGNEE_TASK_STATUSES.includes(current)
      ? [current, ...ASSIGNEE_TASK_STATUSES]
      : ASSIGNEE_TASK_STATUSES;
  });

  protected select(status: TaskStatus): void {
    const task = this.task();
    this.open.set(false);
    if (task && task.status !== status) {
      this.statusSelected.emit(status);
    }
  }
}
