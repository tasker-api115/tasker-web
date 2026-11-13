import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCircleDashed,
  lucideCircleX,
  lucideClock,
  lucideEye,
  lucideRefreshCcw,
  lucideSearch,
  lucideSquareCheck,
} from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardEmptyComponent } from '@/shared/components/empty/empty.component';
import { ZardInputComponent } from '@/shared/components/input/input.component';
import { TaskStatus } from '../../../tasks/data/task.model';
import { TaskBoardService } from '../../../tasks/data/task-board.service';
import { ProjectTask } from '../../data/project-detail.model';
import { formatProjectDate } from '../../utils/format-project-date';

interface BoardColumn {
  readonly status: TaskStatus;
  readonly title: string;
  readonly icon: string;
}

/** Una columna por cada estado de `tarea.estado`. Adonay aprobó agregar las dos extra. */
const COLUMNS: readonly BoardColumn[] = [
  { status: 'pendiente', title: 'Por hacer', icon: 'lucideCircleDashed' },
  { status: 'en_progreso', title: 'En progreso', icon: 'lucideClock' },
  { status: 'en_revision', title: 'En revisión', icon: 'lucideEye' },
  { status: 'completada', title: 'Completada', icon: 'lucideCircleCheck' },
  { status: 'cancelada', title: 'Cancelada', icon: 'lucideCircleX' },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Tablero Kanban del proyecto (HU-32 / SCRUM-46). */
@Component({
  selector: 'app-project-kanban',
  standalone: true,
  imports: [
    NgIcon,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardEmptyComponent,
    ZardInputComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideCalendar,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideCircleDashed,
      lucideCircleX,
      lucideClock,
      lucideEye,
      lucideRefreshCcw,
      lucideSearch,
      lucideSquareCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-kanban.html',
})
export class ProjectKanban {
  protected readonly store = inject(TaskBoardService);

  readonly projectId = input.required<string>();
  /** Tareas del detalle: cuando cambian (por ejemplo, al crear una tarea) el tablero se recarga. */
  readonly tasks = input<readonly ProjectTask[]>([]);

  private loadedProjectId: string | null = null;

  protected readonly searchTerm = signal('');
  protected readonly formatDate = formatProjectDate;

  protected readonly searching = computed(() => normalize(this.searchTerm()).length > 0);

  private readonly filteredTasks = computed(() => {
    const term = normalize(this.searchTerm());
    const tasks = this.store.tasks();
    return term ? tasks.filter((task) => normalize(task.name).includes(term)) : tasks;
  });

  protected readonly columns = computed(() =>
    COLUMNS.map((column) => ({
      ...column,
      tasks: this.filteredTasks().filter((task) => task.status === column.status),
    })),
  );

  protected readonly resultsLabel = computed(() => {
    const total = this.columns().reduce((sum, column) => sum + column.tasks.length, 0);
    if (total === 0) {
      return 'No se encontraron tareas. Prueba con otro título o limpia la búsqueda.';
    }
    return total === 1 ? '1 tarea encontrada' : `${total} tareas encontradas`;
  });

  constructor() {
    effect(() => {
      const id = this.projectId();
      this.tasks(); // dependencia reactiva: recarga cuando cambia la lista del detalle
      untracked(() => {
        const silent = this.loadedProjectId === id;
        this.loadedProjectId = id;
        void this.store.loadByProject(id, silent);
      });
    });
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  protected retry(): void {
    void this.store.loadByProject(this.projectId());
  }
}