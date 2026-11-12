import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

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

  protected statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? 'Estado no reconocido';
  }
}