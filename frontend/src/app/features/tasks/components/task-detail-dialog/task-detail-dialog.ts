import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { formatProjectDate } from '../../../projects/utils/format-project-date';
import { TASK_COMPLEXITY_LABELS, TASK_STATUS_LABELS, Task } from '../../data/task.model';

/** Detalle de una tarea (HU-27 / SCRUM-40). Solo lectura. */
@Component({
  selector: 'app-task-detail-dialog',
  imports: [ZardDialogImports, ZardButtonComponent, ZardBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-detail-dialog.html',
})
export class TaskDetailDialog {
  /** Tarea que se muestra. */
  readonly task = input<Task | null>(null);
  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);

  protected readonly statusLabels = TASK_STATUS_LABELS;
  protected readonly complexityLabels = TASK_COMPLEXITY_LABELS;
  protected readonly formatDate = formatProjectDate;
}