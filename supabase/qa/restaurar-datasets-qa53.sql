-- HU-53 | RESTAURACION CONTROLADA DE FIXTURES QA53
-- Esquema: 20261106134317_initial_schema.sql
-- Identidades existentes: ana@example.com, carlos@example.com, maria@example.com.
-- NO crea, modifica ni elimina cuentas en auth.users.
-- NO modifica perfiles de usuario existentes; crea solamente los que falten.
-- La cuenta opcional sinproyecto@test.com (HU-52 / DS-00) NO se crea,
-- modifica ni elimina. Se comprueba mediante el script de verificacion.
-- SOLO ejecutar desde el SQL Editor del proyecto SUPABASE COMPARTIDO,
-- luego de revision de backend y con una ventana sin pruebas concurrentes.
-- No es migracion ni debe ejecutarse en produccion.
-- Cada ejecucion reemplaza los cuatro proyectos con UUID reservados QA53.
-- Por seguridad, el procedimiento esta BLOQUEADO de fabrica.

BEGIN;
SET LOCAL qa53.confirmacion = 'NO_AUTORIZADO';
-- Despues de la aprobacion del equipo, cambiar el valor de la linea
-- anterior a 'AUTORIZO_RESTAURAR_QA53' para ESTA ejecucion solamente.

-- Bloqueo transaccional entre restauraciones del mismo script.
SELECT pg_advisory_xact_lock(53, 2026);

DO $verificar_precondiciones$
DECLARE
    total_auth INTEGER;
BEGIN
    IF current_setting('qa53.confirmacion', true)
       IS DISTINCT FROM 'AUTORIZO_RESTAURAR_QA53' THEN
        RAISE EXCEPTION 'HU-53: restauracion bloqueada. Falta aprobacion explicita.';
    END IF;

    SELECT COUNT(DISTINCT lower(email))
      INTO total_auth
      FROM auth.users
     WHERE lower(email) IN (
        'ana@example.com', 'carlos@example.com', 'maria@example.com'
     );
    IF total_auth <> 3 THEN
        RAISE EXCEPTION 'HU-53: se esperaban 3 identidades existentes en Auth; encontradas %.', total_auth;
    END IF;

    -- Los UUID reservados no pueden apuntar a otros propietarios.
    -- Se permite cambiar el nombre de un proyecto QA durante CP-PRO-03.
    IF EXISTS (
        WITH propietarios(id, email) AS (
            VALUES
            ('53000000-0000-4000-8000-000000000001'::uuid, 'ana@example.com'),
            ('53000000-0000-4000-8000-000000000002'::uuid, 'ana@example.com'),
            ('53000000-0000-4000-8000-000000000003'::uuid, 'ana@example.com'),
            ('53000000-0000-4000-8000-000000000004'::uuid, 'maria@example.com')
        )
        SELECT 1
          FROM public.proyecto p
          JOIN propietarios e ON e.id = p.id_proyecto
          LEFT JOIN auth.users u ON u.id = p.id_usuario_propietario
         WHERE lower(u.email) IS DISTINCT FROM e.email
    ) THEN
        RAISE EXCEPTION 'HU-53: un UUID reservado pertenece a otro propietario. No se borra nada.';
    END IF;

    -- No eliminar membresias si alguien ajeno a las tres cuentas fue
    -- incorporado a un proyecto QA por otra persona del equipo.
    IF EXISTS (
        SELECT 1
          FROM public.miembro_proyecto m
          LEFT JOIN auth.users u ON u.id = m.id_usuario
         WHERE m.id_proyecto IN (
            '53000000-0000-4000-8000-000000000001'::uuid,
            '53000000-0000-4000-8000-000000000002'::uuid,
            '53000000-0000-4000-8000-000000000003'::uuid,
            '53000000-0000-4000-8000-000000000004'::uuid
         )
           AND (u.email IS NULL OR lower(u.email) NOT IN (
                'ana@example.com', 'carlos@example.com', 'maria@example.com'
           ))
    ) THEN
        RAISE EXCEPTION 'HU-53: existe una membresia ajena a las tres cuentas; requiere revision.';
    END IF;

    -- Idem con asignaciones de tareas para no destruir trabajo ajeno.
    IF EXISTS (
        SELECT 1
          FROM public.ejecuta e
          JOIN public.tarea t ON t.id_tarea = e.id_tarea
          LEFT JOIN auth.users u ON u.id = e.id_usuario
         WHERE t.id_proyecto IN (
            '53000000-0000-4000-8000-000000000001'::uuid,
            '53000000-0000-4000-8000-000000000002'::uuid,
            '53000000-0000-4000-8000-000000000003'::uuid,
            '53000000-0000-4000-8000-000000000004'::uuid
         )
           AND (u.email IS NULL OR lower(u.email) NOT IN (
               'ana@example.com', 'carlos@example.com', 'maria@example.com'
           ))
    ) THEN
        RAISE EXCEPTION 'HU-53: existe asignacion a usuario externo; requiere revision.';
    END IF;

    -- Evitar colisiones de los IDs estables de las tareas si, por error,
    -- alguna aparece relacionada con un proyecto no QA53.
    IF EXISTS (
        SELECT 1
          FROM public.tarea t
         WHERE (
              t.id_tarea IN (
                 '53300000-0000-4000-8000-000000000001'::uuid
              )
              OR (t.id_tarea::text LIKE '53100000-0000-4000-8000-%'
                  AND RIGHT(t.id_tarea::text, 12) IN (
                  '000000000001','000000000002','000000000003','000000000004',
                  '000000000005','000000000006','000000000007','000000000008'))
              OR (t.id_tarea::text LIKE '53200000-0000-4000-8000-%'
                  AND RIGHT(t.id_tarea::text, 12) IN (
                  '000000000001','000000000002','000000000003',
                  '000000000004','000000000005'))
         )
           AND t.id_proyecto NOT IN (
            '53000000-0000-4000-8000-000000000001'::uuid,
            '53000000-0000-4000-8000-000000000002'::uuid,
            '53000000-0000-4000-8000-000000000003'::uuid,
            '53000000-0000-4000-8000-000000000004'::uuid
           )
    ) THEN
        RAISE EXCEPTION 'HU-53: un ID reservado de tarea aparece fuera de proyectos QA53.';
    END IF;
END;
$verificar_precondiciones$;

-- Limpiar dependencias de tareas exclusivamente de los cuatro proyectos QA.
DELETE FROM public.dependencia_tarea
 WHERE id_tarea IN (
     SELECT id_tarea FROM public.tarea
     WHERE id_proyecto IN (
       '53000000-0000-4000-8000-000000000001'::uuid,
       '53000000-0000-4000-8000-000000000002'::uuid,
       '53000000-0000-4000-8000-000000000003'::uuid,
       '53000000-0000-4000-8000-000000000004'::uuid
     )
 ) OR id_tarea_predecesora IN (
     SELECT id_tarea FROM public.tarea
     WHERE id_proyecto IN (
       '53000000-0000-4000-8000-000000000001'::uuid,
       '53000000-0000-4000-8000-000000000002'::uuid,
       '53000000-0000-4000-8000-000000000003'::uuid,
       '53000000-0000-4000-8000-000000000004'::uuid
     )
 );

-- ON DELETE CASCADE limpia ejecuta de las tareas eliminadas.
DELETE FROM public.tarea WHERE id_proyecto IN (
    '53000000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid,
    '53000000-0000-4000-8000-000000000003'::uuid,
    '53000000-0000-4000-8000-000000000004'::uuid
);

-- ON DELETE CASCADE limpia miembro_proyecto de estos proyectos.
DELETE FROM public.proyecto WHERE id_proyecto IN (
    '53000000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid,
    '53000000-0000-4000-8000-000000000003'::uuid,
    '53000000-0000-4000-8000-000000000004'::uuid
);

-- Perfiles de las tres cuentas existentes: INSERT solo si faltan,
-- sin sobrescribir informacion que el equipo haya guardado previamente.
WITH perfiles(email, nombre, apellido) AS (
    VALUES
    ('ana@example.com', 'Ana', NULL::text),
    ('carlos@example.com', 'Carlos', NULL::text),
    ('maria@example.com', 'María', NULL::text)
)
INSERT INTO public.usuario (id_usuario, nombre, apellido)
SELECT u.id, p.nombre, p.apellido
FROM perfiles p JOIN auth.users u ON lower(u.email) = p.email
ON CONFLICT (id_usuario) DO NOTHING;

-- Los propietarios reciben automaticamente rol administrador
-- por el trigger tasker_privado.asegurar_propietario().
WITH definicion(id, nombre, email) AS (
    VALUES
    ('53000000-0000-4000-8000-000000000001'::uuid, 'QA53 Avance', 'ana@example.com'),
    ('53000000-0000-4000-8000-000000000002'::uuid, 'QA53 Estados', 'ana@example.com'),
    ('53000000-0000-4000-8000-000000000003'::uuid, 'QA53 Vacio', 'ana@example.com'),
    ('53000000-0000-4000-8000-000000000004'::uuid, 'QA53 Aislado', 'maria@example.com')
)
INSERT INTO public.proyecto (
    id_proyecto, id_usuario_propietario, nombre,
    descripcion, fecha_inicio, fecha_fin
)
SELECT d.id, u.id, d.nombre,
       'HU-53: fixture QA exclusivo. No usar como dato de desarrollo.',
       CURRENT_DATE - 30, CURRENT_DATE + 30
FROM definicion d JOIN auth.users u ON lower(u.email) = d.email;

-- Carlos: integrante asignado. Maria: integrante NO asignado
-- en Estados, pero AJENA al proyecto Avance.
WITH definicion(email, id_proyecto) AS (
    VALUES
    ('carlos@example.com', '53000000-0000-4000-8000-000000000001'::uuid),
    ('carlos@example.com', '53000000-0000-4000-8000-000000000002'::uuid),
    ('maria@example.com', '53000000-0000-4000-8000-000000000002'::uuid)
)
INSERT INTO public.miembro_proyecto (id_proyecto, id_usuario, rol_proyecto)
SELECT d.id_proyecto, u.id, 'colaborador'
FROM definicion d JOIN auth.users u ON lower(u.email) = d.email;

-- DS-06: exactamente 8 tareas: 3 completadas, 3 en progreso,
-- 2 pendientes. Tarea 7 vencida (ayer), tarea 8 con fechas iguales.
INSERT INTO public.tarea (
    id_tarea, id_proyecto, numero_tarea,
    nombre, descripcion, fecha_inicio, fecha_fin, estado, prioridad
)
SELECT
    ('53100000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
    '53000000-0000-4000-8000-000000000001'::uuid,
    n,
    'QA53 Avance tarea ' || n,
    'Dataset DS-06 / HU-53',
    CASE WHEN n = 8 THEN CURRENT_DATE ELSE CURRENT_DATE - 10 END,
    CASE WHEN n = 7 THEN CURRENT_DATE - 1
         WHEN n = 8 THEN CURRENT_DATE
         ELSE CURRENT_DATE + 7 END,
    CASE WHEN n BETWEEN 1 AND 3 THEN 'completada'
         WHEN n BETWEEN 4 AND 6 THEN 'en_progreso'
         ELSE 'pendiente' END,
    CASE WHEN n = 7 THEN 'urgente' ELSE 'media' END
FROM generate_series(1, 8) AS n;

-- DS-04: 5 estados que permite tarea_estado_check.
-- Estados tarea 5 valida fecha_inicio = fecha_fin.
INSERT INTO public.tarea (
    id_tarea, id_proyecto, numero_tarea,
    nombre, descripcion, fecha_inicio, fecha_fin, estado, prioridad
)
SELECT
    ('53200000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid,
    n,
    'QA53 Estado tarea ' || n,
    'Dataset DS-04 / HU-53',
    CASE WHEN n = 5 THEN CURRENT_DATE ELSE CURRENT_DATE - 5 END,
    CASE WHEN n = 1 THEN CURRENT_DATE - 1
         WHEN n = 5 THEN CURRENT_DATE
         ELSE CURRENT_DATE + 5 END,
    CASE n
      WHEN 1 THEN 'pendiente'
      WHEN 2 THEN 'en_progreso'
      WHEN 3 THEN 'en_revision'
      WHEN 4 THEN 'completada'
      WHEN 5 THEN 'cancelada'
    END,
    'media'
FROM generate_series(1, 5) AS n;

-- Proyecto ajeno: Maria propietaria, Ana/Carlos no son miembros.
INSERT INTO public.tarea (
    id_tarea, id_proyecto, numero_tarea,
    nombre, descripcion, fecha_inicio, fecha_fin, estado
)
VALUES (
    '53300000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000004'::uuid,
    1, 'QA53 Tarea aislada', 'Fixture de autorizacion',
    CURRENT_DATE, CURRENT_DATE + 5, 'pendiente'
);

-- Carlos es responsable de las tareas 4 y 7 de Avance,
-- y de las tareas 1 y 2 de Estados. Maria NO es asignada a ellas.
INSERT INTO public.ejecuta (id_usuario, id_tarea, rol_tarea)
SELECT u.id, t.id_tarea, 'responsable'
FROM auth.users u
CROSS JOIN (
    VALUES
    ('53100000-0000-4000-8000-000000000004'::uuid),
    ('53100000-0000-4000-8000-000000000007'::uuid),
    ('53200000-0000-4000-8000-000000000001'::uuid),
    ('53200000-0000-4000-8000-000000000002'::uuid)
) AS t(id_tarea)
WHERE lower(u.email) = 'carlos@example.com';

-- Verificacion transaccional. Ante cualquier discrepancia hace ROLLBACK.
DO $validar_resultados$
DECLARE
    n_proyectos INTEGER;
    n_tareas INTEGER;
    n_miembros INTEGER;
    n_asignaciones INTEGER;
    n_total_avance INTEGER;
    n_completadas INTEGER;
    n_vacio INTEGER;
    n_estados INTEGER;
    n_vencidas INTEGER;
BEGIN
    SELECT COUNT(*) INTO n_proyectos FROM public.proyecto
    WHERE id_proyecto IN (
        '53000000-0000-4000-8000-000000000001'::uuid,
        '53000000-0000-4000-8000-000000000002'::uuid,
        '53000000-0000-4000-8000-000000000003'::uuid,
        '53000000-0000-4000-8000-000000000004'::uuid
    );
    SELECT COUNT(*) INTO n_tareas FROM public.tarea
    WHERE id_proyecto IN (
        '53000000-0000-4000-8000-000000000001'::uuid,
        '53000000-0000-4000-8000-000000000002'::uuid,
        '53000000-0000-4000-8000-000000000003'::uuid,
        '53000000-0000-4000-8000-000000000004'::uuid
    );
    SELECT COUNT(*) INTO n_miembros FROM public.miembro_proyecto
    WHERE id_proyecto IN (
        '53000000-0000-4000-8000-000000000001'::uuid,
        '53000000-0000-4000-8000-000000000002'::uuid,
        '53000000-0000-4000-8000-000000000003'::uuid,
        '53000000-0000-4000-8000-000000000004'::uuid
    );
    SELECT COUNT(*) INTO n_asignaciones
    FROM public.ejecuta e JOIN public.tarea t ON t.id_tarea = e.id_tarea
    WHERE t.id_proyecto IN (
        '53000000-0000-4000-8000-000000000001'::uuid,
        '53000000-0000-4000-8000-000000000002'::uuid,
        '53000000-0000-4000-8000-000000000003'::uuid,
        '53000000-0000-4000-8000-000000000004'::uuid
    );
    SELECT COUNT(*), COUNT(*) FILTER (WHERE estado = 'completada')
      INTO n_total_avance, n_completadas
      FROM public.tarea
      WHERE id_proyecto = '53000000-0000-4000-8000-000000000001'::uuid;
    SELECT COUNT(*) INTO n_vacio FROM public.tarea
      WHERE id_proyecto = '53000000-0000-4000-8000-000000000003'::uuid;
    SELECT COUNT(DISTINCT estado) INTO n_estados FROM public.tarea
      WHERE id_proyecto = '53000000-0000-4000-8000-000000000002'::uuid;
    SELECT COUNT(*) INTO n_vencidas FROM public.tarea
      WHERE id_proyecto = '53000000-0000-4000-8000-000000000001'::uuid
        AND fecha_fin < CURRENT_DATE AND estado <> 'completada';

    IF n_proyectos <> 4 OR n_tareas <> 14 OR n_miembros <> 7
       OR n_asignaciones <> 4 OR n_total_avance <> 8 OR n_completadas <> 3
       OR n_vacio <> 0 OR n_estados <> 5 OR n_vencidas < 1 THEN
        RAISE EXCEPTION 'HU-53: inconsistencia del fixture: proyectos %, tareas %, miembros %, asignaciones %, avance %/%, vacio %, estados %, vencidas %.',
          n_proyectos, n_tareas, n_miembros, n_asignaciones, n_completadas,
          n_total_avance, n_vacio, n_estados, n_vencidas;
    END IF;
END;
$validar_resultados$;

COMMIT;
-- Tras COMMIT puede ejecutarse verificar-datasets-qa53.sql (solo lectura).
