# Resumen consolidado de ejecución de pruebas de calidad (QA)

**Proyecto:** Tasker  
**Área responsable:** Aseguramiento de la calidad (QA)  
**Período de referencia:** Noviembre de 2026  
**Fecha de actualización:** 16 de noviembre de 2026  
**Metodología:** Pruebas funcionales manuales  
**Entorno:** Aplicación Angular conectada a Supabase  
**Documentación de referencia:** HU-39 — Plan Maestro de Pruebas y HU-53 — Datos de prueba  
**Historias evaluadas:** HU-40, HU-41, HU-42, HU-43 y HU-44

## 1. Objetivo de las pruebas

Las pruebas de calidad tuvieron como objetivo verificar el funcionamiento de las principales funcionalidades de Tasker, incluyendo autenticación, gestión de proyectos, administración de tareas, visualizaciones Kanban y cronograma, así como reportes y cálculos de progreso.

La ejecución se realizó de manera manual mediante la interfaz web de Angular, utilizando el servicio compartido de Supabase. Los casos se organizaron conforme al Plan Maestro de Pruebas HU-39 y se relacionaron con los conjuntos de datos definidos en HU-53.

Durante las verificaciones se identificaron funcionalidades correctas, defectos que requerían corrección y escenarios que no podían ejecutarse debido a implementaciones pendientes.

Los estados presentados corresponden a los últimos resultados comunicados por QA. Cuando no se dispone de evidencia suficiente sobre una comprobación específica, esta se identifica como pendiente y no se considera aprobada automáticamente.

## 2. Resumen general de resultados

Se documentaron cinco historias de usuario relacionadas con las pruebas funcionales de la aplicación.

| Historia | Módulo evaluado | Aprobados | Bloqueados | Pendientes | Fallidos actuales |
|---|---|---:|---:|---:|---:|
| HU-40 | Autenticación | 5 | 0 | 0 | 0 |
| HU-41 | Gestión de proyectos | 8 | 1 | 0 | 0 |
| HU-42 | Gestión de tareas | 5 | 1 | 1 | 0 |
| HU-43 | Kanban y cronograma | 6 | 0 | 3 | 0 |
| HU-44 | Reportes y progreso | 4 | 0 | 2 | 0 |
| **Total** | **Casos originales documentados** | **28** | **2** | **6** | **0** |

La tabla anterior contabiliza únicamente los 36 casos originales del Plan Maestro de Pruebas HU-39 relacionados con estas cinco historias.

Adicionalmente, se documentaron diez casos complementarios: nueve con resultados satisfactorios y uno pendiente, correspondiente a la expiración de sesión.

Por tanto, el registro consolidado comprende **46 casos y comprobaciones**, distribuidos de la siguiente manera:

- **37 aprobados:** resultados satisfactorios reportados por QA.
- **2 bloqueados:** funcionalidades pendientes de implementación.
- **7 pendientes:** comprobaciones específicas que todavía requieren ejecución o documentación adicional.
- **0 fallidos actualmente:** el defecto funcional detectado durante las pruebas de edición de tareas fue posteriormente corregido y revalidado según QA.

Los casos bloqueados y pendientes no se contabilizan como aprobados. Los casos complementarios se registran por separado y no modifican el inventario original de HU-39.

## 3. HU-40 — Pruebas de autenticación

**Objetivo:** Verificar el inicio de sesión, registro de usuarios, cierre de sesión, protección de rutas y comportamiento de las sesiones.

### Resultados

| Caso | Prueba realizada | Último resultado |
|---|---|---|
| CP-AUT-01 | Registro de usuario con datos válidos | Aprobado |
| CP-AUT-02 | Registro con datos inválidos | Aprobado |
| CP-AUT-03 | Inicio de sesión con credenciales válidas | Aprobado |
| CP-AUT-04 | Inicio de sesión con credenciales incorrectas | Aprobado |
| CP-AUT-05 | Cierre de sesión y protección de rutas | Aprobado |
| EXT-AUT-01 | Comportamiento ante una sesión expirada | Pendiente |

### Descripción de los resultados

Se verificó que Tasker permite iniciar sesión con credenciales válidas y rechaza los intentos realizados con credenciales incorrectas. Cuando el usuario introduce datos de autenticación inválidos, la aplicación presenta un mensaje de error y evita el acceso.

También se comprobó el cierre de sesión y la protección de rutas. Después de cerrar sesión, el usuario regresa a la pantalla de autenticación. Al intentar acceder directamente a una ruta protegida sin autenticación, la aplicación redirige al formulario de inicio de sesión.

Inicialmente, las pruebas de registro de usuarios estaban bloqueadas porque la funcionalidad todavía no se encontraba implementada. Posteriormente, se habilitaron y aprobaron los escenarios de registro válido e inválido.

La única comprobación pendiente corresponde a la expiración de sesiones. No se implementó un límite explícito de duración o inactividad en Tasker, y no se ejecutó una prueba controlada de expiración efectiva. Esta situación no implica necesariamente que los tokens de Supabase carezcan de expiración, ya que ese servicio dispone de mecanismos propios de gestión y renovación.

**Resultado de HU-40:** cinco casos originales aprobados y un caso complementario pendiente. No se reportaron defectos funcionales activos.

## 4. HU-41 — Pruebas de gestión de proyectos

**Historia de Jira:** SCRUM-57  
**Objetivo:** Verificar las operaciones de proyectos, las validaciones de formularios, las restricciones de acceso y la administración de integrantes.

### Resultados

| Caso | Prueba realizada | Último resultado |
|---|---|---|
| CP-PRO-01 | Creación de proyectos | Aprobado |
| CP-PRO-02 | Consulta de proyectos | Aprobado |
| CP-PRO-03 | Edición de proyectos | Aprobado |
| CP-PRO-04 | Eliminación de proyectos | Aprobado |
| CP-PRO-05 | Acceso y restricciones sobre proyectos ajenos | Aprobado |
| EXT-PRO-01 | Validaciones de formularios | Aprobado |
| CP-INT-01 | Agregar integrantes a proyectos | Aprobado |
| CP-INT-02 | Asignación de tareas a integrantes | Bloqueado |
| CP-INT-03 | Quitar integrantes de proyectos | Aprobado |
| CP-INT-04 | Administración de integrantes por usuarios sin permisos | Aprobado |

### Descripción de los resultados

Se comprobó el funcionamiento de las operaciones principales de gestión de proyectos. La creación, consulta, edición y eliminación fueron aprobadas durante las diferentes etapas de ejecución de las pruebas.

También se validó el comportamiento de los formularios, confirmando que las restricciones probadas se aplican correctamente.

En una primera etapa, varias funcionalidades relacionadas con integrantes y permisos no estaban implementadas. Posteriormente, se incorporaron y aprobaron las siguientes operaciones:

- Agregar integrantes a un proyecto.
- Quitar integrantes existentes.
- Aplicar restricciones de acceso a proyectos ajenos.
- Impedir que usuarios sin permisos de propietario administren integrantes.

Estas comprobaciones permitieron actualizar los casos correspondientes de bloqueados a aprobados.

La única prueba que permanece bloqueada es la asignación de tareas a integrantes, correspondiente a CP-INT-02. Aunque la administración de integrantes ya funciona, todavía no se confirmó la implementación de la operación específica para asignarles tareas.

Las restricciones de acceso fueron reportadas como satisfactorias desde la aplicación. Sin embargo, el registro no acredita una comprobación independiente de todas las políticas RLS mediante solicitudes directas a Supabase.

**Resultado de HU-41:** ocho casos originales aprobados, un caso bloqueado y un caso complementario aprobado. No se reportaron defectos funcionales confirmados en las pruebas ejecutadas.

## 5. HU-42 — Pruebas de gestión de tareas

**Historia de Jira:** SCRUM-58  
**Objetivo:** Verificar la administración de tareas, asignación de responsables, cambios de estado, validaciones de fechas y restricciones de autorización.

### Resultados

| Caso | Prueba realizada | Último resultado |
|---|---|---|
| CP-TAR-01 | Creación de tareas | Aprobado |
| CP-TAR-02 | Validaciones generales del formulario | Pendiente |
| CP-TAR-03 | Edición de tareas | Aprobado |
| CP-TAR-04 | Eliminación de tareas | Aprobado |
| CP-TAR-05 | Asignación o cambio de responsables | Bloqueado |
| CP-TAR-06 | Cambio de estado por usuario asignado | Aprobado |
| CP-TAR-07 | Rechazo de cambio de estado por usuario no asignado | Aprobado |
| EXT-TAR-01 | Consulta funcional de tareas | Aprobado |
| EXT-TAR-02 | Validación de fechas | Aprobado |
| EXT-TAR-03 | Cambio funcional de estado | Aprobado |

### Descripción de los resultados

Las pruebas confirmaron el funcionamiento de la creación, consulta y eliminación de tareas. También se verificaron los cambios generales de estado y las validaciones de fechas.

Durante la ejecución inicial se identificó un defecto en la edición: el botón Editar no respondía cuando el usuario intentaba modificar una tarea existente. Este comportamiento impidió completar el caso CP-TAR-03.

Posteriormente, la funcionalidad fue corregida y QA confirmó que la edición de tareas funciona correctamente. Por esta razón, el caso se actualizó de fallido a aprobado, conservando el registro histórico del defecto.

Además, se probaron las restricciones relacionadas con HU-31. Se confirmó que el usuario asignado puede cambiar el estado de su tarea y que un usuario no asignado tiene restringida esa operación.

La asignación o el cambio de responsables desde la interfaz todavía no se confirmó como implementada. En consecuencia, CP-TAR-05 permanece bloqueado.

Respecto a las validaciones, las pruebas de fechas se encuentran aprobadas. No obstante, CP-TAR-02 continúa pendiente porque no se documentaron todos los escenarios generales de campos obligatorios y datos inválidos.

**Resultado de HU-42:** cinco casos originales aprobados, uno bloqueado y uno pendiente de completar. Los tres casos complementarios fueron aprobados.

### Defecto identificado y corregido

| Campo | Descripción |
|---|---|
| Identificador interno | DEF-HU42-01 |
| Funcionalidad | Edición de tareas |
| Problema inicial | El botón Editar no respondía |
| Resultado esperado | Abrir o habilitar la edición de una tarea |
| Resultado inicial | No era posible completar la modificación |
| Estado funcional actual | Corregido y aprobado según QA |
| Estado administrativo en Jira | Pendiente de verificar |

La corrección fue revalidada funcionalmente según QA. El defecto se conserva en el historial para documentar la incidencia detectada durante las pruebas.

## 6. HU-43 — Pruebas de Kanban y cronograma

**Objetivo:** Verificar la agrupación de tareas, el drag and drop, la persistencia, la sincronización de las vistas y la presentación correcta de fechas y estados.

### Resultados

| Caso | Prueba realizada | Último resultado |
|---|---|---|
| CP-KAN-01 | Agrupación de tareas por estado | Aprobado |
| CP-KAN-02 | Drag and drop por usuario asignado | Aprobado |
| CP-KAN-03 | Rechazo de drag and drop por integrante no asignado | Pendiente |
| CP-KAN-04 | Reversión ante un fallo de actualización | Pendiente |
| CP-KAN-05 | Persistencia después de recargar | Aprobado |
| CP-CRO-01 | Visualización de tareas y fechas | Aprobado |
| CP-CRO-02 | Actualización de fechas en cronograma | Aprobado |
| CP-CRO-03 | Orden y agrupación por fechas | Aprobado |
| CP-CRO-04 | Validación de fechas inválidas o límite | Pendiente |
| EXT-KAN-01 | Rechazo de usuario ajeno al proyecto | Aprobado |
| EXT-KAN-02 | Sincronización de Kanban y cronograma | Aprobado |

### Descripción de los resultados

QA confirmó que el tablero Kanban agrupa correctamente las tareas según su estado y que el desplazamiento de tarjetas mediante drag and drop funciona para los usuarios autorizados.

También se reportó que los cambios realizados se conservan después de actualizar la aplicación y se reflejan correctamente en el cronograma.

En cuanto a las restricciones de acceso, se verificó funcionalmente que un usuario ajeno al proyecto no puede modificar sus tareas mediante las operaciones protegidas.

La visualización del cronograma también fue reportada como correcta. Las tareas se presentan con sus fechas y estados, y la información se actualiza de forma consistente cuando se realizan modificaciones.

Aunque las funcionalidades generales se encuentran operativas, permanecen tres verificaciones específicas sin ejecución diferenciada documentada:

- El rechazo de drag and drop realizado por un integrante del proyecto que no sea el responsable de la tarea.
- La recuperación del estado anterior cuando una operación de drag and drop falla por un problema de actualización.
- El tratamiento de fechas inválidas o combinaciones límite.

Estas comprobaciones no se consideran fallidas; permanecen pendientes hasta disponer de sus resultados.

**Resultado de HU-43:** seis casos originales aprobados, tres pendientes y dos casos complementarios aprobados. No se reportaron defectos funcionales confirmados.

## 7. HU-44 — Pruebas de reportes y progreso

**Objetivo:** Verificar la exactitud de los cálculos de avance, los recuentos de tareas, la identificación de actividades vencidas, la presentación de tablas, la impresión y la actualización de reportes.

### Resultados

| Caso | Prueba realizada | Último resultado |
|---|---|---|
| CP-AVA-01 | Progreso de proyecto sin tareas | Pendiente |
| CP-AVA-02 | Cálculo del porcentaje de avance | Aprobado |
| CP-AVA-03 | Actualización del porcentaje tras cambiar estados | Aprobado |
| CP-REP-01 | Generación de reporte con tareas | Aprobado |
| CP-REP-02 | Impresión de reportes | Aprobado |
| CP-REP-03 | Reporte de proyecto sin tareas | Pendiente |
| EXT-REP-01 | Recuento de tareas por estado | Aprobado |
| EXT-REP-02 | Identificación de tareas vencidas | Aprobado |
| EXT-REP-03 | Consistencia de tablas y actualización de reportes | Aprobado |

### Descripción de los resultados

Se verificó funcionalmente que Tasker presenta los porcentajes de avance de los proyectos y actualiza sus indicadores cuando cambia el estado de las tareas.

También se comprobó el recuento por estado, permitiendo visualizar la distribución de tareas entre los diferentes estados disponibles.

Las funcionalidades de identificación de tareas vencidas, visualización de información tabular e impresión fueron reportadas como satisfactorias.

Adicionalmente, se confirmó que los reportes reflejan las modificaciones realizadas sobre las tareas, manteniendo la consistencia entre la información registrada y los indicadores presentados.

Para el cálculo del porcentaje de avance, el Plan Maestro de Pruebas considera la siguiente fórmula:

**Avance (%) = (tareas completadas / total de tareas) × 100**

Como referencia, un proyecto con cuatro tareas, de las cuales dos están completadas, presenta un avance esperado del 50 %. Al completar una tarea adicional, el valor esperado aumenta al 75 %.

Estos valores corresponden al escenario definido en el Plan Maestro. No se registraron los valores numéricos exactos observados durante la ejecución real.

Permanecen dos verificaciones específicas pendientes: el cálculo del avance para un proyecto sin tareas y el comportamiento del reporte cuando el proyecto no contiene actividades.

**Resultado de HU-44:** cuatro casos originales aprobados, dos pendientes y tres casos complementarios aprobados. No se reportaron defectos funcionales confirmados.

## 8. Seguimiento de defectos y funcionalidades pendientes

Durante las pruebas se identificó un defecto funcional confirmado, correspondiente al botón Editar de tareas en HU-42. El problema fue corregido y la funcionalidad volvió a aprobarse según QA.

Además, se registraron implementaciones pendientes y comprobaciones que todavía requieren resultados específicos.

| Historia | Situación pendiente | Estado |
|---|---|---|
| HU-40 | Comportamiento ante expiración de sesión | Pendiente de validación |
| HU-41 | Asignación de tareas a integrantes | Bloqueada |
| HU-42 | Asignación o cambio de responsables | Bloqueada |
| HU-42 | Validaciones generales de campos del formulario | Pendiente |
| HU-43 | Restricción de drag and drop para integrante no asignado | Pendiente |
| HU-43 | Reversión del estado ante fallos de actualización | Pendiente |
| HU-43 | Validación de fechas inválidas o límite | Pendiente |
| HU-44 | Avance de un proyecto sin tareas | Pendiente |
| HU-44 | Reporte de un proyecto sin tareas | Pendiente |

La asignación de responsables aparece relacionada con HU-41 y HU-42 porque ambas historias incluyen comprobaciones sobre esta funcionalidad desde perspectivas diferentes: administración de integrantes y gestión de tareas.

Los escenarios no implementados se clasifican como bloqueados. Los escenarios que requieren una comprobación adicional se registran como pendientes.

## 9. Evidencias y documentación generada

Las pruebas fueron documentadas mediante archivos Markdown dentro del directorio `docs/qa/` del repositorio del proyecto.

| Documento | Contenido |
|---|---|
| `ejecucion-pruebas-hu-40.md` | Autenticación, registro, cierre de sesión y protección de rutas |
| `ejecucion-pruebas-hu-41.md` | Gestión de proyectos, formularios, permisos e integrantes |
| `ejecucion-pruebas-hu-42.md` | Gestión de tareas, fechas, responsables, cambios de estado y defectos |
| `ejecucion-pruebas-hu-43.md` | Tablero Kanban, drag and drop, persistencia y cronograma |
| `ejecucion-pruebas-hu-44.md` | Cálculos de avance, reportes, impresión y consistencia de datos |

Para las historias HU-40, HU-41 y HU-42 se definieron referencias a evidencias visuales. Su incorporación efectiva debe comprobarse en el repositorio.

En HU-43 y HU-44 no se adjuntaron capturas de pantalla por decisión de QA. Las verificaciones de estas historias se documentaron mediante descripciones de procedimientos, resultados esperados y resultados reportados.

La ausencia de capturas limita la posibilidad de comprobar visualmente cada ejecución de manera independiente, aunque no invalida por sí sola el registro manual de resultados.

La documentación también mantiene la trazabilidad entre los casos de prueba de HU-39, los datasets relacionados de HU-53 y las historias de usuario evaluadas.

## 10. Resultado general de QA

Las pruebas realizadas permitieron verificar el funcionamiento de las principales operaciones de Tasker.

La autenticación, la gestión de proyectos, gran parte de la gestión de tareas, las visualizaciones Kanban y cronograma y los reportes presentaron resultados funcionales favorables según las ejecuciones reportadas por QA.

Durante el proceso se identificó un defecto en la edición de tareas, que posteriormente fue corregido y revalidado funcionalmente.

El registro actualizado comprende 28 casos originales aprobados, dos bloqueados y seis pendientes, además de nueve casos complementarios aprobados y uno pendiente.

No se mantienen casos originales clasificados actualmente como fallidos, aunque persisten funcionalidades sin implementar y comprobaciones específicas sin concluir.

Por estas razones, el resultado general corresponde a una **validación funcional parcial con resultados favorables en las operaciones ejecutadas**, no a una aprobación completa de todos los criterios de calidad del sistema. El cierre definitivo requiere resolver los bloqueos, completar las verificaciones pendientes y registrar las aprobaciones correspondientes en Jira y en el proceso de revisión del equipo.
