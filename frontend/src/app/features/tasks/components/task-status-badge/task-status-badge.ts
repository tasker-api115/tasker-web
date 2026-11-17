import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideCircleDashed,
  lucideCircleX,
  lucideClock,
  lucideEye,
} from '@ng-icons/lucide';
import { TASK_STATUS_LABELS, TaskStatus } from '../../data/task.model';

const STATUS_ICONS: Record<TaskStatus, string> = {
  pendiente: 'lucideCircleDashed',
  en_progreso: 'lucideClock',
  en_revision: 'lucideEye',
  completada: 'lucideCircleCheck',
  cancelada: 'lucideCircleX',
};

/**
 * Estado de una tarea con texto e icono (no solo color), como en los frames de cronograma
 * y reportes: Por hacer neutro, En progreso con borde, Completada resaltada.
 */
@Component({
  selector: 'app-task-status-badge',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({ lucideCircleCheck, lucideCircleDashed, lucideCircleX, lucideClock, lucideEye }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="status-badge" [attr.data-status]="status()">
    <ng-icon [name]="icon()" aria-hidden="true" />{{ label() }}
  </span>`,
  styles: `
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 22px;
      padding: 0 7px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: var(--muted);
      color: var(--muted-foreground);
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }

    .status-badge ng-icon {
      font-size: 13px;
    }

    [data-status='en_progreso'] {
      border-color: color-mix(in oklab, var(--primary) 60%, transparent);
      background: color-mix(in oklab, var(--primary) 12%, transparent);
      color: var(--primary);
    }

    [data-status='en_revision'] {
      border-color: var(--border);
      color: var(--foreground);
    }

    [data-status='completada'] {
      background: var(--primary);
      color: var(--primary-foreground);
    }

    [data-status='cancelada'] {
      text-decoration: line-through;
    }
  `,
})
export class TaskStatusBadge {
  readonly status = input.required<TaskStatus>();
  protected readonly label = computed(() => TASK_STATUS_LABELS[this.status()]);
  protected readonly icon = computed(() => STATUS_ICONS[this.status()]);
}
