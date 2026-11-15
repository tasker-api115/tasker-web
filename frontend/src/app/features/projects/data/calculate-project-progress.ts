export interface ProjectProgress {
  /** Total de tareas asociadas al proyecto (todas, sin importar su estado). */
  readonly total: number;
  /** Tareas en estado `completada`. */
  readonly completed: number;
  /** Porcentaje entero 0–100. */
  readonly percentage: number;
}

/**
 * TODO(backend): si más adelante el avance se calcula en la base de datos
 * (vista o RPC), debe aplicar exactamente esta misma fórmula.
 */
export function calculateProjectProgress(
  statuses: readonly string[],
): ProjectProgress {
  const total = statuses.length;
  const completed = statuses.filter((status) => status === 'completada').length;

  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}