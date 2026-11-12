-- Función corregida con search_path y manejo de ambigüedad
CREATE OR REPLACE FUNCTION public.obtener_correos_proyecto(p_id_proyecto UUID)
RETURNS TABLE (id_usuario UUID, correo TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Refuerzo de seguridad solicitado
AS $$
BEGIN
    -- Validación estricta usando alias para evitar ambigüedad
    IF NOT EXISTS (
        SELECT 1 FROM public.proyecto p 
        WHERE p.id_proyecto = p_id_proyecto AND p.id_usuario_propietario = auth.uid()
        UNION
        SELECT 1 FROM public.miembro_proyecto mp 
        WHERE mp.id_proyecto = p_id_proyecto AND mp.id_usuario = auth.uid()
    ) THEN
        RETURN;
    END IF;

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

-- Ajuste de permisos de ejecución
REVOKE EXECUTE ON FUNCTION public.obtener_correos_proyecto(UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.obtener_correos_proyecto(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.obtener_correos_proyecto(UUID) TO authenticated;