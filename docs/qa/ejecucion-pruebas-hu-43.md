# HU-43 — Registro de ejecución de pruebas de Kanban y cronograma

**Proyecto:** Tasker  
**Historia de Jira:** HU-43 — Pruebas de Kanban y cronograma  
**Clave de Jira:** SCRUM-59  
**Responsable:** QA  
**Tipo:** Pruebas funcionales manuales  
**Versión del registro:** 1.0  
**Fecha de elaboración:** 16 de noviembre de 2026  
**Fecha real de ejecución:** Pendiente de registrar  
**Fecha estimada de la historia:** 12–13 de noviembre de 2026  
**Aplicación:** Angular, `http://localhost:4200`  
**Backend:** Supabase compartido del equipo  
**Plan de referencia:** HU-39, versión 1.1  
**Datasets de referencia:** DS-03, DS-04, DS-05, DS-06 y DS-07  
**Build / commit del frontend:** Pendiente de registrar  
**Evidencia:** Resultados de pruebas manuales comunicados por QA; sin capturas adjuntas  
**Estado:** Funcionalidades reportadas como correctas, con verificaciones específicas pendientes de documentar

## 1. Objetivo

Validar las visualizaciones Kanban y cronograma de Tasker, comprobando la agrupación de tareas por estado, las operaciones de drag and drop, las restricciones de autorización, la persistencia de los cambios y la consistencia de los datos presentados en ambas vistas.

También se busca verificar las fechas y estados visualizados y documentar los defectos encontrados durante la ejecución.

## 2. Alcance y condiciones de ejecución

Las pruebas se realizaron manualmente en la aplicación Angular conectada al Supabase compartido del equipo.

QA informó que las funcionalidades de Kanban y cronograma se encuentran implementadas y funcionan correctamente.

El funcionamiento reportado comprende la agrupación de tareas por estado, el desplazamiento de tarjetas, las restricciones para usuarios ajenos al proyecto, la persistencia, la sincronización entre vistas y la presentación de fechas y estados.

Los resultados se registran como satisfactorios según la ejecución reportada por QA. No se adjuntan capturas por decisión del responsable de pruebas.

Las verificaciones específicas que requieren simular fallos de actualización, utilizar fechas inválidas o comprobar permisos de un integrante interno no asignado se mantienen diferenciadas cuando no existe información suficiente sobre su ejecución.

No se ha confirmado la restauración de los datasets de HU-53 antes de estas pruebas. Los códigos DS se utilizan como referencia de los datos requeridos.

## 3. Matriz de trazabilidad

| Caso | Escenario | Dataset | Estado |
|---|---|---|---|
| CP-KAN-01 | Agrupación de tareas por estado | DS-04 | Aprobado según QA |
| CP-KAN-02 | Drag and drop por usuario asignado | DS-04 | Aprobado según QA |
| CP-KAN-03 | Rechazo de drag and drop de integrante no asignado | DS-03, DS-04 | Pendiente de comprobación específica |
| CP-KAN-04 | Reversión de tarjeta ante fallo de actualización | DS-07 | Pendiente de prueba controlada |
| CP-KAN-05 | Persistencia después de recargar | DS-04 | Aprobado según QA |
| CP-CRO-01 | Visualización de tareas y fechas en cronograma | DS-06 | Aprobado según QA |
| CP-CRO-02 | Actualización de fechas en cronograma | DS-06 | Aprobado según QA |
| CP-CRO-03 | Orden y agrupación por fechas | DS-06 | Aprobado según QA |
| CP-CRO-04 | Fecha inválida o combinación límite | DS-05 | Pendiente de comprobación específica |
| EXT-KAN-01 | Rechazo de usuario ajeno al proyecto | DS-03, DS-04 | Aprobado según QA |
| EXT-KAN-02 | Sincronización entre Kanban y cronograma | DS-04, DS-06 | Aprobado según QA |

Los casos CP-KAN-01 a CP-KAN-05 y CP-CRO-01 a CP-CRO-04 pertenecen al Plan Maestro de Pruebas HU-39.

EXT-KAN-01 y EXT-KAN-02 son casos complementarios para registrar expresamente criterios de HU-43. No modifican el inventario original de 45 casos de HU-39.

## 4. Fichas de ejecución

### CP-KAN-01 — Agrupación de tareas por estado

**Prioridad:** Alta  
**Dataset:** DS-04  
**Estado:** Aprobado según QA

**Precondiciones:** Usuario autenticado, proyecto disponible y tareas con diferentes estados.

**Procedimiento:**

1. Iniciar sesión en Tasker.
2. Acceder a un proyecto con tareas.
3. Abrir el tablero Kanban.
4. Revisar las columnas disponibles.
5. Comprobar que las tarjetas se muestran agrupadas según su estado.
6. Verificar la correspondencia entre el estado de cada tarea y su columna.

**Resultado esperado:** Las tarjetas se presentan en la columna correspondiente a su estado real, conforme a las reglas del tablero.

**Resultado obtenido:** QA informó que la agrupación de tareas por estado funciona correctamente.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### CP-KAN-02 — Drag and drop por usuario asignado

**Prioridad:** Crítica  
**Dataset:** DS-04  
**Estado:** Aprobado según QA

**Precondiciones:** Tarea con responsable identificado y usuario asignado autenticado.

**Procedimiento:**

1. Iniciar sesión como usuario asignado a la tarea.
2. Abrir el tablero Kanban del proyecto.
3. Identificar la tarjeta correspondiente.
4. Arrastrarla a otra columna permitida.
5. Soltarla en la columna de destino.
6. Comprobar que se refleje el nuevo estado.

**Resultado esperado:** El sistema permite la operación al usuario autorizado y actualiza el estado de la tarea.

**Resultado obtenido:** QA informó que el desplazamiento de tareas mediante drag and drop funciona correctamente para usuarios autorizados.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

**Observación:** La persistencia de los cambios se registra en CP-KAN-05. Los permisos deben respetar la restricción de HU-31 y HU-33.

### CP-KAN-03 — Rechazo de drag and drop de integrante no asignado

**Prioridad:** Crítica  
**Dataset:** DS-03, DS-04  
**Estado:** Pendiente de comprobación específica

**Precondiciones:** Proyecto con una tarea asignada a un integrante y otro integrante del mismo proyecto que no sea responsable de esa tarea.

**Procedimiento previsto:**

1. Iniciar sesión como integrante del proyecto no asignado a la tarea.
2. Abrir el tablero Kanban.
3. Intentar arrastrar la tarjeta a otra columna.
4. Verificar que la operación sea rechazada.
5. Comprobar que el estado original permanezca sin cambios.

**Resultado esperado:** Un integrante no asignado no puede modificar mediante drag and drop el estado de una tarea que no le corresponde.

**Resultado obtenido:** QA confirmó el rechazo de usuarios ajenos al proyecto, pero no identificó expresamente una ejecución diferenciada con un integrante del mismo proyecto que no fuera el asignado.

**Evidencia:** Sin captura ni registro específico.

**Defectos:** Ninguno confirmado.

**Observación:** Rechazar a un usuario externo y rechazar a un integrante interno no asignado son condiciones de autorización diferentes. La prueba de usuario externo se documenta en EXT-KAN-01.

### CP-KAN-04 — Reversión ante fallo de drag and drop

**Prioridad:** Crítica  
**Dataset:** DS-07  
**Estado:** Pendiente de prueba controlada

**Precondiciones:** Usuario autorizado, tarea con estado conocido y mecanismo seguro para simular un fallo de red o actualización.

**Procedimiento previsto:**

1. Identificar la columna de origen de una tarea.
2. Simular un fallo de actualización en el entorno autorizado de QA.
3. Intentar mover la tarea mediante drag and drop.
4. Verificar que la aplicación informe el error.
5. Comprobar que la tarjeta regrese a su estado anterior.
6. Restablecer la conexión y consultar nuevamente los datos.

**Resultado esperado:** La aplicación informa el fallo, restaura el estado visual anterior y no conserva un cambio rechazado en la base de datos.

**Resultado obtenido:** No se comunicó una ejecución específica mediante simulación controlada de errores.

**Evidencia:** No disponible.

**Defectos:** Ninguno confirmado.

**Observación:** El funcionamiento correcto del drag and drop en condiciones normales no permite considerar aprobada esta prueba de recuperación ante errores.

### CP-KAN-05 — Persistencia del estado después de recargar

**Prioridad:** Alta  
**Dataset:** DS-04  
**Estado:** Aprobado según QA

**Precondiciones:** Tarea disponible y usuario autorizado para cambiar su estado.

**Procedimiento:**

1. Abrir el tablero Kanban.
2. Cambiar el estado de una tarea autorizada.
3. Comprobar su nueva ubicación.
4. Recargar la aplicación.
5. Verificar que la tarea permanece en la columna correspondiente al estado guardado.

**Resultado esperado:** El estado se conserva después de recargar la página.

**Resultado obtenido:** QA confirmó el funcionamiento de la persistencia del estado.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### CP-CRO-01 — Visualización de tareas y fechas en cronograma

**Prioridad:** Alta  
**Dataset:** DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas que contienen fechas registradas.

**Procedimiento:**

1. Iniciar sesión.
2. Seleccionar un proyecto.
3. Abrir el cronograma.
4. Verificar que las tareas correspondientes se visualizan.
5. Comprobar las fechas y los estados presentados.

**Resultado esperado:** El cronograma representa las tareas y fechas según la información registrada y las reglas de la vista.

**Resultado obtenido:** QA informó que las tareas, fechas y estados se visualizan correctamente en el cronograma.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### CP-CRO-02 — Actualización de fechas en cronograma

**Prioridad:** Alta  
**Dataset:** DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Tarea con fechas registradas y operación de modificación disponible.

**Procedimiento:**

1. Seleccionar una tarea existente.
2. Modificar una fecha mediante el procedimiento autorizado.
3. Guardar el cambio.
4. Abrir o actualizar el cronograma.
5. Comprobar la fecha presentada.

**Resultado esperado:** El cronograma refleja la fecha guardada, sin diferencias respecto a los datos de la tarea.

**Resultado obtenido:** QA informó que la actualización y visualización de fechas funcionan correctamente.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### CP-CRO-03 — Orden y agrupación de actividades por fecha

**Prioridad:** Media  
**Dataset:** DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas que presentan fechas diferentes.

**Procedimiento:**

1. Abrir el cronograma del proyecto.
2. Identificar tareas con fechas distintas.
3. Revisar su ubicación y orden.
4. Comparar la representación con las fechas registradas.
5. Verificar que se respeten las reglas aprobadas para la vista.

**Resultado esperado:** Las tareas se presentan según el comportamiento definido para el cronograma.

**Resultado obtenido:** QA confirmó el funcionamiento de la visualización y organización de las tareas en el cronograma.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### CP-CRO-04 — Fechas inválidas o combinaciones límite

**Prioridad:** Media  
**Dataset:** DS-05  
**Estado:** Pendiente de comprobación específica

**Precondiciones:** Formulario de fechas de tareas disponible y restricciones definidas.

**Procedimiento previsto:**

1. Seleccionar una tarea de prueba.
2. Introducir una fecha inválida o combinación que incumpla una regla aprobada.
3. Intentar guardar los cambios.
4. Comprobar el mensaje o bloqueo correspondiente.
5. Verificar que el cronograma no incorpore datos inválidos.

**Resultado esperado:** Las restricciones de fechas se aplican conforme a los criterios vigentes, sin introducir límites arbitrarios.

**Resultado obtenido:** Se reportó que la visualización de fechas funciona. No se proporcionó el detalle de una prueba específica de fechas inválidas o valores límite durante HU-43.

**Evidencia:** Sin registro específico.

**Defectos:** Ninguno confirmado.

### EXT-KAN-01 — Rechazo de usuario ajeno al proyecto

**Prioridad:** Crítica, caso complementario  
**Dataset:** DS-03, DS-04  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas y cuenta que no pertenece al proyecto.

**Procedimiento:**

1. Identificar una cuenta de prueba ajena al proyecto.
2. Iniciar sesión con esa cuenta.
3. Intentar acceder al tablero y realizar una modificación no autorizada.
4. Verificar que se impida la operación.
5. Comprobar que no se haya alterado el estado de la tarea.

**Resultado esperado:** Los usuarios ajenos al proyecto no pueden modificar sus tareas mediante drag and drop.

**Resultado obtenido:** QA confirmó el funcionamiento de las restricciones para usuarios ajenos al proyecto.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

**Observación:** Esta comprobación funcional no sustituye una prueba independiente de RLS mediante solicitudes autenticadas no privilegiadas.

### EXT-KAN-02 — Sincronización entre Kanban y cronograma

**Prioridad:** Alta, caso complementario  
**Dataset:** DS-04, DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas que se visualizan en Kanban y cronograma.

**Procedimiento:**

1. Abrir el tablero Kanban.
2. Identificar una tarea y registrar su estado.
3. Realizar un cambio autorizado.
4. Consultar el cronograma.
5. Verificar que la información refleje el estado actualizado.
6. Comprobar que no existan diferencias entre ambas vistas.
7. Actualizar las vistas y repetir la comparación cuando corresponda.

**Resultado esperado:** Las vistas presentan información consistente con los cambios guardados.

**Resultado obtenido:** QA informó que Kanban y cronograma reflejan correctamente los cambios realizados.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

## 5. Resumen de ejecución

### 5.1. Casos originales de HU-39

| Estado | Cantidad | Casos |
|---|---:|---|
| Aprobados según QA | 6 | CP-KAN-01, CP-KAN-02, CP-KAN-05, CP-CRO-01, CP-CRO-02, CP-CRO-03 |
| Pendientes de comprobación específica | 3 | CP-KAN-03, CP-KAN-04, CP-CRO-04 |
| Fallidos confirmados | 0 | Ninguno |
| Total | 9 | — |

### 5.2. Casos complementarios

| Caso | Resultado |
|---|---|
| EXT-KAN-01 — Rechazo de usuario ajeno | Aprobado según QA |
| EXT-KAN-02 — Sincronización de vistas | Aprobado según QA |

### 5.3. Criterios de aceptación de HU-43

| Criterio | Resultado |
|---|---|
| Agrupación de tareas por estado | Satisfactorio según QA |
| Drag and drop por usuario autorizado | Satisfactorio según QA |
| Rechazo de usuario ajeno | Satisfactorio según QA |
| Persistencia del estado | Satisfactorio según QA |
| Sincronización entre Kanban y cronograma | Satisfactorio según QA |
| Visualización de fechas y estados | Satisfactorio según QA |
| Registro de defectos | Documentado |

El resultado funcional general es favorable según QA. No se reportaron defectos confirmados.

Permanecen pendientes de documentación o ejecución tres escenarios específicos del Plan Maestro.

## 6. Registro de defectos

No se reportaron defectos funcionales confirmados durante las pruebas realizadas de Kanban y cronograma.

Las verificaciones pendientes no se contabilizan como defectos ni como pruebas fallidas.

No se asignan identificadores ficticios de incidencias de Jira.

## 7. Evidencia y reproducibilidad

No se incorporarán capturas de pantalla ni grabaciones.

**Tipo de respaldo disponible:** registro escrito de la ejecución manual y resultados reportados por QA.

El documento contiene:

- Identificadores de casos.
- Precondiciones.
- Datasets de referencia.
- Pasos reproducibles.
- Resultados esperados.
- Resultados comunicados por QA.
- Estados de ejecución.

No se dispone de evidencias gráficas ni de un registro automatizado que permita comprobar de forma independiente cada resultado.

Para fortalecer la trazabilidad, se recomienda completar la fecha real, el navegador, el commit del frontend y las cuentas de prueba utilizadas, sin incluir contraseñas.

## 8. Verificaciones y asuntos pendientes

1. Completar CP-KAN-03 con un integrante del proyecto que no sea el asignado a la tarea.
2. Ejecutar CP-KAN-04 mediante una simulación controlada de fallo de actualización.
3. Comprobar CP-CRO-04 con una entrada de fecha inválida o límite.
4. Registrar las cuentas de prueba utilizadas en las comprobaciones de autorización.
5. Identificar el commit de Angular probado y la fecha de ejecución.
6. Mantener la trazabilidad de las restricciones de HU-31 y HU-33.
7. Registrar cualquier defecto identificado durante futuras reejecuciones.

## 9. Estado de HU-43

**Estado:** funcionalidades reportadas como correctas; ejecución documental con verificaciones específicas pendientes.

QA confirmó el funcionamiento general del tablero Kanban, el cronograma, las restricciones sobre usuarios ajenos, la persistencia y la sincronización entre ambas vistas.

No se reportaron defectos funcionales.

No se adjuntarán capturas por decisión del responsable de QA. Los resultados quedan respaldados por el registro manual descrito en este documento.

La aprobación final de todos los casos del Plan Maestro requiere confirmar los escenarios específicos todavía pendientes o documentar formalmente una decisión del equipo sobre su alcance.
