export type TaskStatus = 'pendiente' | 'en_progreso' | 'en_revision' | 'completada' | 'cancelada';
export type TaskComplexity = 'baja' | 'media' | 'alta';

export interface TaskAssignee {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly number: number;
  readonly name: string;
  readonly description: string | null;
  readonly startDate: string | null;
  readonly dueDate: string | null;
  readonly status: TaskStatus;
  readonly complexity: TaskComplexity | null;
  readonly assignees: readonly TaskAssignee[];
  readonly overdue: boolean;
}

/** Fila de `public.tarea` con sus responsables (`ejecuta` → `usuario`). */
export interface TaskRow {
  id_tarea: string;
  id_proyecto: string;
  numero_tarea: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: TaskStatus;
  complejidad: TaskComplexity | null;
  ejecuta?:
    | { id_usuario: string; usuario: { nombre: string; apellido: string | null } | null }[]
    | null;
}

/** Fecha local de hoy como `AAAA-MM-DD`, comparable con las columnas `date`. */
function localToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function isOverdue(dueDate: string | null, status: TaskStatus, today = localToday()): boolean {
  if (!dueDate || status === 'completada' || status === 'cancelada') {
    return false;
  }
  return dueDate < today;
}

function toAssignee(row: NonNullable<TaskRow['ejecuta']>[number]): TaskAssignee {
  const name = [row.usuario?.nombre, row.usuario?.apellido].filter(Boolean).join(' ') || 'Sin nombre';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return { id: row.id_usuario, name, initials };
}

export function toTask(row: TaskRow): Task {
  return {
    id: row.id_tarea,
    projectId: row.id_proyecto,
    number: row.numero_tarea,
    name: row.nombre,
    description: row.descripcion,
    startDate: row.fecha_inicio,
    dueDate: row.fecha_fin,
    status: row.estado,
    complexity: row.complejidad,
    assignees: (row.ejecuta ?? []).map(toAssignee),
    overdue: isOverdue(row.fecha_fin, row.estado),
  };
}