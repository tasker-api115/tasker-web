--  Garante dentro de supabase que el propietario del proyecto es el único que puede crear tareas en ese proyecto.
-- 1. Asegurarnos de que RLS esté activo en la tabla tarea
ALTER TABLE public.tarea ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar la política si ya existía para evitar errores al recrearla (opcional pero recomendado)
DROP POLICY IF EXISTS "Solo propietario puede crear tareas" ON public.tarea;

-- 3. Crear la política para la operación INSERT
CREATE POLICY "Solo propietario puede crear tareas"
ON public.tarea
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.proyecto p 
        WHERE p.id_proyecto = tarea.id_proyecto 
        AND p.id_usuario_propietario = auth.uid()
    )
);