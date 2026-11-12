CREATE OR REPLACE FUNCTION public.create_project_task(
    p_project_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_start_date DATE,
    p_due_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Refuerzo de seguridad
AS $$
DECLARE
    v_is_owner BOOLEAN;
    v_next_number INTEGER;
    v_inserted_task RECORD;
BEGIN
    -- 1. Validar seguridad: Verificar que el usuario autenticado es el PROPIETARIO del proyecto
    SELECT EXISTS (
        SELECT 1
        FROM public.proyecto
        WHERE id_proyecto = p_project_id
          AND id_usuario_propietario = auth.uid()
    ) INTO v_is_owner;

    IF NOT v_is_owner THEN
        -- Lanza el error 42501 que el frontend espera para mostrar "No tienes permiso..."
        RAISE EXCEPTION 'No tienes permiso para crear tareas en este proyecto' USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 2. Calcular el secuencial de la tarea (numero_tarea) para este proyecto específico
    SELECT COALESCE(MAX(numero_tarea), 0) + 1
    INTO v_next_number
    FROM public.tarea
    WHERE id_proyecto = p_project_id;

    -- 3. Insertar la nueva tarea forzando el estado a 'pendiente'
    INSERT INTO public.tarea (
        id_proyecto,
        numero_tarea,
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado
    ) VALUES (
        p_project_id,
        v_next_number,
        p_name,
        p_description,
        p_start_date,
        p_due_date,
        'pendiente'
    )
    RETURNING * INTO v_inserted_task;

    -- 4. Retornar el objeto JSON exacto que espera la función isCreatedTaskRow en Angular
    RETURN json_build_object(
        'id_tarea', v_inserted_task.id_tarea,
        'id_proyecto', v_inserted_task.id_proyecto,
        'numero_tarea', v_inserted_task.numero_tarea,
        'nombre', v_inserted_task.nombre,
        'estado', v_inserted_task.estado,
        'prioridad', v_inserted_task.prioridad,
        'fecha_fin', v_inserted_task.fecha_fin
    );
END;
$$;

-- 5. Ajuste de permisos de ejecución
REVOKE EXECUTE ON FUNCTION public.create_project_task(UUID, TEXT, TEXT, DATE, DATE) FROM public;
REVOKE EXECUTE ON FUNCTION public.create_project_task(UUID, TEXT, TEXT, DATE, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_project_task(UUID, TEXT, TEXT, DATE, DATE) TO authenticated;