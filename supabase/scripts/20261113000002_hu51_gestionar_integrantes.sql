-- HU-51 (SCRUM-37 / SCRUM-105): gestionar integrantes del proyecto.
--
-- Altas: el frontend inserta directamente en public.miembro_proyecto con rol
-- 'colaborador'. Las políticas existentes ya lo protegen:
--   * miembro_insert / miembro_delete: solo el propietario (es_propietario).
--   * miembro_proyecto_pkey: impide agregar dos veces al mismo usuario (23505).
--   * miembro_validar: impide quitar al propietario.
--
-- Este script agrega lo que faltaba:
--   1. Buscar un usuario registrado por correo, usando public.usuario.correo.
--      La política usuario_leer solo deja ver a quienes ya comparten proyecto,
--      por eso la búsqueda es una función y solo el propietario del proyecto
--      puede usarla (evita enumerar cuentas).
--   2. Quitar un integrante eliminando primero sus asignaciones en las tareas del
--      proyecto. miembro_validar rechaza la baja mientras existan asignaciones,
--      así que ambas operaciones se hacen en una sola transacción.

-- 0. Columna de correo en el perfil (ya creada en Supabase; se versiona aquí) ---
ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS correo TEXT;

-- 1. Búsqueda por correo -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.buscar_usuario_para_proyecto(
    p_id_proyecto UUID,
    p_correo TEXT
)
RETURNS TABLE (id_usuario UUID, nombre TEXT, correo TEXT, es_integrante BOOLEAN)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT tasker_privado.es_propietario(p_id_proyecto) THEN
        RAISE EXCEPTION 'Solo el propietario puede buscar integrantes'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    RETURN QUERY
    SELECT
        u.id_usuario,
        trim(concat_ws(' ', u.nombre, u.apellido))::TEXT AS nombre,
        -- Conversión explícita: la columna puede ser varchar o text.
        u.correo::TEXT AS correo,
        EXISTS (
            SELECT 1 FROM public.miembro_proyecto mp
            WHERE mp.id_proyecto = p_id_proyecto AND mp.id_usuario = u.id_usuario
        ) AS es_integrante
    FROM public.usuario u
    WHERE lower(trim(u.correo)) = lower(trim(p_correo))
    LIMIT 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.buscar_usuario_para_proyecto(UUID, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.buscar_usuario_para_proyecto(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.buscar_usuario_para_proyecto(UUID, TEXT) TO authenticated;

-- 2. Baja con limpieza de asignaciones -----------------------------------------
CREATE OR REPLACE FUNCTION public.quitar_integrante_proyecto(
    p_id_proyecto UUID,
    p_id_usuario UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_propietario UUID;
BEGIN
    -- Bloquear el proyecto evita asignaciones nuevas mientras se retira al integrante.
    SELECT p.id_usuario_propietario INTO v_propietario
    FROM public.proyecto p
    WHERE p.id_proyecto = p_id_proyecto
    FOR UPDATE;

    IF v_propietario IS NULL OR v_propietario <> auth.uid() THEN
        RAISE EXCEPTION 'Solo el propietario puede quitar integrantes'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_id_usuario = v_propietario THEN
        RAISE EXCEPTION 'El propietario no puede ser removido del proyecto'
            USING ERRCODE = 'check_violation';
    END IF;

    DELETE FROM public.ejecuta e
    USING public.tarea t
    WHERE e.id_tarea = t.id_tarea
      AND t.id_proyecto = p_id_proyecto
      AND e.id_usuario = p_id_usuario;

    DELETE FROM public.miembro_proyecto mp
    WHERE mp.id_proyecto = p_id_proyecto
      AND mp.id_usuario = p_id_usuario;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El usuario no es integrante del proyecto'
            USING ERRCODE = 'no_data_found';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.quitar_integrante_proyecto(UUID, UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.quitar_integrante_proyecto(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.quitar_integrante_proyecto(UUID, UUID) TO authenticated;
