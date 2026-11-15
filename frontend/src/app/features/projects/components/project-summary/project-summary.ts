import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { TaskStatus, isOverdue } from '../../../tasks/data/task.model';
import { ProjectDetail } from '../../data/project-detail.model';
import { formatProjectDate } from '../../utils/format-project-date';
import { ProjectMembers } from '../project-members/project-members';

const STATUS_LABELS: Readonly<Record<string, string>> = {
  pendiente: 'Por hacer',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

@Component({
  selector: 'app-project-summary',
  standalone: true,
  imports: [ProjectMembers],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-summary.html',
  styleUrl: '../project-detail-content.css',
})
export class ProjectSummary {
  readonly detail = input.required<ProjectDetail>();
  readonly isOwner = input(false);

  protected readonly formatDate = formatProjectDate;

  protected readonly progress = computed(() => {
    // Regla provisional pendiente de confirmar con el equipo.
    const considered = this.detail().tasks.filter(
      (task) => task.status !== 'cancelada',
    );

    const completed = considered.filter(
      (task) => task.status === 'completada',
    ).length;

    return {
      total: considered.length,
      completed,
      percentage:
        considered.length === 0
          ? 0
          : Math.round((completed / considered.length) * 100),
    };
  });

  /** Totales de tareas por estado del proyecto seleccionado (HU-38 / SCRUM-53). */
  protected readonly statusSummary = computed(() => {
    const tasks = this.detail().tasks;
    const count = (status: string) => tasks.filter((task) => task.status === status).length;

    return {
      total: tasks.length,
      pending: count('pendiente'),
      inProgress: count('en_progreso'),
      inReview: count('en_revision'),
      completed: count('completada'),
      cancelled: count('cancelada'),
      // Misma regla que el tablero: entrega pasada y tarea sin completar ni cancelar.
      overdue: tasks.filter((task) => isOverdue(task.endDate, task.status as TaskStatus)).length,
    };
  });

  protected statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? 'Estado no reconocido';
  }
}