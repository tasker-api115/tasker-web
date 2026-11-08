# HU-53 — Preparar datos de prueba para QA

**Proyecto:** Tasker — Sistema de gestión de proyectos y tareas académicas  
**Asignatura:** Administración de Proyectos Informáticos (API115)  
**Historia de usuario:** HU-53  
**Responsable:** QA, con apoyo del equipo backend  
**Dependencias:** HU-18 y HU-39    
**Versión de datasets:** QA53-1.2  
**Estado:** Datos y procedimiento definidos; ejecución y evidencias pendientes de validación  
**Base técnica:** `supabase/migrations/20261106134317_initial_schema.sql` y Plan Maestro de Pruebas HU-39.

> **Alcance del documento:** este entregable define datos y procedimientos reproducibles. No acredita que el SQL se haya ejecutado en Supabase, que los casos de prueba hayan pasado o que el equipo haya aprobado los resultados.

## 1. Objetivo

Definir datos ficticios reproducibles para ejecutar los casos de HU-40 a HU-45, cubriendo operaciones correctas, entradas inválidas, límites de fecha y campos, proyectos vacíos, estados y asignaciones de tareas, autorizaciones y cálculos de avance. Se documenta cómo restaurar los datos iniciales antes de cada ciclo y cómo mantenerlos diferenciados de los datos de desarrollo definidos por HU-52.

## 2. Entorno y decisión de reutilización de identidades

Tasker utiliza Angular, Supabase Auth y PostgreSQL con políticas de seguridad por fila (RLS). El equipo comparte actualmente **un único proyecto de Supabase**. La separación de QA respecto a desarrollo se realiza mediante **proyectos y tareas con UUID reservados y prefijo `QA53`**, no mediante una instancia independiente.

El archivo `test-users.md` de HU-52 contempla las identidades `ana@example.com`, `carlos@example.com` y `maria@example.com`. HU-53 **reutiliza esas cuentas** para autenticación y autorización; no requiere crearlas, cambiar contraseñas ni modificar los perfiles ya existentes. El acceso a dichas cuentas debe verificarse **en el mismo Supabase compartido** antes del ciclo: HU-52 advierte que las cuentas de Auth no se sincronizan automáticamente entre el entorno local y el alojado. La contraseña inicial documentada por HU-52 puede no ser la vigente si la cuenta ya existía. No se almacenan contraseñas, tokens, claves secretas ni credenciales administrativas en los archivos de HU-53.

Los registros de desarrollo `Proyecto Alpha`, `Proyecto Beta` y sus tareas no se utilizan como fixtures de HU-53. Ningún script de QA debe eliminarlos ni modificarlos.

**Limitación:** compartir identidades y base implica separación *lógica*, no física. Una modificación externa en las mismas cuentas o una campaña concurrente puede afectar los resultados. El equipo debe programar las restauraciones y evitar modificaciones simultáneas en los proyectos `QA53`. Si se exige aislamiento total, se necesitará un proyecto Supabase de QA separado.

### 2.1. Identidades y roles según el proyecto

| Identidad de Auth existente | Proyecto `QA53 Avance` | `QA53 Estados` | `QA53 Vacio` | `QA53 Aislado` |
|---|---|---|---|---|
| `ana@example.com` | Propietaria / administradora | Propietaria / administradora | Propietaria / administradora | Externa |
| `carlos@example.com` | Integrante / responsable de tareas 4 y 7 | Integrante / responsable de tareas 1 y 2 | Externo | Externo |
| `maria@example.com` | **Externa** | **Integrante no asignada** | Externa | Propietaria / administradora |

Esta distribución permite verificar dos condiciones diferentes con María: es una integrante sin asignación en `QA53 Estados` y una usuaria ajena a `QA53 Avance`. Carlos actúa como integrante asignado y sin permisos de propietario; Ana actúa como propietaria.

**Cuenta adicional para DS-00 (sin creación por HU-53):** HU-52 también documenta `sinproyecto@test.com`, una identidad prevista para comprobar la ausencia de proyectos **en un entorno limpio**. Se puede reutilizar para el listado vacío **solo si**, antes del ciclo, existe en el Supabase compartido y una consulta confirma que no es propietaria ni integrante de ningún proyecto. Esa cuenta no participa en los cuatro proyectos QA53 y los scripts de restauración no la crean ni la modifican. Si tiene proyectos, no existe o no se puede iniciar sesión con ella, el caso se realizará con una cuenta temporal sin membresías, autorizada para HU-40; no se alterarán registros de HU-52 para forzar el resultado.

Para **CP-AUT-01 (registro nuevo)** se necesita una dirección no registrada al momento de ejecutar el caso, creada temporalmente desde la aplicación si HU-54 ya está disponible. No forma parte de las tres cuentas base y debe gestionarse según el procedimiento aprobado para HU-40. Las vistas vacías de tareas y reportes se cubren de forma independiente con `QA53 Vacio`.

## 3. Archivos del entregable

| Ruta | Finalidad |
|---|---|
| `docs/qa/datasets-hu-53.md` | Definición de datasets, valores esperados, matriz, restauración y evidencias |
| `supabase/qa/restaurar-datasets-qa53.sql` | Restablecer únicamente cuatro proyectos QA53 y sus relaciones dentro de una transacción |
| `supabase/qa/verificar-datasets-qa53.sql` | Consultas de solo lectura para verificar cantidades, permisos lógicos, estados y avance |

Los dos scripts se conservan en `supabase/qa/`, **fuera** de `supabase/migrations/` y de los archivos de HU-52. La restauración no crea usuarios de Auth ni altera contraseñas.

## 4. Esquema utilizado y reglas verificables

Las tablas principales son `public.usuario`, `public.proyecto`, `public.miembro_proyecto`, `public.tarea`, `public.ejecuta` y `public.dependencia_tarea`.

La migración confirma que:

- `tarea.estado` acepta `pendiente`, `en_progreso`, `en_revision`, `completada` y `cancelada`.
- `tarea.prioridad` acepta `baja`, `media`, `alta` y `urgente`.
- `tarea.numero_tarea` debe ser mayor que cero y único dentro de su proyecto.
- `proyecto.fecha_fin >= proyecto.fecha_inicio` y `tarea.fecha_fin >= tarea.fecha_inicio`; dos fechas iguales sí cumplen la restricción.
- Los roles de proyecto son `administrador` y `colaborador`, y los roles de asignación son `responsable` y `colaborador`.
- Al crear un proyecto, el trigger `proyecto_asegurar_propietario` registra al propietario como administrador.
- Las columnas `nombre` y `descripcion` son de tipo `text`: **la migración no fija máximos de caracteres**. Los límites del formulario se verificarán cuando estén definidos en el frontend o Jira.

**Observación de permisos a revisar:** la política `tarea_acceso` permite actualizaciones a integrantes del proyecto y no discrimina por persona asignada ni por campo `estado`. HU-31 exige que solo el asignado cambie el estado; por ello, las pruebas CP-TAR-07 y CP-KAN-03 pueden evidenciar una discrepancia real de autorización. El dataset no corrige ni oculta esa discrepancia. Además, `proyecto_editar` admite a quienes cumplan `administra`, mientras que las acciones de membresía están limitadas al propietario por RLS. Los resultados deben contrastarse con las historias vigentes.

## 5. Catálogo de datasets

| Código | Datos iniciales y preparación | Uso principal |
|---|---|---|
| **DS-00 — Vacío** | Proyecto `QA53 Vacio` sin tareas, con progreso de 0 %. Para listado **sin proyectos**, utilizar `sinproyecto@test.com` de HU-52 únicamente si la verificación confirma cero proyectos propios y cero membresías; de lo contrario, usar una cuenta temporal sin proyectos. | Primer proyecto, vistas vacías, avance 0 % |
| **DS-01 — Identidades** | Ana, Carlos y María ya existentes en Supabase Auth; el script incorpora el perfil en `public.usuario` únicamente si falta. | Inicio/cierre de sesión, rutas protegidas, identidad autenticada |
| **DS-02 — Proyectos** | `QA53 Avance`, `QA53 Estados`, `QA53 Vacio`, `QA53 Aislado`; tres pertenecen a Ana, uno a María. | CRUD de proyectos, consulta y aislamiento |
| **DS-03 — Membresías** | Propietaria Ana; Carlos integrante asignado; María integrante no asignada en Estados y externa a Avance; María propietaria de Aislado. | Permisos, alta/baja de integrantes, cambios de estado no autorizados |
| **DS-04 — Tareas/Kanban** | Cinco tareas de `QA53 Estados`, una por cada estado permitido; Carlos responsable de las tareas 1 y 2, María no asignada. | Estados, responsable, arrastre, persistencia, restricciones |
| **DS-05 — Bordes y errores** | Tarea con inicio y fin iguales; solicitudes inválidas de fecha, estado, número de tarea y campos; longitudes por completar con reglas de formulario. | Formularios, fechas, límites, duplicados |
| **DS-06 — Cronograma y avance** | `QA53 Avance` contiene ocho tareas: tres completadas, tres en progreso, dos pendientes; al menos una vencida. `QA53 Vacio` no contiene tareas. | Porcentaje, reportes, fechas y recuento |
| **DS-07 — Fallos controlados** | Credenciales incorrectas, sesión caducada sin renovación y fallos simulados de red o actualización. No requieren persistir tokens ni datos inválidos. | Login negativo, sesión vencida, errores de red, reversión Kanban |
| **DS-08 — Integración y regresión** | Esquema de migración, datos QA53 restaurados, RLS y comprobaciones de persistencia. | Seguridad, integración Angular–Supabase y reejecución |

La migración contempla cinco estados; el Plan Maestro HU-39 detalla tres estados visibles en el Kanban. No se presupone cómo la UI trata `en_revision` y `cancelada`: se deberá contrastar el diseño vigente de la aplicación.

## 6. Datos reproducibles y resultados esperados

### 6.1. Proyectos

| Proyecto | UUID reservado (últimos 4 dígitos) | Propietaria | Total de tareas | Completadas | Avance esperado |
|---|---|---|---:|---:|---:|
| QA53 Avance | `0001` | Ana | 8 | 3 | 37,5 % |
| QA53 Estados | `0002` | Ana | 5 | 1 | 20 % |
| QA53 Vacio | `0003` | Ana | 0 | 0 | 0 % |
| QA53 Aislado | `0004` | María | 1 | 0 | 0 % |
| **Total de fixtures** | — | — | **14** | **4** | — |

### 6.2. Proyecto QA53 Avance (DS-06)

| Número | Estado inicial | Fechas relativas a restauración | Asignación |
|---|---|---|---|
| 1 | `completada` | Inicio hace 10 días, fin dentro de 7 días | Sin responsable explícito |
| 2 | `completada` | Inicio hace 10 días, fin dentro de 7 días | Sin responsable explícito |
| 3 | `completada` | Inicio hace 10 días, fin dentro de 7 días | Sin responsable explícito |
| 4 | `en_progreso` | Inicio hace 10 días, fin dentro de 7 días | Carlos (responsable) |
| 5 | `en_progreso` | Inicio hace 10 días, fin dentro de 7 días | Sin responsable explícito |
| 6 | `en_progreso` | Inicio hace 10 días, fin dentro de 7 días | Sin responsable explícito |
| 7 | `pendiente` | Inicio hace 10 días, **fin ayer** | Carlos (responsable) |
| 8 | `pendiente` | **Inicio y fin hoy** | Sin responsable explícito |

**Fórmula de HU-35:** `(tareas completadas / total de tareas) × 100`. Se cuentan como completadas solo las tareas con estado `completada`.

- Estado inicial: `(3 / 8) × 100 = 37,5 %`.
- Carlos completa la tarea 4: `(4 / 8) × 100 = 50 %`.
- Carlos regresa la tarea 4 a `en_progreso`: `(3 / 8) × 100 = 37,5 %`.
- Proyecto `QA53 Vacio`: `0 %` sin realizar división entre cero.

### 6.3. Proyecto QA53 Estados (DS-04)

| Número | Estado inicial | Fecha fin | Responsable |
|---|---|---|---|
| 1 | `pendiente` | Ayer (vencida) | Carlos |
| 2 | `en_progreso` | Dentro de 5 días | Carlos |
| 3 | `en_revision` | Dentro de 5 días | Sin asignación |
| 4 | `completada` | Dentro de 5 días | Sin asignación |
| 5 | `cancelada` | Hoy, igual a inicio | Sin asignación |

María es integrante de este proyecto, pero no está asignada a las tareas 1 y 2. Esas tareas sirven para verificar CP-TAR-07 y CP-KAN-03.

### 6.4. Cantidades esperadas después de restaurar

| Elemento de QA53 | Cantidad |
|---|---:|
| Cuentas existentes verificadas en `auth.users` | 3 |
| Proyectos QA53 | 4 |
| Membresías de los proyectos QA53 | 7 |
| Tareas QA53 | 14 |
| Asignaciones QA53 en `ejecuta` | 4 |
| Estados distintos en `QA53 Estados` | 5 |
| Tareas en `QA53 Vacio` | 0 |

**Los perfiles existentes en `public.usuario` no se recrean ni se contabilizan como registros exclusivos de QA**, porque son identidades compartidas con HU-52. Las tres cuentas obligatorias del fixture son Ana, Carlos y María; `sinproyecto@test.com` es una cuarta cuenta **opcional de consulta para DS-00** y no cambia esas cantidades.

## 7. Escenarios normales, negativos y límite

| Escenario | Dataset | Preparación / entrada | Resultado a verificar |
|---|---|---|---|
| Login válido | DS-01 | Entrar a Tasker con una cuenta existente y su contraseña vigente | Sesión válida y acceso al dashboard permitido |
| Login inválido | DS-01, DS-07 | Cuenta existente con contraseña incorrecta | No se establece sesión; error controlado |
| Cierre de sesión | DS-01 | Iniciar sesión, cerrar y abrir ruta protegida | La ruta exige autenticación |
| Sesión expirada | DS-07 | Usar sesión de prueba caducada sin refresh válido; coordinar forma de simularla | La aplicación exige autenticación según flujo aprobado |
| Registro desde login (HU-54) | DS-01, DS-05 | Cuenta temporal con correo no registrado | Alta válida / rechazo de entrada inválida según reglas aprobadas |
| Proyecto sin tareas | DS-00, DS-06 | Abrir `QA53 Vacio` | Lista de tareas vacía y avance 0 % |
| Proyecto ajeno | DS-02, DS-03 | Carlos intenta abrir `QA53 Aislado` / María intenta abrir `QA53 Avance` | No se exponen datos ajenos en UI ni API |
| Integrante sin permisos de propietario | DS-03 | Carlos intenta agregar o quitar integrantes en `QA53 Avance` | Denegación conforme a HU-51 |
| Integrante no asignado | DS-03, DS-04 | María intenta cambiar estado de `QA53 Estados` tarea 1 | Denegación conforme a HU-31; **puede revelar defecto RLS** |
| Drag and drop de usuario ajeno | DS-03, DS-04 | María intenta arrastrar tareas del proyecto `QA53 Avance` | No se modifica una tarea ajena |
| Cambio autorizado | DS-04, DS-06 | Carlos cambia estado de tarea asignada | Persistencia y actualización de la UI |
| Tarea vencida | DS-04, DS-06 | Abrir reportes después de restauración | Identificación de tarea con fin anterior a hoy y no completada |
| Inicio y fin iguales | DS-05, DS-06 | `QA53 Avance` tarea 8 | La base admite igualdad; contrastar UI |
| Fin anterior a inicio | DS-05 | Intentar guardar tarea/proyecto con fin < inicio | Rechazo por `tarea_fechas_check` / `proyecto_fechas_check` |
| Número de tarea 0 | DS-05 | Solicitud de alta con `numero_tarea = 0` | Rechazo por `tarea_numero_tarea_check` |
| Estado inválido | DS-05 | Estado no contemplado por migración | Rechazo por `tarea_estado_check` |
| Nombre vacío | DS-05 | Probar `''` y espacios en formularios obligatorios | Validación según frontend/Jira; `NOT NULL` no rechaza cadena vacía |
| Máximo permitido | DS-05 | Campo de longitud `L`, donde `L` es límite formal del frontend | Valor aceptado si cumple demás reglas |
| Máximo + 1 | DS-05 | Campo de longitud `L + 1` | Valor rechazado según regla aprobada |
| Listado vacío | DS-00 | Para tareas/reportes, abrir `QA53 Vacio`; para proyectos, iniciar sesión con `sinproyecto@test.com` únicamente si la consulta H del verificador confirma cero proyectos propios y cero membresías, o usar una cuenta temporal equivalente | Lista de proyectos vacía y vista de tareas sin errores |
| Fallo de actualización | DS-07 | Simular error de red al arrastrar una tarjeta | Mensaje de error y reversión de UI |

**Límites no definidos todavía:** como la migración usa `text` sin longitud máxima explícita, el valor numérico de `L` debe obtenerse de las validaciones reales del frontend o de Jira. No corresponde fijarlo arbitrariamente. Los casos inválidos se ejecutan durante las pruebas y no se almacenan como fixtures permanentes.

**Sobre sesiones:** Supabase Auth puede renovar automáticamente el access token. Caducar el access token sin invalidar el refresh token no prueba necesariamente el rechazo de una sesión expirada. La simulación debe realizarse de manera controlada sobre una sesión de prueba, sin alterar ni revocar sesiones de otras personas. En un perfil aislado del navegador, backend/QA puede preparar una sesión cuyo `access_token` haya expirado y cuyo `refresh_token` no sea válido; después se recarga la aplicación y se verifica el rechazo o la redirección prevista. El mecanismo concreto de almacenamiento de sesión debe confirmarse con el frontend; al terminar, se limpian únicamente los datos locales de ese perfil.

## 8. Matriz de trazabilidad de los 45 casos del Plan Maestro HU-39

Se conservan los 45 identificadores del inventario original de HU-39. La matriz relaciona los datasets del plan con las condiciones concretas preparadas en HU-53; cuando corresponde, incorpora DS-06 como apoyo al caso de proyecto vacío. Las filas combinadas HU-41/HU-42 corresponden a membresías y asignaciones que apoyan ambas historias.

| Historia | Caso | Dataset(s) del plan |
|---|---|---|
| HU-40 | CP-AUT-01 | DS-01 |
| HU-40 | CP-AUT-02 | DS-05 |
| HU-40 | CP-AUT-03 | DS-01 |
| HU-40 | CP-AUT-04 | DS-01 |
| HU-40 | CP-AUT-05 | DS-01 |
| HU-41 | CP-PRO-01 | DS-00, DS-01 |
| HU-41 | CP-PRO-02 | DS-02 |
| HU-41 | CP-PRO-03 | DS-02 |
| HU-41 | CP-PRO-04 | DS-02 |
| HU-41 | CP-PRO-05 | DS-02, DS-03 |
| HU-41 / HU-42 | CP-INT-01 | DS-01, DS-03 |
| HU-41 / HU-42 | CP-INT-02 | DS-03, DS-04 |
| HU-41 / HU-42 | CP-INT-03 | DS-03 |
| HU-41 / HU-42 | CP-INT-04 | DS-03 |
| HU-42 | CP-TAR-01 | DS-02, DS-04 |
| HU-42 | CP-TAR-02 | DS-05 |
| HU-42 | CP-TAR-03 | DS-04 |
| HU-42 | CP-TAR-04 | DS-04 |
| HU-42 | CP-TAR-05 | DS-03, DS-04 |
| HU-42 | CP-TAR-06 | DS-04 |
| HU-42 | CP-TAR-07 | DS-03, DS-04 |
| HU-43 | CP-KAN-01 | DS-04 |
| HU-43 | CP-KAN-02 | DS-04 |
| HU-43 | CP-KAN-03 | DS-03, DS-04 |
| HU-43 | CP-KAN-04 | DS-07 |
| HU-43 | CP-KAN-05 | DS-04 |
| HU-43 | CP-CRO-01 | DS-06 |
| HU-43 | CP-CRO-02 | DS-06 |
| HU-43 | CP-CRO-03 | DS-06 |
| HU-43 | CP-CRO-04 | DS-05 |
| HU-44 | CP-AVA-01 | DS-00, DS-02, DS-06 |
| HU-44 | CP-AVA-02 | DS-06 |
| HU-44 | CP-AVA-03 | DS-04, DS-06 |
| HU-44 | CP-REP-01 | DS-06 |
| HU-44 | CP-REP-02 | DS-06 |
| HU-44 | CP-REP-03 | DS-00 |
| HU-45 | CP-SEG-01 | DS-01, DS-02, DS-03 |
| HU-45 | CP-SEG-02 | DS-03, DS-04 |
| HU-45 | CP-SEG-03 | DS-03, DS-08 |
| HU-45 | CP-SEG-04 | DS-01, DS-03 |
| HU-45 | CP-SEG-05 | DS-08 |
| HU-45 | CP-TEC-01 | DS-08 |
| HU-45 | CP-TEC-02 | DS-08 |
| HU-45 | CP-TEC-03 | DS-00, DS-07 |
| HU-45 | CP-TEC-04 | DS-01, DS-02, DS-04 |

### 8.1. Revisión adicional de cobertura

Al contrastar las historias HU-40 a HU-45 con HU-39 se identifican criterios que conviene **agregar o especificar como nuevos casos en HU-39**, sin presentarlos como parte de los 45 iniciales:

| Propuesta | Historia | Escenario | Dataset |
|---|---|---|---|
| EXT-AUT-01 | HU-40 | Sesión expirada sin renovación y ruta protegida | DS-07 |
| EXT-KAN-01 | HU-43 | Drag and drop desde usuario completamente ajeno al proyecto | DS-03, DS-04 |
| EXT-REP-01 | HU-44 | Recuento por los cinco estados de base | DS-04, DS-06 |
| EXT-REP-02 | HU-44 | Identificación de tareas vencidas | DS-04, DS-06 |
| EXT-REP-03 | HU-44 | Cambios de estado y actualización posterior del reporte | DS-04, DS-06 |

La numeración definitiva y las expectativas deberán validarse con los responsables de HU-39 y los criterios actuales de Jira. El inventario inicial sigue siendo de 45 casos; estos cinco son sugerencias de ampliación y **no evidencian ejecución**.

## 9. Procedimiento de preparación y restauración

### 9.1. Antes del primer ciclo

1. Confirmar con backend que el SQL de `20261106134317_initial_schema.sql` está aplicado y que la instancia de Supabase es la correcta. **No aplicar de nuevo la migración en la base compartida.**
2. Confirmar en **Supabase → Authentication → Users** que las tres cuentas obligatorias de Ana, Carlos y María existen en el proyecto alojado. Verificar que se puede iniciar sesión en Tasker con ellas; no modificar ni divulgar sus contraseñas. Para el listado vacío de proyectos, comprobar aparte `sinproyecto@test.com` mediante la **consulta H** del archivo `verificar-datasets-qa53.sql`; si no está apta, preparar la alternativa temporal.
3. Notificar al equipo la ventana de carga y las cuatro identidades de proyecto reservadas: `53000000-0000-4000-8000-000000000001` a `...0004`.
4. Guardar copia o respaldo disponible del entorno compartido mediante el procedimiento autorizado por backend. La restauración QA no sustituye un respaldo general.
5. Abrir `supabase/qa/restaurar-datasets-qa53.sql`. El archivo viene con la confirmación `NO_AUTORIZADO` para impedir ejecuciones accidentales.
6. Tras la autorización y revisión del script, cambiar **solo durante la ejecución** el valor a `AUTORIZO_RESTAURAR_QA53`. Ejecutar el script completo en el **SQL Editor** de Supabase con permisos de administración autorizados. **No subir a GitHub el script con el bloqueo desactivado.**
7. Confirmar que la transacción finalizó correctamente. En caso de error, examinar el mensaje y asegurar que se haya realizado `ROLLBACK` antes de reintentar. Ninguna restauración fallida debe darse por válida.
8. Ejecutar `supabase/qa/verificar-datasets-qa53.sql`, que es **solo de lectura**, y guardar evidencia de resultados. La consulta **H** verifica si la cuenta opcional de HU-52 sirve para DS-00: debe indicar `APTO_SIN_PROYECTOS`; si no lo indica, esto **no invalida la restauración**, pero obliga a documentar y utilizar la alternativa temporal para esa prueba.
9. Registrar fecha, entorno, commit de código, versión `QA53-1.2`, responsable y autorización en el control del ciclo.

> **Advertencia:** la restauración elimina y vuelve a crear únicamente los cuatro proyectos con UUID reservados para QA53, sus tareas, membresías y asignaciones. Se perderán los cambios de prueba realizados en esos cuatro proyectos desde la restauración anterior. Si el script detecta un propietario inesperado o una membresía/asignación de otra cuenta, **se detiene** para revisión. No se usa `TRUNCATE` ni se borran proyectos por patrón de nombre.

### 9.2. Antes de cada ciclo posterior

1. Coordinar que nadie esté probando o editando los cuatro proyectos QA53.
2. Registrar los defectos y evidencias del ciclo anterior antes del reinicio.
3. Repetir la autorización, ejecución del script de restauración y verificación de resultados.
4. Ejecutar los casos de HU-40 a HU-45 contra los proyectos y roles correspondientes, y volver a restaurar antes de la siguiente campaña.

### 9.3. Casos destructivos y registro nuevo

- Para **crear o eliminar proyectos** se recomienda que Ana utilice un proyecto temporal creado desde Tasker, distinto de los cuatro UUID reservados. Eliminar proyectos con tareas puede requerir gestionar previamente sus relaciones porque `tarea_id_proyecto_fkey` tiene `ON DELETE RESTRICT`.
- La cuenta temporal utilizada por CP-AUT-01 se crea únicamente durante la prueba de registro; su limpieza se coordina con backend y no se hace desde `restaurar-datasets-qa53.sql`.
- Para comprobar un listado **completamente vacío de proyectos**, usar primero `sinproyecto@test.com` solo después de verificar cero proyectos propios y cero membresías en el Supabase compartido; si la cuenta no es apta, usar un usuario temporal recién registrado sin membresías. No se elimina ni se modifica ningún proyecto de HU-52 para dejar vacía una cuenta.
- Para simular fallos de red o tokens caducados, utilizar exclusivamente sesiones locales de QA y herramientas controladas; no cambiar políticas ni claves del proyecto compartido.
- DS-08 relativo a migraciones en una **base limpia** se ejecuta en instancia temporal o local, nunca reiniciando el Supabase compartido.

## 10. Verificación y criterios de aceptación de HU-53

| Criterio de HU-53 | Evidencia documental/técnica | Estado actual |
|---|---|---|
| Login correcto/incorrecto, proyecto vacío, estados, vencidas, fechas incoherentes y permisos | DS-00 a DS-07 y procedimientos del apartado 7 | Definido; pendiente de ejecución |
| Casos límite: longitudes, fechas iguales y listados vacíos | DS-00, DS-05, `QA53 Vacio` y comprobación opcional de `sinproyecto@test.com` | Definido; límite numérico de frontend y aptitud de la cuenta sin proyectos pendientes de verificar |
| Datos QA separados de HU-52 | UUID reservados, proyectos `QA53`, scripts en `supabase/qa/` | Separación lógica documentada; sin aislamiento físico |
| Restauración antes de cada ciclo | `restaurar-datasets-qa53.sql` y sección 9 | Script elaborado; ejecución pendiente |
| Cada caso HU-40 a HU-45 indica dataset | Matriz de 45 casos, sección 8 | Documentado |
| Datasets en el repositorio o plan | Este archivo y scripts complementarios | Archivos preparados para incorporar a GitHub |

La historia no debe marcarse como **completada técnicamente** hasta que la restauración y la verificación produzcan los resultados esperados en Supabase y quede constancia del procedimiento ejecutado.

## 11. Evidencias y registro del ciclo

Conservar capturas o salidas de SQL Editor y de Tasker, sin contraseñas, tokens ni claves privadas. Las evidencias mínimas son: existencia de las tres cuentas obligatorias, cuatro proyectos QA53, tabla de avances (37,5 %, 20 %, 0 %, 0 %), cinco estados en `QA53 Estados`, tarea vencida, permisos observados por identidad, restauración repetida con los mismos resultados y, para DS-00, comprobación de la cuenta sin proyectos o de la alternativa temporal.

| Campo del registro | Valor a completar al ejecutar |
|---|---|
| Ciclo y fecha | Pendiente |
| Entorno y proyecto Supabase | Pendiente (sin exponer secretos) |
| Commit / rama probada | Pendiente |
| Versión del dataset | QA53-1.2 |
| Responsable de ejecución | Pendiente |
| Autorización de backend | Pendiente |
| Resultado del script de restauración | No ejecutado |
| Resultado del script de verificación | No ejecutado |
| DS-00: cuenta opcional sin proyectos o alternativa temporal | Pendiente de comprobar |
| Incidentes / enlaces Jira | Pendiente |

## 12. Riesgos y decisiones pendientes

1. **Supabase compartido:** se requiere coordinación y autorización previa; la separación es lógica, no infraestructura aislada.
2. **Regla de asignación HU-31 frente a RLS:** `tarea_acceso` permite actualizar a cualquier miembro; debe evaluarse y, si corresponde, corregirse en backend antes de aceptar CP-TAR-07/CP-KAN-03.
3. **Máximos de longitud:** no figuran en la migración, por lo que faltan los límites definitivos para ejecutar `L` y `L+1`.
4. **Registro y ausencia total de proyectos:** CP-AUT-01 requiere una cuenta temporal nueva para validar el registro. Para el listado vacío se prioriza `sinproyecto@test.com` de HU-52 **solo si** una verificación confirma que no tiene proyectos propios ni membresías; de lo contrario se usa otra cuenta temporal sin proyectos.
5. **Sesión expirada:** requiere controlar refresh y autorización sin alterar sesiones compartidas.
6. **Sin prueba en vivo:** los scripts fueron preparados con base en el esquema facilitado; su ejecución real y resultados siguen pendientes.

