-- HU-53 | VERIFICACION DE DATOS QA (SOLO LECTURA)
-- Ejecutar en SQL Editor de Supabase compartido.
-- No crea, actualiza ni elimina registros.

-- A. Verificar presencia de las tres cuentas existentes (no expone UUID ni claves).
SELECT lower(u.email) AS usuario_qa,
       CASE WHEN p.id_usuario IS NOT NULL THEN 'SI' ELSE 'NO' END AS perfil_publico
FROM auth.users u
LEFT JOIN public.usuario p ON p.id_usuario = u.id
WHERE lower(u.email) IN ('ana@example.com', 'carlos@example.com', 'maria@example.com')
ORDER BY usuario_qa;
-- Esperado: 3 filas y perfil_publico = SI.

-- B. Los cuatro proyectos reservados y su porcentaje HU-35.
SELECT p.id_proyecto, p.nombre,
       COUNT(t.id_tarea) AS total_tareas,
       COUNT(t.id_tarea) FILTER (WHERE t.estado = 'completada') AS completadas,
       CASE WHEN COUNT(t.id_tarea) = 0 THEN 0
            ELSE ROUND(
                100.0 * COUNT(t.id_tarea) FILTER (WHERE t.estado = 'completada')
                / COUNT(t.id_tarea), 2
            ) END AS avance_porcentaje
FROM public.proyecto p
LEFT JOIN public.tarea t ON t.id_proyecto = p.id_proyecto
WHERE p.id_proyecto IN (
    '53000000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid,
    '53000000-0000-4000-8000-000000000003'::uuid,
    '53000000-0000-4000-8000-000000000004'::uuid
)
GROUP BY p.id_proyecto, p.nombre
ORDER BY p.id_proyecto;
-- Esperado: QA53 Avance = 8 / 3 / 37.50;
-- QA53 Estados = 5 / 1 / 20.00;
-- QA53 Vacio = 0 / 0 / 0;
-- QA53 Aislado = 1 / 0 / 0.

-- C. Cinco estados admitidos por la migracion; uno de cada uno en DS-04.
SELECT estado, COUNT(*) AS cantidad
FROM public.tarea
WHERE id_proyecto = '53000000-0000-4000-8000-000000000002'::uuid
GROUP BY estado
ORDER BY estado;
-- Esperado: 1 pendiente, 1 en_progreso, 1 en_revision,
-- 1 completada y 1 cancelada.

-- D. Miembros de QA53 (7 relaciones en total).
SELECT p.nombre AS proyecto, lower(u.email) AS correo, m.rol_proyecto
FROM public.miembro_proyecto m
JOIN public.proyecto p ON p.id_proyecto = m.id_proyecto
JOIN auth.users u ON u.id = m.id_usuario
WHERE p.id_proyecto IN (
    '53000000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid,
    '53000000-0000-4000-8000-000000000003'::uuid,
    '53000000-0000-4000-8000-000000000004'::uuid
)
ORDER BY p.id_proyecto, correo;
-- Esperado: Avance (Ana, Carlos), Estados (Ana, Carlos, Maria),
-- Vacio (Ana), Aislado (Maria).

-- E. Cuatro asignaciones para Carlos, ninguna para Maria.
SELECT lower(u.email) AS usuario, p.nombre AS proyecto,
       t.numero_tarea, e.rol_tarea
FROM public.ejecuta e
JOIN auth.users u ON u.id = e.id_usuario
JOIN public.tarea t ON t.id_tarea = e.id_tarea
JOIN public.proyecto p ON p.id_proyecto = t.id_proyecto
WHERE p.id_proyecto IN (
    '53000000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid,
    '53000000-0000-4000-8000-000000000003'::uuid,
    '53000000-0000-4000-8000-000000000004'::uuid
)
ORDER BY p.id_proyecto, t.numero_tarea;
-- Esperado: Carlos en Avance 4 y 7; Estados 1 y 2.

-- F. Al menos una tarea vencida sin completar.
SELECT p.nombre AS proyecto, t.numero_tarea, t.nombre,
       t.fecha_fin, t.estado
FROM public.tarea t
JOIN public.proyecto p ON p.id_proyecto = t.id_proyecto
WHERE p.id_proyecto IN (
    '53000000-0000-4000-8000-000000000001'::uuid,
    '53000000-0000-4000-8000-000000000002'::uuid
)
AND t.fecha_fin < CURRENT_DATE
AND t.estado <> 'completada'
ORDER BY p.id_proyecto, t.numero_tarea;
-- Esperado: al menos Avance tarea 7 y Estados tarea 1.

-- G. Fecha inicio = fecha fin (caso limite valido para PostgreSQL).
SELECT nombre, fecha_inicio, fecha_fin
FROM public.tarea
WHERE id_tarea = '53100000-0000-4000-8000-000000000008'::uuid
AND fecha_inicio = fecha_fin;
-- Esperado: una fila (Avance tarea 8).

-- H. DS-00: disponibilidad OPCIONAL de la cuenta sin proyectos de HU-52.
-- No cambia usuarios, proyectos ni membresias. La cuenta solo es apta
-- si existe en este entorno y no posee ni integra ningun proyecto.
-- No forma parte de las tres cuentas obligatorias del fixture QA53.
WITH cuenta AS (
    SELECT id
    FROM auth.users
    WHERE lower(email) = 'sinproyecto@test.com'
), conteos AS (
    SELECT
        (SELECT COUNT(*) FROM cuenta) AS cuentas_auth,
        (SELECT COUNT(*) FROM public.proyecto p
            JOIN cuenta c ON c.id = p.id_usuario_propietario) AS proyectos_propios,
        (SELECT COUNT(*) FROM public.miembro_proyecto m
            JOIN cuenta c ON c.id = m.id_usuario) AS membresias
)
SELECT
    'sinproyecto@test.com' AS usuario_opcional,
    cuentas_auth, proyectos_propios, membresias,
    CASE
        WHEN cuentas_auth = 0 THEN 'NO_EXISTE_EN_ESTE_ENTORNO'
        WHEN cuentas_auth <> 1 THEN 'REVISAR_DUPLICADOS'
        WHEN proyectos_propios = 0 AND membresias = 0 THEN 'APTO_SIN_PROYECTOS'
        ELSE 'NO_APTO_USAR_CUENTA_TEMPORAL'
    END AS estado_ds00
FROM conteos;
-- Esperado para usar la cuenta opcional: 1 / 0 / 0 / APTO_SIN_PROYECTOS.
-- Si no es apta, conservar los resultados de A-G y preparar cuenta temporal.
