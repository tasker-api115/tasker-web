/** Proyecto tal como lo usa la interfaz. Las fechas son cadenas ISO `YYYY-MM-DD` (columna `date`). */
export interface Project {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly createdAt: string;
}

/** Datos que captura el formulario para crear un proyecto. */
export interface ProjectDraft {
  readonly name: string;
  readonly description: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
}

/** Fila de `public.proyecto` (migración HU-18). */
export interface ProjectRow {
  id_proyecto: string;
  id_usuario_propietario: string;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  created_at: string;
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id_proyecto,
    ownerId: row.id_usuario_propietario,
    name: row.nombre,
    description: row.descripcion,
    startDate: row.fecha_inicio,
    endDate: row.fecha_fin,
    createdAt: row.created_at,
  };
}
