/** Resultado del cálculo de avance de un proyecto (HU-35). */
export interface ProjectProgress {
  /** Total de tareas asociadas al proyecto (todas, sin importar su estado). */
  readonly total: number;
  /** Tareas en estado `completada`. */
  readonly completed: number;
  /** Porcentaje entero 0–100. */
  readonly percentage: number;
}

/**
 * Calcula el avance de un proyecto a partir de los estados de sus tareas.
 *
 * Fórmula (HU-35): Progreso = (Tareas completadas / Total de tareas) × 100
 * - El total incluye todas las tareas del proyecto, también las canceladas.
 * - Sin tareas, el avance es 0 %.
 * - Se redondea al entero más cercano para mostrarlo.
 *
 * Es la única fuente de la regla: la usan el dashboard (listado de proyectos)
 * y el detalle del proyecto para que ambos muestren siempre el mismo valor.
 *
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