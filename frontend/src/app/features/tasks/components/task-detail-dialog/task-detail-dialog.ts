import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { formatProjectDate } from '../../../projects/utils/format-project-date';
import { TASK_COMPLEXITY_LABELS, TASK_STATUS_LABELS, Task } from '../../data/task.model';

/** Detalle de una tarea (HU-27 / SCRUM-40), con la opción de eliminar para el propietario (HU-29). */
@Component({
  selector: 'app-task-detail-dialog',
  imports: [ZardDialogImports, ZardButtonComponent, ZardBadgeComponent, NgIcon],
  viewProviders: [provideIcons({ lucideTrash2 })],
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

  protected readonly statusLabels = TASK_STATUS_LABELS;
  protected readonly complexityLabels = TASK_COMPLEXITY_LABELS;
  protected readonly formatDate = formatProjectDate;

  protected requestDelete(): void {
    const task = this.task();
    if (task) {
      this.deleteRequested.emit(task);
    }
  }
}