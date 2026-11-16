# HU-40 — Registro de ejecución de pruebas de autenticación

**Proyecto:** Tasker  
**Historia:** HU-40 — Pruebas de autenticación  
**Responsable:** QA  
**Tipo de ejecución:** Manual, desde la interfaz web de Angular  
**Versión del registro:** 1.1  
**Fecha de actualización:** 11 de noviembre de 2026  
**Fecha y hora de ejecución:** Según fechas de las capturas de cada ciclo  
**Ejecutor:** Responsable de QA  
**Rama y commit del frontend:** Pendientes de registrar  
**Aplicación:** `http://localhost:4200`  
**Servicio de autenticación:** Supabase alojado, compartido por el equipo  
**Navegador:** Brave  
**Sistema operativo:** Windows  
**Referencia de diseño de pruebas:** HU-39, casos `CP-AUT-01` a `CP-AUT-05`  
**Referencia de datos:** HU-53, datasets `DS-01`, `DS-05` y `DS-07` (QA53-1.2)

## 1. Objetivo y alcance

Documentar los resultados de las pruebas de autenticación de Tasker conforme a HU-40, utilizando los casos definidos en el Plan Maestro de Pruebas HU-39 y los datasets relacionados de HU-53.

La ejecución comprende el inicio de sesión válido e inválido, cierre de sesión, protección de rutas y registro de usuarios. También se identifica el estado de la verificación de sesiones expiradas.

Las pruebas se realizaron en la aplicación Angular conectada al Supabase compartido del equipo. Se utilizaron identidades de prueba y se registraron los resultados observados mediante capturas de pantalla.

El presente documento recoge los resultados reportados por QA. La incorporación de las nuevas capturas de registro al repositorio y la identificación del commit exacto del frontend deben comprobarse durante la revisión.

## 2. Criterios de aceptación y trazabilidad

| Criterio de HU-40 | Caso de prueba | Dataset | Estado |
|---|---|---|---|
| Inicio de sesión válido | CP-AUT-03 | DS-01 | Aprobado |
| Inicio de sesión con credenciales incorrectas | CP-AUT-04 | DS-01, DS-07 | Aprobado |
| Cierre de sesión | CP-AUT-05, verificación A | DS-01 | Aprobado |
| Protección de rutas | CP-AUT-05, verificación B | DS-01 | Aprobado |
| Sesión expirada | EXT-AUT-01 | DS-07 | Pendiente |
| Registro válido desde el login | CP-AUT-01 | DS-01 | Aprobado |
| Registro inválido | CP-AUT-02 | DS-05 | Aprobado |
| Documentación de resultados | Este registro | — | Documentado |

`CP-AUT-05` cubre dos comprobaciones: cierre de sesión y protección de rutas.

`EXT-AUT-01` es una ampliación propuesta para cubrir explícitamente las sesiones expiradas. No se incorpora a los 45 casos originales de HU-39 sin su actualización o aprobación correspondiente.

## 3. Fichas de ejecución de pruebas

### CP-AUT-01 — Registro de cuenta con datos válidos

**Historia / criterio:** HU-40, registro de usuarios desde el login  
**Prioridad:** Alta  
**Dataset:** DS-01  
**Estado:** Aprobado según ejecución reportada por QA

| Campo | Registro |
|---|---|
| Identificador | CP-AUT-01 |
| Objetivo | Verificar que un usuario pueda registrarse mediante el formulario de Tasker. |
| Precondiciones | Formulario de registro implementado y disponible; servicio Supabase accesible. |
| Resultado esperado | El sistema acepta datos válidos y procesa el registro conforme al flujo implementado. |
| Resultado obtenido | QA confirmó la implementación de la funcionalidad, realizó la prueba de registro válido y reportó un resultado satisfactorio. |
| Estado | Aprobado |
| Evidencia | EV-HU40-06 — captura del registro válido. |
| Incidencia | No se reportaron defectos durante la ejecución. |

**Procedimiento de prueba:**

1. Acceder a la pantalla de inicio de sesión de Tasker.
2. Seleccionar la opción de registro de usuario.
3. Completar los campos con datos ficticios válidos.
4. Enviar el formulario de registro.
5. Comprobar el resultado y el comportamiento del sistema.

**Observación:** El resultado fue confirmado por QA. La captura debe incorporarse a GitHub para respaldar la aprobación y verificar el mensaje o comportamiento exacto mostrado por la aplicación.

### CP-AUT-02 — Registro con datos inválidos

**Historia / criterio:** HU-40, validaciones del registro de usuarios  
**Prioridad:** Alta  
**Dataset:** DS-05  
**Estado:** Aprobado según ejecución reportada por QA

| Campo | Registro |
|---|---|
| Identificador | CP-AUT-02 |
| Objetivo | Comprobar que el formulario de registro controle los datos inválidos. |
| Precondiciones | Formulario de registro disponible y reglas de validación implementadas. |
| Resultado esperado | El sistema rechaza las entradas que incumplen las validaciones y evita un registro indebido. |
| Resultado obtenido | QA confirmó que la funcionalidad de registro inválido fue implementada, ejecutada y aprobada. |
| Estado | Aprobado |
| Evidencia | EV-HU40-07 — captura de registro inválido. |
| Incidencia | No se reportaron defectos durante la ejecución. |

**Procedimiento de prueba:**

1. Acceder al formulario de registro.
2. Introducir datos que incumplan las validaciones del formulario.
3. Intentar enviar el registro.
4. Comprobar el mensaje o comportamiento de validación.
5. Verificar que el sistema no acepte indebidamente los datos ingresados.

**Observación:** La evidencia debe permitir identificar qué validación se comprobó. La captura anterior con `test@example.com` en la pantalla de login sigue correspondiendo a CP-AUT-04 y no sustituye esta prueba.

No se declara ejecutado un escenario específico de correo duplicado o longitud máxima si no existe evidencia de su comprobación.

### CP-AUT-03 — Inicio de sesión con credenciales válidas

**Historia / criterio:** HU-40, inicio de sesión válido  
**Prioridad:** Crítica  
**Dataset:** DS-01  
**Estado:** Aprobado

| Campo | Registro |
|---|---|
| Identificador | CP-AUT-03 |
| Objetivo | Comprobar el acceso de un usuario registrado. |
| Precondiciones | Usuario existente en Supabase y sesión anterior cerrada. |
| Datos de prueba | `ana@example.com` y su contraseña de prueba vigente. |
| Resultado esperado | El usuario se autentica correctamente y accede a `/inicio`. |
| Resultado obtenido | Se logró iniciar sesión y acceder al dashboard de Tasker. |
| Estado | Aprobado |
| Evidencia | EV-HU40-01 — captura de la pantalla principal de Tasker. |
| Incidencia | No se identificaron defectos. |

**Procedimiento de prueba:**

1. Acceder a `http://localhost:4200/login`.
2. Ingresar las credenciales válidas de la cuenta de prueba.
3. Seleccionar **Iniciar sesión**.
4. Verificar el acceso a `/inicio`.
5. Comprobar la visualización de la pantalla principal.

**Observación:** La captura muestra la aplicación en `/inicio` y la opción de cerrar sesión.

### CP-AUT-04 — Inicio de sesión con credenciales incorrectas

**Historia / criterio:** HU-40, rechazo de credenciales inválidas  
**Prioridad:** Alta  
**Dataset:** DS-01 y DS-07  
**Estado:** Aprobado

| Campo | Registro |
|---|---|
| Identificador | CP-AUT-04 |
| Objetivo | Verificar que el sistema impida iniciar sesión con credenciales incorrectas. |
| Precondiciones | Formulario de inicio de sesión disponible. |
| Datos de prueba | Correo válido con contraseña incorrecta y prueba adicional con `test@example.com`. |
| Resultado esperado | Se rechaza el acceso y se muestra un mensaje controlado. |
| Resultado obtenido | El sistema permaneció en `/login` y mostró un mensaje de credenciales incorrectas. |
| Estado | Aprobado |
| Evidencias | EV-HU40-02 y EV-HU40-05. |
| Incidencia | No se identificaron defectos. |

**Procedimiento de prueba:**

1. Acceder al formulario de inicio de sesión.
2. Introducir un correo de prueba con contraseña incorrecta.
3. Seleccionar **Iniciar sesión**.
4. Comprobar el rechazo del acceso.
5. Repetir el intento con `test@example.com`.

**Mensaje observado:**

> Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.

El sistema no permitió ingresar al dashboard con las credenciales utilizadas.

### CP-AUT-05 — Cierre de sesión y protección de rutas

**Historia / criterio:** HU-40, cierre de sesión y protección de rutas  
**Prioridad:** Alta  
**Dataset:** DS-01  
**Estado:** Aprobado

| Campo | Registro |
|---|---|
| Identificador | CP-AUT-05 |
| Objetivo | Verificar que el cierre de sesión impida continuar accediendo a rutas protegidas. |
| Precondiciones | Usuario autenticado y con acceso a `/inicio`. |
| Resultado esperado | Al cerrar sesión, el usuario regresa al login. Si intenta acceder directamente a una ruta protegida, el sistema solicita autenticación. |
| Resultado obtenido | Después de cerrar sesión se regresó a `/login`. Al intentar ingresar directamente a `/inicio`, Tasker redirigió automáticamente a `/login`. |
| Estado | Aprobado |
| Evidencias | EV-HU40-03 y EV-HU40-04 (resultado reportado). |
| Incidencia | No se identificaron defectos. |

**Procedimiento de prueba:**

1. Iniciar sesión con una cuenta válida.
2. Acceder a `/inicio`.
3. Seleccionar **Cerrar sesión**.
4. Comprobar el regreso a `/login`.
5. Intentar acceder directamente a `http://localhost:4200/inicio`.
6. Verificar la redirección al formulario de inicio de sesión.

**Observación:** El sistema no mostró un mensaje adicional al redirigir. Esto no constituye un defecto, porque la protección de rutas se realizó mediante redirección y el criterio de aceptación no exige un aviso específico.

La redirección fue confirmada mediante la ejecución reportada por QA, aunque no existe una captura independiente del proceso de navegación.

### EXT-AUT-01 — Comportamiento ante una sesión expirada

**Historia / criterio:** HU-40, sesiones expiradas  
**Prioridad:** Alta (ampliación propuesta)  
**Dataset:** DS-07  
**Estado:** Pendiente de validación

| Campo | Registro |
|---|---|
| Identificador | EXT-AUT-01 |
| Objetivo | Comprobar el comportamiento de Tasker cuando una sesión deja de ser válida. |
| Precondiciones | Mecanismo de expiración o invalidación de sesión identificado y procedimiento de prueba autorizado. |
| Resultado esperado | Ante una sesión inválida que no pueda renovarse, el sistema impide el acceso a recursos protegidos y requiere autenticación. |
| Resultado obtenido | No se ejecutó una prueba de expiración efectiva. QA informó que no se implementó un límite explícito de duración o inactividad de sesión en Tasker. |
| Estado | Pendiente de validación |
| Evidencia | No disponible. |
| Incidencia | Pendiente de aclaración y validación con backend. |

**Procedimiento propuesto:**

1. Iniciar sesión con una cuenta de QA.
2. Identificar el mecanismo real de expiración y renovación de sesión.
3. Provocar de forma controlada una sesión inválida o no renovable.
4. Intentar acceder a `/inicio`.
5. Comprobar que el sistema impida el acceso protegido y solicite autenticación.

**Observación técnica:**

No existe una implementación explícita de límite de sesión en Tasker, según la revisión reportada por QA. Sin embargo, Supabase Auth administra tokens con expiración y puede renovarlos automáticamente.

Por ello, la ausencia de un tiempo límite configurado en Angular no permite concluir que la expiración de los tokens no funcione. La prueba permanece pendiente hasta definir qué comportamiento debe verificarse y ejecutarlo de forma controlada.

No se clasifica como aprobada ni fallida.

## 4. Resumen de ejecución

### 4.1. Casos originales del Plan Maestro de Pruebas

| Estado | Cantidad | Identificadores |
|---|---:|---|
| Aprobados | 5 | CP-AUT-01, CP-AUT-02, CP-AUT-03, CP-AUT-04, CP-AUT-05 |
| Fallidos | 0 | Ninguno confirmado |
| Bloqueados | 0 | Ninguno |
| Total | 5 | — |

Los cinco casos originales de autenticación definidos en HU-39 fueron reportados como aprobados por QA.

### 4.2. Comprobaciones de los criterios de HU-40

| Comprobación | Estado |
|---|---|
| Inicio de sesión válido | Aprobada |
| Inicio de sesión inválido | Aprobada |
| Cierre de sesión | Aprobada |
| Protección de rutas | Aprobada |
| Registro válido | Aprobada |
| Registro inválido | Aprobada |
| Sesión expirada | Pendiente |

**Resultado general:** seis comprobaciones satisfactorias y una pendiente de validación.

El caso EXT-AUT-01 no se suma al total de los cinco casos originales de HU-39.

## 5. Inventario de evidencias

| Identificador | Descripción | Caso |
|---|---|---|
| EV-HU40-01 | Pantalla principal de Tasker después del inicio de sesión válido. | CP-AUT-03 |
| EV-HU40-02 | Rechazo de inicio de sesión con credenciales incorrectas. | CP-AUT-04 |
| EV-HU40-03 | Pantalla `/login` después del cierre de sesión. | CP-AUT-05 |
| EV-HU40-04 | Redirección de `/inicio` a `/login` sin autenticación, confirmada mediante el resultado reportado. No existe captura independiente. | CP-AUT-05 |
| EV-HU40-05 | Rechazo de autenticación utilizando `test@example.com`. | CP-AUT-04 |
| EV-HU40-06 | Captura del registro válido de usuario, tomada por QA. | CP-AUT-01 |
| EV-HU40-07 | Captura del registro inválido de usuario, tomada por QA. | CP-AUT-02 |

### 5.1. Ubicación de evidencias

Las capturas deben incorporarse en:

```text
docs/qa/evidencias/hu-40/
```

Con los siguientes nombres:

```text
EV-HU40-01-login-valido.png
EV-HU40-02-login-invalido.png
EV-HU40-03-cierre-sesion.png
EV-HU40-05-login-correo-no-registrado.png
EV-HU40-06-registro-valido.png
EV-HU40-07-registro-invalido.png
```

Las evidencias EV-HU40-06 y EV-HU40-07 fueron reportadas como capturadas por QA. Su contenido exacto y su incorporación al repositorio quedan sujetos a verificación.

No se asigna un archivo de imagen a EV-HU40-04 porque la comprobación fue reportada mediante la navegación, sin captura independiente.

Antes de subir las imágenes, verificar que no incluyan contraseñas, claves de API, tokens o información sensible.

## 6. Defectos, dependencias y pendientes

### 6.1. Defectos

No se reportaron defectos funcionales confirmados durante las pruebas ejecutadas y aprobadas.

No se registran defectos ficticios para los escenarios que no fueron ejecutados.

### 6.2. Sesiones expiradas

El único criterio de aceptación funcional pendiente corresponde al comportamiento ante sesiones expiradas.

Se requiere:

1. Confirmar con backend si Tasker debe establecer un límite propio de duración o inactividad.
2. Revisar el comportamiento de Supabase Auth respecto a la renovación e invalidación de sesiones.
3. Definir un procedimiento reproducible que no afecte las cuentas o sesiones de otros integrantes.
4. Ejecutar la prueba y registrar las evidencias correspondientes.

### 6.3. Registro y reproducibilidad

Antes de cerrar formalmente la ejecución se deberá:

- Registrar el commit y la rama del frontend utilizados.
- Confirmar las fechas y horas de las ejecuciones.
- Verificar la incorporación de las capturas EV-HU40-06 y EV-HU40-07.
- Vincular los resultados al ticket de HU-40 en Jira.
- Registrar la decisión del equipo sobre el criterio de sesiones expiradas.

## 7. Estado de HU-40

**Estado:** ejecución de los cinco casos originales completada, con un criterio adicional pendiente de validación.

Los casos CP-AUT-01 a CP-AUT-05 presentan resultados satisfactorios según las ejecuciones reportadas por QA.

Las funcionalidades de registro válido e inválido ya se encuentran implementadas y fueron reportadas como aprobadas.

El criterio sobre sesiones expiradas permanece pendiente porque no se ha probado una expiración efectiva y no existe una configuración explícita de límite de sesión implementada en Tasker, según la revisión realizada.

El informe puede actualizarse y presentarse a revisión, pero no debe declararse totalmente cumplido el criterio de sesiones expiradas sin su validación o una decisión formal del equipo sobre el alcance.
