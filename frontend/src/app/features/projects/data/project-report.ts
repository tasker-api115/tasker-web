import { Task, TaskStatus } from '../../tasks/data/task.model';

/** Fila del reporte de tareas (HU-36). */
export interface ReportRow {
  readonly id: string;
  readonly name: string;
  readonly assignees: string;
  readonly status: TaskStatus;
  readonly dueDate: string | null;
  readonly overdue: boolean;
}

export interface ProjectReport {
  /** Tareas consideradas para el avance (todas menos las canceladas, igual que el resumen). */
  readonly considered: number;
  readonly completed: number;
  readonly percentage: number;
  readonly pending: number;
  readonly inProgress: number;
  readonly inReview: number;
  readonly cancelled: number;
  readonly overdue: number;
  readonly rows: readonly ReportRow[];
}

/**
 * Calcula el reporte del proyecto a partir de las tareas guardadas en Supabase.
 *
 * El avance usa la misma regla que el resumen del proyecto (HU-38): completadas sobre el total
 * sin canceladas, 0 % si no hay tareas. «Vencida» no es un estado: es una alerta aparte, con la
 * misma regla que el tablero (`isOverdue`, ya calculada en cada tarea).
 */
export function buildProjectReport(tasks: readonly Task[]): ProjectReport {
  const count = (status: TaskStatus) => tasks.filter((task) => task.status === status).length;
  const cancelled = count('cancelada');
  const completed = count('completada');
  const considered = tasks.length - cancelled;

  return {
    considered,
    completed,
    percentage: considered === 0 ? 0 : Math.round((completed / considered) * 100),
    pending: count('pendiente'),
    inProgress: count('en_progreso'),
    inReview: count('en_revision'),
    cancelled,
    overdue: tasks.filter((task) => task.overdue).length,
    rows: [...tasks]
      .sort((a, b) => a.number - b.number)
      .map((task) => ({
        id: task.id,
        name: task.name,
        assignees: task.assignees.map((person) => person.name).join(', ') || 'Sin responsable',
        status: task.status,
        dueDate: task.dueDate,
        overdue: task.overdue,
      })),
  };
}

export function overdueLabel(total: number): string {
  return total === 1 ? '1 tarea vencida' : `${total} tareas vencidas`;
}
