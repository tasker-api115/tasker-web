# TASKER

## PLAN MAESTRO DE PRUEBAS

**Historia:** HU-39 — Elaborar Plan de Pruebas  
**Proyecto:** Sistema de gestión de proyectos y tareas académicas  
**Asignatura:** Administración de Proyectos Informáticos (API115), Universidad de El Salvador  
**Versión del plan:** 1.0  
**Fecha de elaboración:** 5 de noviembre de 2026  
**Periodo estimado de elaboración:** 4–5 de noviembre de 2026  
**Responsable:** QA  
**Estado del plan:** Propuesta para revisión y aprobación  
**Periodo del sprint:** 3–17 de noviembre de 2026

> **Control de alcance:** Este documento define cómo se probará Tasker; no constituye un informe de ejecución ni acredita pruebas, aprobaciones o difusión ya realizadas. Los criterios de aceptación vigentes en Jira prevalecen sobre los escenarios preliminares aquí propuestos.

---

## Control del documento

| Elemento | Definición |
|---|---|
| Código | QA-PLAN-HU39 |
| Versión | 1.0 |
| Autoría / preparación | Rol QA |
| Revisión técnica | Líder de desarrollo y responsables de frontend/backend |
| Revisión del proceso | Scrum Master |
| Validación del alcance funcional | Product Owner, según corresponda |
| Registro y seguimiento | Jira; cambios mediante GitHub Pull Request |
| Estado de aprobación | Pendiente de revisión por el equipo |

### Historial de versiones

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| 1.0 | 05/11/2026 | Plan inicial basado en `README.md`, `AGENTS.md` y las referencias de plan de pruebas; incorpora estrategia de datos para HU-53. | Propuesta |

### Aprobaciones y comunicación

| Rol | Acción requerida | Evidencia prevista | Estado |
|---|---|---|---|
| QA | Publicar la versión del plan y vincularla a HU-39. | Archivo versionado y enlace del PR/Jira. | Pendiente |
| Líder de desarrollo / backend / frontend | Revisar viabilidad técnica, casos y entornos. | Comentarios o aprobación en PR. | Pendiente |
| Scrum Master | Confirmar que el plan se comunicó al equipo. | Comentario o registro en Jira. | Pendiente |
| Product Owner | Confirmar que la cobertura corresponde al backlog vigente cuando proceda. | Validación o comentarios en Jira. | Pendiente |

---

# 1. Introducción

Tasker es una aplicación web para organizar proyectos y tareas académicas. Está dirigida a estudiantes universitarios que deben coordinar integrantes, responsables, actividades, fechas de entrega y avances. El producto prevé un frontend en Angular y TypeScript, servicios de Supabase, autenticación mediante Supabase Auth y persistencia en PostgreSQL.

La finalidad del documento es establecer alcance, técnicas, escenarios, condiciones de inicio y cierre, datos, evidencias, responsabilidades, tratamiento de defectos y criterios de aceptación de la validación QA. Su estructura combina los elementos de los dos planes de prueba de referencia, adaptados al contexto técnico de Tasker.

## 1.1. Objetivo general

Definir una estrategia reproducible de pruebas para verificar que las funcionalidades y controles técnicos de Tasker cumplen las historias de usuario aprobadas, sin introducir regresiones ni vulnerar las restricciones de acceso a los datos.

## 1.2. Objetivos específicos

1. Identificar los módulos y componentes sujetos a validación.
2. Determinar niveles, tipos, prioridades y secuencia de pruebas.
3. Formular escenarios positivos, negativos, de borde e integración, vinculables con los criterios de aceptación de Jira.
4. Establecer condiciones verificables de entrada, suspensión, reanudación y salida.
5. Definir conjuntos de datos ficticios, segregación de entornos y procedimientos de reinicio en coordinación con HU-53.
6. Establecer evidencias, métricas, comunicación de hallazgos y mecanismo de aprobación de resultados.


# 2. Alcance de las pruebas

## 2.1. Módulos y componentes incluidos

| Código | Módulo o componente | Funciones previstas a verificar | Prioridad inicial |
|---|---|---|---|
| MOD-01 | Autenticación y sesión | Registro, inicio y cierre de sesión, acceso a rutas y respuestas de error. | Alta |
| MOD-02 | Proyectos | Crear, consultar, modificar y administrar proyectos académicos. | Alta |
| MOD-03 | Integrantes y permisos | Gestión de integrantes, pertenencia a proyectos y restricciones de acceso. | Alta |
| MOD-04 | Tareas y asignaciones | Crear, consultar, editar, eliminar, asignar responsables y actualizar estados. | Crítica |
| MOD-05 | Tablero Kanban | Visualización por estado y movimiento drag and drop. | Crítica |
| MOD-06 | Cronograma | Visualización y seguimiento de fechas de las actividades. | Media |
| MOD-07 | Avance de proyectos | Cálculo y actualización del progreso. | Alta |
| MOD-08 | Reportes | Generación, consulta e impresión de reportes. | Media |
| MOD-09 | Interfaz y experiencia | Formularios, mensajes, estados de carga/error/vacío, navegación y compatibilidad web. | Media |
| MOD-10 | Integración, base de datos y seguridad | Angular–Supabase–PostgreSQL; migraciones, RLS y persistencia. | Crítica |
| MOD-11 | Construcción y promoción de versión | Compilación y comprobaciones de la versión candidata en `testing`. | Alta |

La prioridad es una **propuesta de QA** y no reemplaza la prioridad de Jira. La cobertura definitiva depende de las funcionalidades efectivamente comprometidas en el sprint.

## 2.2. Fuera de alcance, salvo cambio aprobado

- Aplicaciones móviles nativas: el alcance documentado corresponde a una aplicación web.
- Integraciones de pago, almacenamiento de audio o módulos que aparecen solamente en los ejemplos PDF y no forman parte de Tasker.
- Pruebas con información personal real o sobre la base de datos de producción.
- Pruebas de penetración exhaustivas, auditorías externas, cargas masivas o mediciones de rendimiento con umbrales no especificados en Jira.
- Comportamientos no descritos en las historias aprobadas; pueden estudiarse de forma exploratoria, pero no presentarse como requisitos obligatorios.

## 2.3. Supuestos y dependencias por confirmar

| ID | Supuesto o dependencia | Tratamiento de QA |
|---|---|---|
| SD-01 | Las historias vigentes y sus criterios de aceptación se consultarán en Jira. | Registrar clave real de cada historia antes de pasar el caso a “Listo para ejecutar”. |
| SD-02 | Existirá una versión desplegable de Angular conectada a un proyecto Supabase aislado para QA. | Si no existe, mantener los casos dependientes como “Bloqueado”; no ejecutar en producción. |
| SD-03 | Las migraciones y las políticas RLS serán entregadas mediante cambios versionados. | Revisar esquema y permisos contra la versión candidata. |
| SD-04 | HU-53 implementará o documentará el provisionamiento y reinicio de datos de QA. | Usar esta estrategia como contrato; confirmar scripts, responsables y orden real antes de ejecutar. |
| SD-05 | Los límites de campos, política de contraseñas, reglas de eliminación y fórmulas de progreso se determinarán con Jira/configuración aprobada. | No fijar valores ni expectativas sin respaldo; marcar escenario condicionado. |

# 3. Estrategia de pruebas

## 3.1. Niveles y tipos

| Tipo / nivel | Propósito y técnica | Responsable de ejecución | Evidencia principal |
|---|---|---|---|
| Revisión estática | Contrastar historia, interfaz, PR, esquema y políticas con criterios aprobados. | QA + revisor técnico | Lista de comprobación y comentarios de PR. |
| Unitarias | Verificar funciones y lógica aislada, cuando existan pruebas automatizadas. | Desarrollo | Salida de pruebas y commit. |
| Integración | Verificar intercambio Angular–Supabase, autenticación, permisos y persistencia. | QA + backend | Solicitudes/respuestas sanitizadas y registros. |
| Funcionales | Ejecutar rutas normales, negativas y límites de cada módulo. | QA | Casos con resultado esperado/obtenido. |
| Seguridad de autorización | Comprobar RLS tanto en interfaz como en acceso directo a datos con credenciales de usuario común. | QA + backend | Pruebas permitidas/denegadas, sin secretos. |
| Interfaz y usabilidad básica | Revisar formularios, errores, mensajes, vacío, navegación y consistencia. | QA + frontend / UX/UI | Capturas o video breve. |
| Compatibilidad web | Repetir flujos clave en los navegadores que el equipo declare compatibles. | QA | Matriz de navegador, versión y resultado. |
| Humo (*smoke*) | Confirmar rápidamente que la versión candidata permite autenticarse y completar un flujo central. | QA | Lista de chequeo por build. |
| Regresión y reprueba | Repetir casos impactados por una corrección y confirmar desaparición del defecto. | QA | Evidencia antes/después y vínculo Jira. |
| Verificación técnica | Comprobar compilación, migraciones versionadas y configuración segura. | Desarrollo + QA | Comandos y resultados verificables. |

**Automatización:** no se presupone una herramienta ni una suite implementada. Los flujos repetitivos podrán automatizarse tras comprobar los comandos existentes en `package.json` y acordar su mantenimiento. Hasta entonces, QA llevará registro reproducible de la ejecución manual.

## 3.2. Técnicas de diseño

Se aplicarán partición de equivalencia, valores límite determinados por requisitos, transición de estados, matriz de permisos y recorridos de extremo a extremo. Para permisos se probará tanto un actor permitido como uno denegado; para formularios, datos válidos, inválidos y faltantes. Los valores límite exactos se completarán únicamente después de conocer sus restricciones aprobadas.

## 3.3. Orden y ciclos de ejecución

1. **Preparación:** revisar historias, seleccionar casos aplicables y confirmar el build/entorno/datasets.
2. **Humo:** verificar inicio de sesión, acceso autorizado y operación central disponible.
3. **Módulos independientes:** autenticación → proyectos → integrantes → tareas.
4. **Flujos integrados:** Kanban → cronograma → avance → reportes.
5. **Controles transversales:** RLS, errores, compatibilidad y verificaciones técnicas.
6. **Defectos y regresión:** volver a probar tras cada corrección promovida a `testing`.
7. **Cierre:** consolidar trazabilidad, métricas, defectos y recomendación de QA para la versión candidata.

# 4. Entorno, herramientas y recursos

## 4.1. Configuración objetivo

| Elemento | Configuración / restricción |
|---|---|
| Código bajo prueba | Commit concreto de la rama `testing`, identificado por hash y fecha. |
| Cliente web | Angular + TypeScript, con versión registrada al momento de ejecutar. |
| Servicios | Proyecto Supabase **exclusivo de pruebas**; no reutilizar base productiva. |
| Datos | PostgreSQL con migraciones revisadas y datos ficticios de HU-53. |
| Identidades | Cuentas de prueba con permisos diferenciados; sin credenciales reales en evidencias. |
| Navegadores | Al menos Chrome/Chromium y Firefox en las versiones disponibles y registradas. Otros navegadores solo si Jira o el equipo los incorpora. |
| Resoluciones | Escritorio y pantalla estrecha como exploración de interfaz; exigibilidad según diseños/requisitos aprobados. |
| Seguimiento | Jira para casos, defectos, impedimentos y decisiones; GitHub para cambios y PR. |
| Evidencias | Capturas, resultados de comandos, registros y referencias a PR/commit, con datos sensibles ocultos. |


## 4.2. Lista mínima de verificación del ambiente

- La rama y el commit corresponden a la compilación que se probará.
- La aplicación compila con `npm ci` y `npm run build` en `frontend/`, cuando esta carpeta ya exista.
- La URL del servicio apunta al entorno de QA y no a producción.
- Las migraciones están versionadas y las tablas expuestas tienen políticas RLS revisadas.
- Los usuarios y proyectos de prueba se han aprovisionado con identidades aisladas.
- El dataset posee una versión identificable y el procedimiento de reinicio está probado.
- El equipo tiene acceso a criterios de aceptación actuales y canal de reporte de defectos.

# 5. Estrategia de datos de prueba — coordinación con HU-53

## 5.1. Principios

Los datos de prueba se crearán exclusivamente para QA, serán ficticios, identificables, repetibles y distintos de los datos semilla de desarrollo previstos en HU-52. El dataset y su versión deben asociarse a cada ciclo de pruebas; su creación y limpieza no deben alterar otros entornos ni borrar información de miembros reales del equipo.

## 5.2. Catálogo lógico de datasets

| Dataset | Contenido previsto | Escenarios principales |
|---|---|---|
| **DS-00 — Vacío** | Entorno con esquema vigente y sin proyectos/tareas de la campaña; cuentas mínimas de acceso. | Estados vacíos, primer proyecto y ausencia de reportes. |
| **DS-01 — Identidades** | Usuario propietario A, integrante asignado B, integrante no asignado C, externo D y propietario de otro proyecto E; identidades con acceso controlado. | Registro, inicio de sesión, cierre y autorización. |
| **DS-02 — Proyectos** | Proyecto académico A con integrantes, proyecto B de otro propietario y proyecto C sin tareas. | Gestión, aislamiento y listados. |
| **DS-03 — Membresías** | A contiene B y C; D no pertenece a A; E pertenece solo a B; relación de asignación explícita. | Gestión de integrantes y acceso. |
| **DS-04 — Tareas y Kanban** | Tareas de A distribuidas entre `Por hacer`, `En progreso` y `Completada`, con asignados distintos. | CRUD de tareas, estados y drag and drop. |
| **DS-05 — Bordes y validación** | Valores ausentes, formatos inválidos, cadenas largas conforme al límite real, fechas de borde y duplicados. | Negativos y validaciones; valores finales sujetos a Jira. |
| **DS-06 — Cronograma y avance** | Tareas con fechas distintas y combinaciones controladas de estado; proyecto vacío. | Orden, progreso, reportes e impresión. |
| **DS-07 — Fallos controlados** | Sesiones caducadas o no válidas y entorno de prueba donde pueda simularse fallo de red o de actualización. | Errores y restauración de estado en Kanban. |
| **DS-08 — Migraciones** | Esquema limpio y conjunto de comprobación de restricciones/políticas antes de cargar datos. | Instalación técnica y consistencia de BD. |

**Identificadores de ejemplo:** `qa_owner_a`, `qa_member_b`, `qa_member_c`, `qa_outside_d`, `qa_owner_e`; `qa_project_a`, `qa_project_b`, `qa_project_empty`. Son etiquetas lógicas, **no** identificadores ni usuarios existentes en Supabase. Las contraseñas se administrarán por un mecanismo seguro fuera del repositorio.

## 5.3. Relación dataset–entorno–uso

| Tipo de entorno | Uso permitido | Fuente de datos | Regla de reinicio |
|---|---|---|---|
| Desarrollo local | Implementación y comprobaciones del desarrollador. | Semillas HU-52 u otras muestras locales. | A cargo de desarrollo; separado del ciclo QA. |
| QA / `testing` | Ejecución formal, reproducciones y regresión. | DS-00 a DS-08 definidos con HU-53. | Controlado, registrado y coordinado por QA/backend. |
| Producción o entorno con datos reales | Ninguno dentro de este plan. | No aplica. | Prohibido limpiar o cargar datasets de QA. |

## 5.4. Procedimiento de reinicio seguro

1. Identificar el **entorno**, proyecto Supabase, commit de `testing`, versión del esquema y dataset que se restaurará. Obtener confirmación de que no es producción.
2. Cerrar ejecuciones simultáneas; guardar identificadores de fallos pendientes, capturas y versión de los datos para preservar reproducibilidad.
3. Usar el mecanismo de limpieza **aprobado en HU-53**, limitado a entidades y cuentas de QA; las operaciones sobre Supabase Auth requerirán un administrador autorizado y no se realizarán mediante el cliente web.
4. Restaurar, en un entorno desechable o siguiendo el procedimiento acordado, las migraciones versionadas que correspondan al commit. No borrar tablas ni aplicar `TRUNCATE` indiscriminadamente en una base compartida.
5. Cargar el dataset de QA desde scripts/fixtures versionados por HU-53, con orden y dependencias documentados. No reutilizar `seed.sql` de HU-52 como sustituto sin un acuerdo explícito.
6. Verificar cuentas, proyectos, relaciones, estados de tareas, fechas y aislamiento entre usuarios. Comprobar que las políticas RLS siguen activas.
7. Registrar **fecha, responsable, entorno, commit, versión del dataset, resultado del reinicio e incidencias** antes de autorizar la nueva campaña.

**Entregables técnicos pendientes de HU-53:** rutas reales de scripts, instrucciones de ejecución, mecanismo de creación/eliminación de usuarios de prueba, cantidades esperadas por tabla y procedimiento de reversión. Este plan establece los requisitos de dichos entregables, pero no afirma que ya estén implementados.

# 6. Criterios de entrada, suspensión y salida

## 6.1. Criterios de entrada

Una campaña o conjunto de casos se puede iniciar cuando: (a) los criterios de aceptación correspondientes están disponibles en Jira; (b) el módulo está implementado en el commit identificado; (c) la versión ha sido promovida a `testing` mediante PR; (d) el ambiente responde y la compilación requerida es satisfactoria; (e) el dataset y sus permisos están listos; y (f) hay una persona encargada de registrar resultados y defectos.

La falta de una funcionalidad planificada **no se registra como prueba fallida si todavía no forma parte del build**: se clasifica como **No ejecutable / Bloqueado por implementación**, con referencia a su historia.

## 6.2. Criterios de suspensión y reanudación

Se suspenden los casos afectados si existe un defecto bloqueante que impide continuar, una falla generalizada del entorno, una sospecha de uso de datos productivos, ausencia de criterios de aceptación o inconsistencias graves del dataset. Se reanudan cuando el responsable confirma la corrección o aislamiento del problema, se registra la nueva versión y se ejecuta una prueba de humo satisfactoria.

## 6.3. Criterios de salida de una versión candidata

Los siguientes umbrales son una **propuesta operativa de QA**, sujeta a aprobación del equipo; no son requisitos extraídos de Jira:

| Indicador / condición | Umbral propuesto |
|---|---|
| Cobertura de criterios aprobados y comprometidos en el build | 100 % con al menos un caso asociado y estado trazable. |
| Ejecución de casos de prioridad crítica y alta aplicables | 100 % ejecutados. |
| Aprobación de casos de prioridad crítica | 100 % aprobados. |
| Aprobación global de casos ejecutados aplicables | Al menos 95 %; fallos restantes evaluados y aceptados formalmente si son menores. |
| Defectos abiertos de severidad bloqueante o crítica | 0. |
| Defectos abiertos de severidad alta | 0, salvo decisión explícita y documentada del Product Owner y QA que no comprometa seguridad ni flujos esenciales. |
| Pruebas de autorización RLS de acceso denegado | 100 % aprobadas para los recursos expuestos incluidos en el alcance. |
| Evidencia y trazabilidad | Cada caso ejecutado tiene resultado, versión y evidencia o referencia verificable. |
| Revisión de cierre | Informe QA y decisión registrada antes de promover el mismo conjunto de cambios a `main`. |

**Fórmulas:** tasa de ejecución = casos ejecutados / casos aplicables × 100; tasa de aprobación = casos aprobados / casos ejecutados × 100; cobertura de aceptación = criterios comprometidos con caso trazado / criterios comprometidos × 100. Un caso bloqueado o no aplicable no se contará como aprobado. Los casos excluidos deben tener justificación y autorización visibles.

# 7. Escenarios y casos de prueba planificados

## 7.1. Convenciones

Los casos llevan identificadores `CP-<módulo>-NN`, prioridad **C** (crítica), **A** (alta) o **M** (media), y un dataset de referencia. El resultado esperado debe concretarse con el criterio vigente de Jira **antes de su ejecución**. Los siguientes escenarios son diseños de prueba, no resultados obtenidos.

### 7.2. Autenticación y sesión — MOD-01

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-AUT-01 | Registrar una cuenta con datos válidos. | Se aplica el flujo de registro aprobado; se respeta la confirmación de correo solo si está configurada. | DS-01 | A |
| CP-AUT-02 | Intentar registro con datos inválidos o una cuenta duplicada. | El sistema rechaza la operación con mensaje apropiado, sin filtrar información sensible. | DS-05 | A |
| CP-AUT-03 | Autenticarse con una cuenta habilitada. | Se establece sesión y se permite entrar a recursos autorizados. | DS-01 | C |
| CP-AUT-04 | Intentar autenticarse con credenciales incorrectas. | No se abre sesión; se muestra error controlado. | DS-01 | A |
| CP-AUT-05 | Cerrar sesión y volver a una ruta protegida. | La aplicación no conserva una sesión activa y exige autenticación para la navegación protegida. | DS-01 | A |

### 7.3. Gestión de proyectos — MOD-02

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-PRO-01 | Crear un proyecto con datos válidos. | Aparece el proyecto y persiste después de recargar. | DS-00, DS-01 | A |
| CP-PRO-02 | Consultar la lista y detalle del proyecto A. | Se muestran los proyectos visibles para la identidad usada y sus datos correctos. | DS-02 | A |
| CP-PRO-03 | Modificar un proyecto con un usuario autorizado. | Los cambios se guardan y se reflejan según el criterio de Jira. | DS-02 | A |
| CP-PRO-04 | Intentar eliminar un proyecto, **si Jira contempla esa operación**. | Se aplica confirmación, restricción y efecto definidos en la historia aprobada. | DS-02 | M |
| CP-PRO-05 | Consultar proyecto B desde un usuario ajeno. | No se exponen datos no autorizados, en interfaz ni API. | DS-02, DS-03 | C |

### 7.4. Integrantes y pertenencia — MOD-03

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-INT-01 | Incorporar integrante a proyecto A mediante el flujo aprobado. | Se guarda la membresía y se aplica el permiso previsto en Jira. | DS-01, DS-03 | A |
| CP-INT-02 | Asignar una tarea a un integrante permitido. | El vínculo tarea–responsable persiste y se muestra correctamente. | DS-03, DS-04 | A |
| CP-INT-03 | Retirar integrante, **solo si la historia contempla esta acción**. | El resultado y los permisos posteriores concuerdan con el criterio aprobado. | DS-03 | M |
| CP-INT-04 | Intentar administrar integrantes desde cuenta no autorizada. | Se deniega la operación en interfaz y base de datos. | DS-03 | C |

### 7.5. Tareas y estados — MOD-04

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-TAR-01 | Crear una tarea con datos válidos. | La tarea se guarda, aparece en el proyecto y conserva sus campos tras recargar. | DS-02, DS-04 | A |
| CP-TAR-02 | Enviar formulario con campos inválidos o vacíos. | La operación se bloquea según validaciones aprobadas y no crea un registro incorrecto. | DS-05 | A |
| CP-TAR-03 | Editar tarea con identidad autorizada. | Se actualizan únicamente los campos permitidos y los datos persisten. | DS-04 | A |
| CP-TAR-04 | Eliminar tarea por flujo autorizado. | El efecto y cualquier confirmación cumplen la historia vigente. | DS-04 | M |
| CP-TAR-05 | Cambiar responsable de una tarea por actor permitido. | Se registra la asignación y su nueva visibilidad o permisos correspondientes. | DS-03, DS-04 | A |
| CP-TAR-06 | El integrante **asignado** cambia estado: `Por hacer` → `En progreso` → `Completada`. | Todos los cambios permitidos persisten y se reflejan; el asignado puede cambiar el estado. | DS-04 | C |
| CP-TAR-07 | Integrante **no asignado**, aunque pertenezca al proyecto, intenta cambiar estado. | Se rechaza el cambio tanto desde la interfaz como mediante acceso directo a datos; no se altera el estado. | DS-03, DS-04 | C |

### 7.6. Tablero Kanban — MOD-05

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-KAN-01 | Abrir tablero con tareas en los tres estados. | Las tarjetas aparecen en `Por hacer`, `En progreso` o `Completada` según su estado real. | DS-04 | A |
| CP-KAN-02 | Integrante asignado mueve su tarea por drag and drop. | Se aplica la misma regla de autorización que en edición de estado y se persiste el cambio. | DS-04 | C |
| CP-KAN-03 | Integrante no asignado intenta arrastrar una tarea. | No se modifica su estado; se impide una escritura no autorizada. | DS-03, DS-04 | C |
| CP-KAN-04 | Simular error de actualización durante un arrastre. | Se informa el error y la tarjeta vuelve a su estado anterior. | DS-07 | C |
| CP-KAN-05 | Recargar tras mover válidamente una tarjeta. | La tarjeta queda en la columna que corresponde al estado persistido. | DS-04 | A |

### 7.7. Cronograma — MOD-06

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-CRO-01 | Abrir cronograma con tareas fechadas. | Se presentan las fechas y tareas correctas según vista y reglas aprobadas. | DS-06 | A |
| CP-CRO-02 | Modificar una fecha de tarea y consultar cronograma. | La vista refleja la fecha persistida sin divergencias. | DS-06 | A |
| CP-CRO-03 | Comprobar orden/agrupación de actividades en fechas diferentes. | Se respeta el comportamiento definido en el diseño o historia vigente. | DS-06 | M |
| CP-CRO-04 | Introducir fecha inválida o combinación límite. | Se aplica la regla que defina Jira; no se asignan límites no documentados. | DS-05 | M |

### 7.8. Avance de proyectos — MOD-07

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-AVA-01 | Consultar progreso de proyecto sin tareas. | Se presenta el estado vacío o valor definido por el criterio aprobado, sin errores. | DS-00, DS-02 | A |
| CP-AVA-02 | Consultar un proyecto con tareas en distintos estados. | El indicador coincide con la **fórmula oficial definida por Jira**, pendiente de obtener. | DS-06 | A |
| CP-AVA-03 | Completar/revertir tarea mediante acción autorizada y consultar avance. | El progreso se actualiza a partir de los datos persistidos y la regla oficial. | DS-04, DS-06 | A |

### 7.9. Reportes e impresión — MOD-08

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-REP-01 | Generar reporte de un proyecto con tareas. | Los campos y agregados coinciden con registros accesibles y requisitos aprobados. | DS-06 | A |
| CP-REP-02 | Usar opción de impresión de un reporte. | Se genera una vista imprimible legible, con información correspondiente al proyecto. | DS-06 | M |
| CP-REP-03 | Generar reporte cuando no hay tareas. | Se comunica ausencia de datos sin fallar ni incluir datos de otros proyectos. | DS-00 | M |

### 7.10. Seguridad, interfaz y verificaciones técnicas — MOD-09 a MOD-11

| ID | Escenario / pasos principales | Resultado esperado verificable | Datos | Prioridad |
|---|---|---|---|---|
| CP-SEG-01 | Consultar directamente por API registros de un proyecto ajeno con credenciales de un usuario común. | Las políticas RLS impiden recuperar filas no autorizadas. | DS-01 a DS-03 | C |
| CP-SEG-02 | Intentar modificar por API una tarea o proyecto ajeno. | Se deniega la modificación; los registros permanecen intactos. | DS-03, DS-04 | C |
| CP-SEG-03 | Comprobar existencia y efecto de RLS en tablas expuestas. | Los accesos permitidos y denegados coinciden con reglas de propietario, integrante y asignado. | DS-03, DS-08 | C |
| CP-SEG-04 | Cambiar metadatos editables del usuario para intentar elevar privilegios. | No se obtienen permisos extra; la autorización se decide en PostgreSQL. | DS-01, DS-03 | C |
| CP-SEG-05 | Inspeccionar frontend, registros y repositorio de la versión. | No se publican contraseñas, `service_role`, tokens privados ni `.env` con secretos. | DS-08 | C |
| CP-TEC-01 | Ejecutar instalación y compilación del frontend. | `npm ci` y `npm run build` concluyen correctamente, cuando existan scripts y aplicación. | DS-08 | A |
| CP-TEC-02 | Aplicar migraciones del commit a una base limpia y aprovisionar pruebas. | Esquema, restricciones y políticas se crean sin pasos manuales no registrados. | DS-08 | A |
| CP-TEC-03 | Verificar cargas, errores de red y vistas sin datos. | Se muestran estados de carga, error y vacío cuando corresponda. | DS-00, DS-07 | M |
| CP-TEC-04 | Realizar humo sobre la versión exacta promovida a `testing`. | Los flujos principales disponibles funcionan sin bloqueos; el commit queda registrado. | DS-01, DS-02, DS-04 | A |

**Total inicial de escenarios:** **45**. Este inventario se ajustará a la disponibilidad real y al backlog aprobado; no representa 45 casos ejecutados ni 45 casos aprobados. Los casos condicionados por una regla no entregada o una funcionalidad no incorporada se mantendrán pendientes con motivo documentado.

# 8. Casos prioritarios desarrollados

## 8.1. CP-TAR-07 — Restricción de cambio de estado

**Precondiciones:** proyecto A con tarea asignada a B; C pertenece al proyecto, pero no está asignado a esa tarea; ambos poseen cuentas de QA. **Datos:** DS-01, DS-03, DS-04. **Tipo:** funcional, integración, seguridad. **Prioridad:** crítica.

1. Ingresar como B y cambiar el estado de su tarea; comprobar en UI y después de recargar que el cambio se guardó.
2. Ingresar como C, ubicar la misma tarea e intentar cambiar el estado desde los controles disponibles.
3. Ejecutar el intento equivalente mediante acceso permitido a la API con el token **de C**, sin credenciales privilegiadas.
4. Volver a consultar la tarea como B y verificar su estado almacenado.

**Resultado esperado:** B puede modificar su tarea; C no puede alterarla por UI ni por API; no existe cambio persistido ni elevación de permisos. **Fundamento:** reglas expresas de HU-31 y HU-33 descritas en `AGENTS.md`.

## 8.2. CP-KAN-04 — Reversión ante fallo de drag and drop

**Precondiciones:** B es el asignado y la tarjeta está en `Por hacer`. **Datos:** DS-04 y DS-07. **Prioridad:** crítica.

1. Registrar la columna y el estado de origen.
2. Simular en QA una falla de red o rechazo de escritura durante el movimiento a `En progreso`.
3. Observar mensaje de fallo y posición de la tarjeta.
4. Restablecer conexión y volver a consultar el estado persistido.

**Resultado esperado:** se informa el error y la tarjeta vuelve a `Por hacer`; la base de datos no guarda un cambio fallido. **Fundamento:** regla explícita de `AGENTS.md`.

## 8.3. CP-SEG-01 / CP-SEG-02 — Aislamiento entre proyectos

**Precondiciones:** A y B son proyectos de propietarios distintos; D es un usuario ajeno al proyecto A. **Datos:** DS-01, DS-02, DS-03. **Prioridad:** crítica.

1. Autenticarse como D y consultar la interfaz de proyectos.
2. Solicitar desde el cliente no privilegiado los registros asociados a A.
3. Intentar insertar, actualizar o eliminar información del proyecto A según operaciones expuestas.
4. Consultar de nuevo como usuario autorizado y verificar integridad de registros.

**Resultado esperado:** ningún dato restringido se muestra ni se modifica por D; el resultado se verifica con políticas RLS y datos persistidos, no solamente ocultando botones.

## 8.4. CP-AVA-02 — Verificación cuantitativa del avance

**Precondiciones:** existe un proyecto de QA con estados conocidos y se obtuvo de Jira la fórmula oficial de progreso. **Datos:** DS-06. **Prioridad:** alta.

1. Registrar las tareas y estados iniciales.
2. Calcular manualmente el valor esperado **usando la fórmula aprobada**.
3. Consultar el indicador mostrado por Tasker.
4. Actualizar una tarea autorizada y repetir la comparación.

**Resultado esperado:** coincidencia entre indicador y valor calculado bajo la regla aprobada. **Pendiente:** especificación de fórmula, redondeo y tratamiento de tareas sin completar; no se asumirán porcentajes a partir de criterios no entregados.

# 9. Trazabilidad con los requisitos

La matriz siguiente indica el origen conocido y el conjunto de escenarios que deberá asociarse con la clave real de Jira. **No sustituye una matriz completa criterio–caso:** esa vinculación se cierra al revisar el backlog vigente.

| Requisito o fuente | Comportamiento a verificar | Casos asociados | Estado de vinculación |
|---|---|---|---|
| `README.md`: registro y sesión | Registro, acceso y cierre. | CP-AUT-01 a 05 | Falta identificar historias Jira aplicables. |
| `README.md`: proyectos | Alta, consulta y administración. | CP-PRO-01 a 05 | Falta identificar historias Jira aplicables. |
| `README.md`: integrantes y asignaciones | Membresías y responsables. | CP-INT-01 a 04; CP-TAR-05 | Falta identificar historias Jira aplicables. |
| `README.md`: tareas | Crear, consultar, editar, eliminar. | CP-TAR-01 a 05 | Falta identificar historias Jira aplicables. |
| `AGENTS.md`: HU-31 y HU-33 | Solo el asignado cambia estado, incluso drag and drop. | CP-TAR-06, 07; CP-KAN-02 a 04 | Referencia explícita; verificar textos vigentes en Jira. |
| `README.md`: Kanban | Estados y persistencia visual. | CP-KAN-01 a 05 | Falta identificar historia Jira. |
| `README.md`: cronograma | Consulta y sincronización de fechas. | CP-CRO-01 a 04 | Falta identificar historia Jira y reglas de fecha. |
| `README.md`: progreso y reportes | Avance, generación e impresión. | CP-AVA-01 a 03; CP-REP-01 a 03 | Falta fórmula y criterios vigentes. |
| `AGENTS.md`: Supabase/RLS | Autorización efectiva y secretos protegidos. | CP-SEG-01 a 05 | Verificar políticas concretas y roles aprobados. |
| `AGENTS.md`: compilación, migraciones y validación QA | Build, despliegue, datos y versión. | CP-TEC-01 a 04 | Validar scripts al estar disponibles. |
| HU-53 | Datasets, reinicio y entornos de QA. | Todos los casos con DS-00 a DS-08 | Coordinación e implementación pendientes. |


# 10. Ejecución, defectos y evidencias

## 10.1. Registro de cada ejecución

Cada registro de caso contendrá: ID del caso; clave de Jira; versión del procedimiento; fecha/hora; ejecutor; entorno y proyecto Supabase de QA; hash de commit; navegador/versión; dataset y versión; precondiciones; pasos realizados; resultado esperado; resultado observado; estado; evidencia; incidencia relacionada y notas del reinicio. Los estados permitidos para seguimiento son **Pendiente, Bloqueado, En ejecución, Aprobado, Fallido y No aplica**. El estado **No aplica** requiere justificación.

## 10.2. Clasificación de severidad de defectos

| Severidad | Criterio | Ejemplo relevante en Tasker |
|---|---|---|
| Bloqueante | Impide operar o continuar la validación en el alcance comprometido. | No es posible autenticarse en ninguna cuenta de prueba. |
| Crítica | Permite acceso no autorizado, pérdida/corrupción de datos o rompe un flujo esencial sin alternativa segura. | Un integrante no asignado modifica estados por API. |
| Alta | Falla funcional importante con impacto claro y alternativa limitada. | La creación de tareas falla en un proyecto válido. |
| Media | Falla localizada o inconsistencia no crítica. | Una vista no actualiza un dato hasta recargar sin pérdida persistente. |
| Baja | Error visual o textual sin efecto relevante sobre operación. | Etiqueta o alineación incorrecta. |

La **prioridad de resolución** se asigna durante el triaje, considerando severidad, alcance, frecuencia y fecha de entrega; no se considera idéntica a la severidad.

## 10.3. Ciclo de vida de defectos

**Nuevo → En análisis → En corrección → Listo para reprueba → Verificado → Cerrado.** Si el defecto persiste, pasa a **Reabierto**. Si se trata de duplicado, cambio de alcance o comportamiento esperado, la resolución y sus razones quedarán documentadas en Jira. Las correcciones se integrarán por PR revisado y volverán a probarse en `testing`.

## 10.4. Plantilla mínima de incidencia

| Campo | Contenido requerido |
|---|---|
| Título | `[QA][Módulo]` + descripción concreta de la falla. |
| Referencias | Historia Jira, caso CP, build y commit. |
| Entorno | Navegador, versión, instancia de QA y dataset. |
| Precondición y pasos | Instrucciones suficientes para reproducir. |
| Resultado esperado / obtenido | Comparación explícita basada en criterio conocido. |
| Severidad y prioridad | Clasificación razonada. |
| Evidencia | Capturas/registro sanitizado y hora. |
| Estado y responsable | Seguimiento en Jira y relación con PR correctivo. |


# 11. Roles y responsabilidades

| Rol | Responsabilidades dentro del plan |
|---|---|
| QA | Mantener casos y trazabilidad, coordinar dataset, ejecutar comprobaciones, registrar defectos, repruebas e informe final. |
| Frontend | Entregar interfaz verificable, corregir fallos de presentación y validar compilación. |
| Backend | Preparar Supabase/PostgreSQL, migraciones, políticas RLS y apoyar pruebas de autorización y reinicio. |
| Líder de desarrollo | Revisar viabilidad técnica, coordinar correcciones y calidad de integraciones. |
| UX/UI | Aclarar diseños aprobados y criterios de presentación. |
| Scrum Master | Gestionar impedimentos y confirmar difusión del plan y coordinación de revisiones. |
| Product Owner | Aclarar requisitos, aprobar cambios de alcance y pronunciarse sobre excepciones de aceptación cuando corresponda. |
| Integración y documentación técnica | Mantener referencias del repositorio, cambios y documentos compartidos. |

La preparación del plan corresponde a QA. La aprobación del documento y la aceptación de la versión no se consideran realizadas hasta contar con la evidencia correspondiente.

# 12. Cronograma propuesto y coordinación

| Fecha / momento | Actividad | Resultado previsto |
|---|---|---|
| 04–05/11/2026 | Elaboración de HU-39, definición de escenarios, criterios y estrategia de datos. | Versión 1.0 para revisión. |
| Tras la publicación del plan | Revisión del equipo, vinculación con Jira y acuerdo de HU-53. | Plan aprobado o lista de ajustes. |
| A medida que se promuevan historias a `testing` | Preparación de datasets, humo y ejecución incremental. | Casos registrados por build. |
| Después de correcciones | Repruebas y regresión de áreas impactadas. | Evidencia de verificación o defectos reabiertos. |
| Antes de la evaluación del 17/11/2026 | Cierre de cobertura y recomendación de QA sobre versión candidata. | Informe y decisión trazada. |

Las fechas de ejecución dependen de la entrega real de builds y del avance de HU-53. No se presume que QA haya ejecutado escenarios durante el periodo de elaboración del plan.

# 13. Riesgos, mitigaciones y decisiones pendientes

| Riesgo | Efecto posible | Acción de mitigación |
|---|---|---|
| Historias o criterios incompletos | Casos sin resultado esperado verificable. | Consultar Jira; detener el caso hasta aclaración. |
| Entrega tardía de módulos | Reducción del tiempo de prueba. | Priorizar autenticación, permisos, tareas, Kanban y humo. |
| Falta de entorno separado | Pérdida o alteración de datos ajenos. | No probar limpieza o fallos destructivos fuera de QA. |
| HU-53 no disponible | Escenarios difíciles de reproducir y falsas regresiones. | Acordar fixtures versionados y ensayar reinicio antes de campaña. |
| Políticas RLS incorrectas | Acceso indebido incluso si la interfaz oculta botones. | Pruebas directas con credenciales no privilegiadas y revisión de migraciones. |
| Cambio no validado tras aprobación QA | Se entrega una versión distinta a la probada. | Congelar el commit candidato o repetir pruebas de impacto. |
| Errores sin evidencia suficiente | Correcciones difíciles de confirmar. | Exigir caso, commit, dataset, pasos, observación y captura sanitizada. |
| Dependencias del equipo durante un sprint corto | Bloqueos y duplicación de esfuerzos. | Registrar impedimentos en Jira y revisarlos con el Scrum Master. |

**Decisiones necesarias antes de la ejecución formal:** completar enlaces de historias/criterios, confirmar fórmula de avance y límites de validación, definir navegadores soportados, identificar instancia de Supabase QA, formalizar scripts HU-53, aprobar umbrales de salida y asignar ubicación de evidencias.


## Anexo A. Formato de hoja de ejecución

| Campo | Valor a registrar |
|---|---|
| ID del caso / historia y criterio Jira | |
| Módulo y prioridad | |
| Ejecutado por / fecha y hora | |
| Build / commit / navegador | |
| Entorno / versión del dataset | |
| Precondiciones | |
| Pasos ejecutados | |
| Resultado esperado | |
| Resultado observado | |
| Estado (Aprobado / Fallido / Bloqueado / No aplica) | |
| Evidencia / Jira de defecto | |
| Observaciones / próxima acción | |

## Anexo B. Formato de acta de cierre de campaña

**Versión candidata:** ____________________  
**Commit en `testing`:** ____________________  
**Periodo de ejecución:** ____________________  
**Dataset y entorno:** ____________________  
**Historias incluidas y excluidas:** ____________________  
**Casos aplicables / ejecutados / aprobados / fallidos / bloqueados:** ____________________  
**Cobertura de criterios de aceptación:** ____________________  
**Defectos abiertos por severidad:** ____________________  
**Limitaciones y riesgos aceptados:** ____________________  
**Recomendación de QA:** Apta / No apta / Apta condicionada (con autorización documentada).  
**Enlaces a evidencias y Jira:** ____________________  
**Revisión y decisión del equipo:** ____________________

**Nota final de control:** El presente documento es el plan de HU-39, no el informe de cierre ni la certificación del producto. La ejecución, los resultados y el acto de compartirlo con el equipo deberán acreditarse en sus registros correspondientes.
