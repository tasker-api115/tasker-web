-- HU-28 (SCRUM-41 / SCRUM-87) y HU-31 (SCRUM-44 / SCRUM-93): permisos para editar
-- tareas y cambiar su estado.
--
-- La política tarea_acceso (FOR ALL, es_miembro) deja que cualquier integrante
-- actualice cualquier columna de cualquier tarea del proyecto. Las historias piden:
--   * HU-28: solo el propietario del proyecto edita los datos de la tarea.
--   * HU-31: el responsable asignado a la tarea, o el propietario, cambia su estado
--     entre Por hacer, En progreso y Completada. Quien no es integrante no puede
--     (eso ya lo impide tarea_acceso: la fila no es visible y no se actualiza).
--
-- En lugar de reemplazar tarea_acceso (que también usan crear, consultar y eliminar),
-- este trigger revisa cada UPDATE hecho por un usuario autenticado:
--   * Propietario: puede cambiar cualquier dato y cualquier estado.
--   * Otro integrante: solo puede cambiar `estado`, solo en tareas donde está en
--     `ejecuta`, y solo a 'pendiente', 'en_progreso' o 'completada'.
-- Las operaciones sin usuario (SQL Editor, service_role) no se restringen.
--
-- Errores: 42501 (insufficient_privilege) sin permiso; 23514 (check_violation)
-- estado no permitido para el responsable.

CREATE OR REPLACE FUNCTION tasker_privado.validar_permisos_tarea()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
    v_usuario UUID := (SELECT auth.uid());
BEGIN
    IF v_usuario IS NULL OR tasker_privado.es_propietario(OLD.id_proyecto) THEN
        RETURN NEW;
    END IF;

    -- Cualquier columna distinta de estado (y la marca de auditoría) es edición.
    IF (to_jsonb(NEW) - 'estado' - 'updated_at')
       IS DISTINCT FROM (to_jsonb(OLD) - 'estado' - 'updated_at') THEN
        RAISE EXCEPTION 'Solo el propietario del proyecto puede editar la tarea.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.ejecuta e
            WHERE e.id_tarea = OLD.id_tarea AND e.id_usuario = v_usuario
        ) THEN
            RAISE EXCEPTION 'Solo los responsables de la tarea o el propietario pueden cambiar su estado.'
                USING ERRCODE = 'insufficient_privilege';
        END IF;

        IF NEW.estado NOT IN ('pendiente', 'en_progreso', 'completada') THEN
            RAISE EXCEPTION 'Estado no permitido para el responsable: %', NEW.estado
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION tasker_privado.validar_permisos_tarea() FROM public;

DROP TRIGGER IF EXISTS tarea_permisos ON public.tarea;

CREATE TRIGGER tarea_permisos
  BEFORE UPDATE ON public.tarea
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.validar_permisos_tarea();
