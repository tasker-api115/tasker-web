# HU-44 — Registro de ejecución de pruebas de reportes y progreso

**Proyecto:** Tasker  
**Historia de Jira:** HU-44 — Pruebas de reportes y progreso  
**Clave de Jira:** SCRUM-60  
**Responsable:** QA  
**Tipo:** Pruebas funcionales manuales  
**Versión del registro:** 1.0  
**Fecha de elaboración:** 16 de noviembre de 2026  
**Fecha real de ejecución:** Pendiente de registrar  
**Fecha estimada de la historia:** 13–14 de noviembre de 2026  
**Aplicación:** Angular, `http://localhost:4200`  
**Backend:** Supabase compartido del equipo  
**Plan de referencia:** HU-39, versión 1.1  
**Datasets de referencia:** DS-00, DS-02, DS-04 y DS-06  
**Build / commit del frontend:** Pendiente de registrar  
**Evidencia:** Resultados manuales comunicados por QA; sin capturas adjuntas  
**Estado:** Funcionalidades reportadas como correctas, con comprobaciones específicas pendientes de documentar

## 1. Objetivo

Validar el funcionamiento de los reportes y cálculos de avance de Tasker, comprobando que los valores presentados sean consistentes con la información de las tareas y proyectos.

Las pruebas comprenden porcentaje de avance, recuentos por estado, identificación de tareas vencidas, contenido de tablas, impresión de reportes y actualización de la información después de realizar modificaciones.

Los resultados se documentan utilizando los casos del Plan Maestro de Pruebas HU-39 y los datasets relacionados de HU-53.

## 2. Alcance y condiciones de ejecución

Las pruebas se realizaron manualmente desde Angular, utilizando Supabase como backend.

QA informó que las funcionalidades de reportes y progreso funcionan correctamente.

El resultado reportado comprende los indicadores de avance, los recuentos de tareas, la identificación de actividades vencidas, la visualización de información tabular, la impresión y la actualización de los reportes después de realizar cambios.

No se incorporarán capturas de pantalla por decisión del responsable de QA. Los resultados se documentan mediante registros escritos y procedimientos reproducibles.

No se proporcionaron valores numéricos observados, identificadores de proyectos utilizados ni detalles de una ejecución sobre proyectos vacíos. Por ello, los resultados cuantitativos de referencia del Plan Maestro se mantienen como valores esperados y no como mediciones efectivamente registradas.

No se ha confirmado la restauración de los datasets de HU-53. Las referencias DS indican los datos requeridos para reproducir cada escenario.

## 3. Matriz de trazabilidad

| Criterio | Caso | Dataset | Estado |
|---|---|---|---|
| Progreso de proyecto sin tareas | CP-AVA-01 | DS-00, DS-02 | Pendiente de comprobación específica |
| Cálculo de porcentaje con tareas en distintos estados | CP-AVA-02 | DS-06 | Aprobado según QA; valores observados no registrados |
| Actualización del avance después de cambiar estados | CP-AVA-03 | DS-04, DS-06 | Aprobado según QA |
| Reporte de proyecto con tareas | CP-REP-01 | DS-06 | Aprobado según QA |
| Impresión de reportes | CP-REP-02 | DS-06 | Aprobado según QA |
| Reporte de proyecto sin tareas | CP-REP-03 | DS-00 | Pendiente de comprobación específica |
| Recuento de tareas por estado | EXT-REP-01 | DS-04, DS-06 | Aprobado según QA |
| Identificación de tareas vencidas | EXT-REP-02 | DS-06 | Aprobado según QA |
| Actualización de datos y tablas del reporte | EXT-REP-03 | DS-04, DS-06 | Aprobado según QA |

Los casos CP-AVA-01 a CP-AVA-03 y CP-REP-01 a CP-REP-03 pertenecen al inventario original de HU-39.

EXT-REP-01, EXT-REP-02 y EXT-REP-03 son casos complementarios para registrar individualmente criterios de HU-44. No modifican los 45 casos originales del Plan Maestro.

## 4. Fichas de ejecución

### CP-AVA-01 — Progreso de proyecto sin tareas

**Prioridad:** Alta  
**Dataset:** DS-00, DS-02  
**Estado:** Pendiente de comprobación específica

**Precondiciones:** Proyecto de prueba sin tareas asociadas.

**Procedimiento previsto:**

1. Iniciar sesión en Tasker.
2. Acceder a un proyecto vacío.
3. Abrir el indicador de progreso.
4. Comprobar el porcentaje mostrado.
5. Verificar que la aplicación no produzca un error por división entre cero.

**Resultado esperado:** El progreso mostrado es 0 %, conforme a HU-35.

**Resultado obtenido:** QA confirmó el funcionamiento general de los indicadores de avance, pero no comunicó una ejecución diferenciada con un proyecto sin tareas.

**Evidencia:** No disponible.

**Defectos:** Ninguno confirmado.

### CP-AVA-02 — Cálculo de porcentaje de avance

**Prioridad:** Alta  
**Dataset:** DS-06  
**Estado:** Aprobado según QA, sin valores observados registrados

**Precondiciones:** Proyecto con tareas distribuidas en distintos estados.

**Procedimiento:**

1. Seleccionar un proyecto con tareas en diferentes estados.
2. Identificar la cantidad total de tareas.
3. Contar cuántas se encuentran completadas.
4. Calcular manualmente el porcentaje correspondiente.
5. Consultar el indicador de progreso del proyecto.
6. Comparar el porcentaje obtenido con el mostrado por Tasker.

**Resultado esperado:**

Avance (%) = (tareas completadas / total de tareas) × 100.

**Escenario cuantitativo previsto en HU-39:**

| Estado | Cantidad de tareas |
|---|---:|
| Por hacer | 1 |
| En progreso | 1 |
| Completada | 2 |
| Total | 4 |

**Porcentaje esperado:**

(2 / 4) × 100 = 50 %.

**Resultado obtenido:** QA informó que el cálculo de porcentaje de avance funciona correctamente. No se proporcionó el porcentaje concreto observado ni el número de tareas utilizado durante la ejecución.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

**Observación:** El valor de 50 % corresponde al escenario de referencia de HU-39. No se presenta como un resultado observado de la ejecución real.

### CP-AVA-03 — Actualización de progreso después de cambiar estados

**Prioridad:** Alta  
**Dataset:** DS-04, DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas existentes y operación autorizada de cambio de estado.

**Procedimiento:**

1. Consultar el porcentaje de avance de un proyecto.
2. Cambiar el estado de una tarea a Completada mediante una cuenta autorizada.
3. Regresar al indicador de progreso.
4. Comprobar que el porcentaje se actualice.
5. Revertir el estado mediante una operación permitida, si el sistema y la cuenta lo autorizan.
6. Verificar que el porcentaje vuelva a recalcularse.

**Resultado esperado:** El porcentaje aumenta o disminuye según el número de tareas completadas respecto al total.

**Escenario de referencia del Plan Maestro:**

- Estado inicial: 2 de 4 tareas completadas = 50 %.
- Después de completar otra tarea: 3 de 4 = 75 %.

**Resultado obtenido:** QA confirmó que los reportes y cálculos reflejan los cambios realizados en las tareas.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

**Observación:** Los valores 50 % y 75 % son valores de referencia. La ejecución real deberá registrar los números correspondientes si se requiere verificación cuantitativa reproducible.

### CP-REP-01 — Generación de reporte con tareas

**Prioridad:** Alta  
**Dataset:** DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas y datos disponibles para reporte.

**Procedimiento:**

1. Iniciar sesión con una cuenta autorizada.
2. Acceder al proyecto de prueba.
3. Abrir la funcionalidad de reportes.
4. Generar o visualizar el reporte correspondiente.
5. Comparar los datos mostrados con la información de las tareas.
6. Verificar los indicadores, recuentos y campos disponibles.

**Resultado esperado:** El reporte presenta información coherente con los registros accesibles del proyecto y los requisitos aprobados.

**Resultado obtenido:** QA informó que los reportes muestran correctamente la información de las tareas.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### CP-REP-02 — Impresión de reportes

**Prioridad:** Media  
**Dataset:** DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Reporte de proyecto disponible y opción de impresión habilitada.

**Procedimiento:**

1. Abrir el reporte de un proyecto.
2. Seleccionar la opción de impresión.
3. Comprobar que se abra el mecanismo de impresión correspondiente.
4. Revisar la presentación de los datos.
5. Verificar que el documento imprimible corresponda al proyecto seleccionado.

**Resultado esperado:** La aplicación genera una vista imprimible legible con la información del reporte.

**Resultado obtenido:** QA confirmó que la funcionalidad de impresión opera correctamente.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

**Observación:** La prueba funcional de impresión no requiere efectuar una impresión física, siempre que se haya verificado la vista previa o salida imprimible conforme a los criterios establecidos.

### CP-REP-03 — Reporte de proyecto sin tareas

**Prioridad:** Media  
**Dataset:** DS-00  
**Estado:** Pendiente de comprobación específica

**Precondiciones:** Proyecto de prueba sin tareas.

**Procedimiento previsto:**

1. Acceder a un proyecto vacío.
2. Abrir la sección de reportes.
3. Intentar generar o consultar el reporte.
4. Comprobar el tratamiento de la ausencia de tareas.
5. Verificar que no se presenten datos de otros proyectos.

**Resultado esperado:** La aplicación informa o representa adecuadamente la ausencia de tareas, sin fallos ni datos ajenos.

**Resultado obtenido:** QA confirmó el funcionamiento general de los reportes, pero no identificó una ejecución específica sobre un proyecto sin tareas.

**Evidencia:** No disponible.

**Defectos:** Ninguno confirmado.

### EXT-REP-01 — Recuento de tareas por estado

**Prioridad:** Alta, caso complementario  
**Dataset:** DS-04, DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas en diferentes estados.

**Procedimiento:**

1. Acceder a la sección de reportes del proyecto.
2. Identificar los indicadores de recuento por estado.
3. Consultar las tareas disponibles.
4. Comparar los recuentos presentados con la cantidad real de tareas en cada estado.
5. Comprobar la consistencia de los totales.

**Resultado esperado:** Los recuentos reflejan correctamente las tareas correspondientes a cada estado.

**Resultado obtenido:** QA confirmó que los recuentos por estado funcionan correctamente.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

### EXT-REP-02 — Identificación de tareas vencidas

**Prioridad:** Alta, caso complementario  
**Dataset:** DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas que contienen fechas de vencimiento.

**Procedimiento:**

1. Acceder al reporte del proyecto.
2. Identificar las tareas con fechas de vencimiento.
3. Comparar dichas fechas con la fecha utilizada para la ejecución.
4. Aplicar las reglas vigentes del sistema para determinar cuáles están vencidas.
5. Comprobar que el reporte identifica correctamente esas tareas.

**Resultado esperado:** El reporte identifica las tareas vencidas conforme a sus fechas y a las reglas de negocio aprobadas.

**Resultado obtenido:** QA informó que la identificación de tareas vencidas funciona correctamente.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

**Observación:** El documento no presupone que todas las tareas con fecha anterior a la actual se consideren vencidas; deben aplicarse las reglas correspondientes a cada estado.

### EXT-REP-03 — Consistencia de tablas y actualización de reportes

**Prioridad:** Alta, caso complementario  
**Dataset:** DS-04, DS-06  
**Estado:** Aprobado según QA

**Precondiciones:** Proyecto con tareas y reporte disponible.

**Procedimiento:**

1. Abrir el reporte del proyecto.
2. Revisar la tabla de tareas y sus columnas.
3. Comparar los datos mostrados con las tareas registradas.
4. Realizar un cambio autorizado en una tarea.
5. Actualizar el reporte.
6. Verificar que la tabla y los indicadores reflejen la modificación.
7. Comprobar que no existan diferencias entre los datos presentados y el estado actual de las tareas.

**Resultado esperado:** La información de la tabla y los indicadores se mantiene consistente con los registros actualizados.

**Resultado obtenido:** QA confirmó que los reportes reflejan correctamente los cambios realizados y que la información tabular funciona.

**Evidencia:** Resultado manual reportado; sin captura adjunta.

**Defectos:** No reportados.

## 5. Resumen de ejecución

### 5.1. Casos originales de HU-39

| Estado | Cantidad | Casos |
|---|---:|---|
| Aprobados según QA | 4 | CP-AVA-02, CP-AVA-03, CP-REP-01, CP-REP-02 |
| Pendientes de comprobación específica | 2 | CP-AVA-01, CP-REP-03 |
| Fallidos confirmados | 0 | Ninguno |
| Total | 6 | — |

La aprobación reportada de los cálculos no incluye valores numéricos observados en este registro. Estos deberán agregarse si el equipo requiere comprobar la exactitud cuantitativa de manera independiente.

### 5.2. Casos complementarios

| Caso | Estado |
|---|---|
| EXT-REP-01 — Recuento por estado | Aprobado según QA |
| EXT-REP-02 — Tareas vencidas | Aprobado según QA |
| EXT-REP-03 — Tablas y actualización del reporte | Aprobado según QA |

### 5.3. Criterios de aceptación de HU-44

| Criterio | Resultado |
|---|---|
| Porcentaje de avance | Satisfactorio según QA |
| Recuento por estado | Satisfactorio según QA |
| Identificación de tareas vencidas | Satisfactorio según QA |
| Información de la tabla | Satisfactoria según QA |
| Impresión | Satisfactoria según QA |
| Actualización de reportes tras cambios | Satisfactoria según QA |

Las seis funcionalidades de los criterios de aceptación fueron reportadas como operativas.

Permanecen pendientes dos comprobaciones específicas del Plan Maestro relacionadas con proyectos vacíos.

## 6. Registro de defectos

No se reportaron defectos funcionales confirmados durante las pruebas de reportes y progreso.

Los escenarios sin ejecución específica documentada no se contabilizan como fallidos.

No se crean identificadores ficticios de incidencias en Jira.

## 7. Evidencia y reproducibilidad

Por decisión de QA, no se adjuntarán capturas de pantalla ni grabaciones a esta historia.

El respaldo disponible consiste en el registro escrito de las pruebas manuales y los resultados comunicados.

Cada ficha contiene identificación, precondiciones, procedimiento, resultado esperado, resultado reportado y estado.

No se dispone de capturas, archivos generados durante la impresión, valores numéricos observados ni registros automáticos de ejecución.

Para facilitar la revisión, deben completarse cuando estén disponibles la fecha real de prueba, el commit del frontend, el navegador y los datos utilizados en los cálculos.

## 8. Dependencias y verificaciones pendientes

1. Confirmar el avance de 0 % en un proyecto sin tareas mediante CP-AVA-01.
2. Comprobar CP-REP-03 con un proyecto vacío.
3. Registrar los valores observados durante el cálculo de porcentaje de avance de CP-AVA-02.
4. Documentar un escenario cuantitativo de actualización del avance para CP-AVA-03.
5. Registrar las reglas utilizadas para identificar tareas vencidas.
6. Comprobar la vista de impresión con la información correspondiente al proyecto.
7. Registrar fecha, navegador, rama y commit de la versión probada.
8. Actualizar el informe cuando se realicen pruebas adicionales o se detecten defectos.

## 9. Estado de HU-44

**Estado:** funcionalidades reportadas como correctas, con verificaciones específicas pendientes de documentación.

QA informó que los cálculos de avance, los recuentos por estado, la identificación de tareas vencidas, la información tabular, la impresión y la actualización de reportes funcionan correctamente.

No se reportaron defectos funcionales confirmados.

La ejecución se documenta sin capturas de pantalla y se distingue entre resultados funcionales comunicados y comprobaciones cuantitativas que no cuentan con valores registrados.

Para considerar aprobados todos los casos originales del Plan Maestro deberán completarse las comprobaciones sobre proyectos vacíos y documentarse los datos exigidos durante la revisión, o registrar una decisión formal sobre el alcance de esas pruebas.
