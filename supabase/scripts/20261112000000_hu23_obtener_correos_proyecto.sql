CREATE OR REPLACE FUNCTION obtener_correos_proyecto(p_id_proyecto UUID)
RETURNS TABLE (id_usuario UUID, correo TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Validación estricta usando alias (p y mp) para evitar la ambigüedad
    IF NOT EXISTS (
        SELECT 1 FROM public.proyecto p WHERE p.id_proyecto = p_id_proyecto AND p.id_usuario_propietario = auth.uid()
        UNION
        SELECT 1 FROM public.miembro_proyecto mp WHERE mp.id_proyecto = p_id_proyecto AND mp.id_usuario = auth.uid()
    ) THEN
        RETURN; -- Acceso denegado, retornamos vacío silenciosamente
    END IF;

    -- 2. Consulta segura
    RETURN QUERY
    SELECT au.id, au.email::TEXT
    FROM auth.users au
    WHERE au.id IN (
        SELECT mp.id_usuario FROM public.miembro_proyecto mp WHERE mp.id_proyecto = p_id_proyecto
        UNION
        SELECT p.id_usuario_propietario FROM public.proyecto p WHERE p.id_proyecto = p_id_proyecto
    );
END;
$$;