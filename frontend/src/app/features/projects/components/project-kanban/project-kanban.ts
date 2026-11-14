import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
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
import { AuthService } from '../../../../core/auth/auth.service';
import { DeleteTaskDialog } from '../../../tasks/components/delete-task-dialog/delete-task-dialog';
import { TaskDetailDialog } from '../../../tasks/components/task-detail-dialog/task-detail-dialog';
import { TaskBoardService } from '../../../tasks/data/task-board.service';
import { TASK_STATUS_LABELS, Task, TaskStatus } from '../../../tasks/data/task.model';
import { ProjectTask } from '../../data/project-detail.model';
import { formatProjectDate } from '../../utils/format-project-date';

interface BoardColumn {
  readonly status: TaskStatus;
  readonly title: string;
  readonly icon: string;
}

interface BoardNotice {
  readonly kind: 'pending' | 'success' | 'error';
  readonly title: string;
  readonly text: string;
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

/**
 * Tablero Kanban del proyecto: visualización (HU-32), detalle (HU-27),
 * eliminación (HU-29) y cambio de estado (HU-33).
 */
@Component({
  selector: 'app-project-kanban',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    DeleteTaskDialog,
    NgIcon,
    TaskDetailDialog,
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
  private readonly auth = inject(AuthService);

  readonly projectId = input.required<string>();
  /** Tareas del detalle: cuando cambian (por ejemplo, al crear una tarea) el tablero se recarga. */
  readonly tasks = input<readonly ProjectTask[]>([]);
  /** El propietario puede eliminar tareas y mover cualquiera. */
  readonly isOwner = input(false);
  /** Se emite con el id de la tarea eliminada para que la página actualice sus datos. */
  readonly taskDeleted = output<string>();
  /** Se emite cuando una tarea cambió de estado y quedó guardada. */
  readonly taskStatusChanged = output<{ readonly id: string; readonly status: TaskStatus }>();

  private loadedProjectId: string | null = null;
  private readonly saving = signal(false);
  private readonly currentUserId = computed(() => this.auth.session()?.user.id ?? null);

  protected readonly searchTerm = signal('');
  protected readonly detailOpen = signal(false);
  protected readonly deleteOpen = signal(false);
  protected readonly selectedTask = signal<Task | null>(null);
  protected readonly notice = signal<BoardNotice | null>(null);
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

  /** El propietario mueve cualquier tarea; un integrante, solo las suyas (es responsable). */
  protected canMove(task: Task): boolean {
    if (this.isOwner()) {
      return true;
    }
    const userId = this.currentUserId();
    return userId !== null && task.assignees.some((assignee) => assignee.id === userId);
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

  protected openDetail(task: Task): void {
    this.notice.set(null);
    this.selectedTask.set(task);
    this.detailOpen.set(true);
  }

  protected requestDelete(task: Task): void {
    this.selectedTask.set(task);
    this.detailOpen.set(false);
    this.deleteOpen.set(true);
  }

  protected onDeleted(task: Task): void {
    this.notice.set({
      kind: 'success',
      title: 'Tarea eliminada',
      text: `«${task.name}» ya no aparece en el tablero.`,
    });
    this.taskDeleted.emit(task.id);
  }

  protected onDrop(event: CdkDragDrop<TaskStatus, TaskStatus, Task>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    void this.changeStatus(event.item.data, event.container.data);
  }

  protected onStatusSelect(task: Task, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as TaskStatus;
    void this.changeStatus(task, status);
  }

  private async changeStatus(task: Task, status: TaskStatus): Promise<void> {
    if (task.status === status || !this.canMove(task) || this.saving()) {
      return;
    }
    const previousLabel = TASK_STATUS_LABELS[task.status];
    this.saving.set(true);
    this.notice.set({ kind: 'pending', title: 'Guardando cambio de estado…', text: '' });

    const result = await this.store.updateStatus(task.id, status);
    this.saving.set(false);

    if (result.ok) {
      this.notice.set({
        kind: 'success',
        title: 'Estado actualizado',
        text: `«${task.name}» ahora está en ${TASK_STATUS_LABELS[status]}.`,
      });
      this.taskStatusChanged.emit({ id: task.id, status });
      return;
    }
    this.notice.set({
      kind: 'error',
      title: 'No se pudo cambiar el estado',
      text: `La tarea volvió a ${previousLabel}. El cambio no se guardó.`,
    });
  }
}