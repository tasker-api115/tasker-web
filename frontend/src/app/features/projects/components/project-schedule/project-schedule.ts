import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideCircleAlert,
  lucideRefreshCcw,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { TaskDetailDialog } from '../../../tasks/components/task-detail-dialog/task-detail-dialog';
import { TaskStatusBadge } from '../../../tasks/components/task-status-badge/task-status-badge';
import { TaskBoardService } from '../../../tasks/data/task-board.service';
import { TASK_STATUS_LABELS, Task } from '../../../tasks/data/task.model';
import { formatProjectDate } from '../../utils/format-project-date';

/** Ancho de un día en la escala, en píxeles. */
const DAY_WIDTH = 28;

type StatusFilter = 'todas' | 'pendiente' | 'en_progreso' | 'completada';

const STATUS_FILTERS: readonly { readonly value: StatusFilter; readonly label: string }[] = [
  { value: 'todas', label: 'Estado: Todas' },
  { value: 'pendiente', label: 'Estado: Por hacer' },
  { value: 'en_progreso', label: 'Estado: En progreso' },
  { value: 'completada', label: 'Estado: Completada' },
];

const MONTH_FORMAT = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });
const SHORT_FORMAT = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' });

interface ScaleDay {
  readonly iso: string;
  readonly day: number;
  readonly monthStart: boolean;
  readonly weekend: boolean;
}

interface ScaleGroup {
  readonly label: string;
  readonly span: number;
}

interface ScheduleRow {
  readonly task: Task;
  readonly datesLabel: string;
  /** Posición de la barra; null si falta inicio o fin («Sin fechas»). */
  readonly bar: {
    readonly left: number;
    readonly width: number;
    readonly label: string;
    readonly description: string;
  } | null;
}

/** `AAAA-MM-DD` a fecha local (sin que la zona horaria cambie el día). */
function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIso(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shortDate(value: string): string {
  return SHORT_FORMAT.format(parseDate(value)).replace('.', '');
}

/**
 * Cronograma de consulta (HU-34 / SCRUM-48), según el handoff de HU-12.
 *
 * Usa las mismas tareas que el tablero Kanban (TaskBoardService, cargadas desde Supabase).
 * La escala cubre meses completos, del mes del primer inicio al mes de la última entrega;
 * cada barra va de la fecha de inicio a la de entrega. Sin inicio o sin fin se muestra
 * «Sin fechas» y no se dibuja duración. Solo consulta: no se editan fechas ni estados.
 */
@Component({
  selector: 'app-project-schedule',
  imports: [NgIcon, ZardButtonComponent, TaskStatusBadge, TaskDetailDialog],
  viewProviders: [
    provideIcons({
      lucideCalendarDays,
      lucideCircleAlert,
      lucideRefreshCcw,
      lucideSearch,
      lucideX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-schedule.html',
  styleUrl: './project-schedule.css',
})
export class ProjectSchedule {
  private readonly store = inject(TaskBoardService);

  readonly projectId = input.required<string>();
  /** Pide mostrar el tablero Kanban (estado vacío). */
  readonly kanbanRequested = output<void>();

  protected readonly dayWidth = DAY_WIDTH;
  protected readonly statusFilters = STATUS_FILTERS;
  protected readonly statusLabels = TASK_STATUS_LABELS;
  protected readonly formatDate = formatProjectDate;

  protected readonly status = this.store.status;
  protected readonly query = signal('');
  protected readonly statusFilter = signal<StatusFilter>('todas');

  protected readonly detailOpen = signal(false);
  protected readonly selectedTask = signal<Task | null>(null);

  private readonly allTasks = computed(() =>
    [...this.store.tasks()].sort((a, b) => {
      const startA = a.startDate ?? a.dueDate ?? '9999';
      const startB = b.startDate ?? b.dueDate ?? '9999';
      return startA.localeCompare(startB) || a.number - b.number;
    }),
  );

  protected readonly hasTasks = computed(() => this.allTasks().length > 0);

  protected readonly visibleTasks = computed(() => {
    const term = this.query().trim().toLocaleLowerCase('es');
    const filter = this.statusFilter();
    return this.allTasks().filter(
      (task) =>
        (filter === 'todas' || task.status === filter) &&
        (!term || task.name.toLocaleLowerCase('es').includes(term)),
    );
  });

  protected readonly resultLabel = computed(() => {
    const total = this.visibleTasks().length;
    return total === 1 ? '1 tarea mostrada' : `${total} tareas mostradas`;
  });

  /** Días de la escala: meses completos que cubren todas las fechas del proyecto. */
  protected readonly days = computed<readonly ScaleDay[]>(() => {
    const dates = this.allTasks()
      .flatMap((task) => [task.startDate, task.dueDate])
      .filter((value): value is string => !!value)
      .sort();

    const first = dates.length ? parseDate(dates[0]) : new Date();
    const last = dates.length ? parseDate(dates[dates.length - 1]) : new Date();
    const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
    const end = new Date(last.getFullYear(), last.getMonth() + 1, 0);

    const days: ScaleDay[] = [];
    while (cursor <= end) {
      days.push({
        iso: toIso(cursor),
        day: cursor.getDate(),
        monthStart: cursor.getDate() === 1,
        weekend: cursor.getDay() === 0 || cursor.getDay() === 6,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  });

  protected readonly months = computed<readonly ScaleGroup[]>(() => {
    const groups: ScaleGroup[] = [];
    for (const day of this.days()) {
      if (day.monthStart || groups.length === 0) {
        groups.push({
          label: capitalize(MONTH_FORMAT.format(parseDate(day.iso)).replace(' de ', ' ')),
          span: 0,
        });
      }
      groups[groups.length - 1] = {
        ...groups[groups.length - 1],
        span: groups[groups.length - 1].span + 1,
      };
    }
    return groups;
  });

  /** Semanas de cada mes como en el diseño: 1–7, 8–14, 15–21, 22–28, 29–30. */
  protected readonly weeks = computed<readonly ScaleGroup[]>(() => {
    const groups: { first: number; last: number }[] = [];
    for (const day of this.days()) {
      if ((day.day - 1) % 7 === 0) {
        groups.push({ first: day.day, last: day.day });
      } else {
        groups[groups.length - 1].last = day.day;
      }
    }
    return groups.map(({ first, last }) => ({
      label: first === last ? `${first}` : `${first}–${last}`,
      span: last - first + 1,
    }));
  });

  protected readonly scaleWidth = computed(() => this.days().length * DAY_WIDTH);

  /** Posición de «hoy» en la escala, si cae dentro de ella. */
  protected readonly todayOffset = computed(() => {
    const index = this.days().findIndex((day) => day.iso === toIso(new Date()));
    return index < 0 ? null : index * DAY_WIDTH + DAY_WIDTH / 2;
  });

  protected readonly scaleLabel = computed(() => {
    const months = this.months();
    return months.length === 1
      ? months[0].label
      : `${months[0].label} – ${months[months.length - 1].label}`;
  });

  protected readonly rows = computed<readonly ScheduleRow[]>(() => {
    const index = new Map(this.days().map((day, position) => [day.iso, position]));

    return this.visibleTasks().map((task) => {
      const { startDate, dueDate } = task;
      const datesLabel = `Inicio ${startDate ? shortDate(startDate) : 'sin fecha'} · Fin ${
        dueDate ? shortDate(dueDate) : 'sin fecha'
      }`;

      if (!startDate || !dueDate) {
        return { task, datesLabel, bar: null };
      }

      const from = index.get(startDate) ?? 0;
      const to = index.get(dueDate) ?? from;
      const sameMonth = startDate.slice(0, 7) === dueDate.slice(0, 7);
      return {
        task,
        datesLabel,
        bar: {
          left: from * DAY_WIDTH,
          width: (to - from + 1) * DAY_WIDTH,
          label: sameMonth
            ? `${startDate.slice(8)}–${dueDate.slice(8)}`
            : `${shortDate(startDate)}–${shortDate(dueDate)}`,
          description: `${task.name}: del ${formatProjectDate(startDate)} al ${formatProjectDate(
            dueDate,
          )}, ${TASK_STATUS_LABELS[task.status]}. Ver detalle.`,
        },
      };
    });
  });

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(input: HTMLInputElement): void {
    this.query.set('');
    input.value = '';
    input.focus();
  }

  protected onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as StatusFilter);
  }

  protected openDetail(task: Task): void {
    this.selectedTask.set(task);
    this.detailOpen.set(true);
  }

  protected retry(): void {
    void this.store.loadByProject(this.projectId());
  }
}
