# HU-40 — Registro de ejecución de pruebas de autenticación

**Proyecto:** Tasker  
**Historia:** HU-40 — Pruebas de autenticación  
**Responsable:** QA  
**Tipo de ejecución:** Manual, desde la interfaz web de Angular  
**Versión del registro:** 1.0   
**Ejecutor:** Responsable QA   
**Servicio de autenticación:** Supabase alojado compartido por el equipo  
**Navegador:** Brave (versión pendiente de registrar)  
**Sistema operativo:** Windows  
**Referencia de diseño de pruebas:** HU-39, casos `CP-AUT-01` a `CP-AUT-05`  
**Referencia de datos:** HU-53, catálogo `DS-01`, `DS-05`, `DS-07` (versión documental QA53-1.2)  

> **Alcance de este registro:** Los resultados se basan en las capturas y observaciones compartidas por QA. No se ha acreditado la ejecución del script de restauración de HU-53 ni se conoce el commit exacto del frontend probado. Las cuentas empleadas fueron las identidades de prueba existentes documentadas en HU-52. Los estados pendientes y bloqueados no constituyen pruebas aprobadas.

## 1. Criterios de aceptación y trazabilidad

| Criterio de HU-40 | Caso de HU-39 o ampliación | Dataset | Resultado |
|---|---|---|---|
| Inicio de sesión válido | `CP-AUT-03` | `DS-01` | Aprobado según ejecución reportada |
| Inicio de sesión con credenciales incorrectas | `CP-AUT-04` | `DS-01` (entrada negativa de `DS-07`) | Aprobado |
| Cierre de sesión | `CP-AUT-05`, verificación A | `DS-01` | Aprobado según ejecución reportada |
| Protección de rutas | `CP-AUT-05`, verificación B | `DS-01` | Aprobado según ejecución reportada |
| Sesión expirada | `EXT-AUT-01` (ampliación propuesta en HU-53) | `DS-07` | Pendiente de validación |
| Registro válido desde login (HU-54) | `CP-AUT-01` | `DS-01` | Bloqueado |
| Registro inválido o duplicado (HU-54) | `CP-AUT-02` | `DS-05` | Bloqueado |
| Resultados documentados | Este registro y sus evidencias | — | Documentado con limitaciones |

`CP-AUT-05` contiene dos verificaciones —cierre de sesión y protección de ruta—, por lo que **las siete verificaciones de los criterios de HU-40 corresponden a seis fichas de casos**, cinco originales de HU-39 y una ampliación propuesta. `EXT-AUT-01` no forma parte de los 45 escenarios originales de HU-39 hasta que se apruebe su incorporación.

## 2. Fichas de ejecución

### CP-AUT-03 — Inicio de sesión con credenciales válidas

**Historia / criterio:** HU-40 · **Prioridad:** Crítica (C) · **Procedimiento:** versión 1.0

| Campo | Registro |
|---|---|
| Identificador | `CP-AUT-03` |
| Ejecutado por / fecha y hora | Responsable QA / pendiente de registrar |
| Entorno / versión | Angular `localhost:4200`; Supabase compartido / commit pendiente de identificar |
| Navegador | Brave; versión pendiente de registrar |
| Dataset | DS-01 — Identidades (cuenta existente de HU-52) (HU-53 QA53-1.2; ejecución del SQL no acreditada) |
| Precondiciones | Tasker disponible en `/login`; sesión anterior cerrada; cuenta de prueba `ana@example.com` habilitada en Supabase. |
| Resultado esperado | Se establece una sesión autenticada y el usuario puede acceder a `/inicio`. |
| Resultado observado | QA reportó un inicio de sesión correcto y compartió una captura de Tasker en `localhost:4200/inicio` con el botón **Cerrar sesión** visible. La captura no muestra la identidad de la cuenta autenticada. |
| Estado | **Aprobado según ejecución reportada** |
| Evidencia | EV-HU40-01 — captura de `/inicio` luego de autenticación. |
| Incidencia / dependencia | No se confirmó defecto. |
| Reinicio y observaciones | Para dejar evidencia completamente verificable, asociar fecha, commit y registro de autenticación no sensible; no mostrar tokens ni contraseñas. |

**Pasos del procedimiento:**

1. Abrir `http://localhost:4200/login`.
2. Introducir el correo de prueba válido y su contraseña vigente.
3. Seleccionar **Iniciar sesión**.
4. Observar la URL y la pantalla de destino.


### CP-AUT-04 — Intento de inicio de sesión con credenciales incorrectas

**Historia / criterio:** HU-40 · **Prioridad:** Alta (A) · **Procedimiento:** versión 1.0

| Campo | Registro |
|---|---|
| Identificador | `CP-AUT-04` |
| Ejecutado por / fecha y hora | Responsable QA / pendiente de registrar |
| Entorno / versión | Angular `localhost:4200`; Supabase compartido / commit pendiente de identificar |
| Navegador | Brave; versión pendiente de registrar |
| Dataset | DS-01; entrada negativa definida en DS-07 (HU-53 QA53-1.2; ejecución del SQL no acreditada) |
| Precondiciones | Formulario `/login` disponible y sesión no autenticada. |
| Resultado esperado | Se rechaza el inicio de sesión sin crear una sesión y se muestra un error controlado. |
| Resultado observado | La interfaz permaneció en `/login` y mostró: «Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo». Se aportaron capturas para `ana@example.com` con contraseña incorrecta y para `test@example.com`. |
| Estado | **Aprobado** |
| Evidencia | EV-HU40-02 — login inválido con `ana@example.com`; EV-HU40-05 — intento adicional con `test@example.com`. |
| Incidencia / dependencia | No se confirmó defecto. |
| Reinicio y observaciones | El intento con `test@example.com` es una prueba adicional de **login inválido**, no de registro inválido. |

**Pasos del procedimiento:**

1. Abrir `/login`.
2. Introducir `ana@example.com` con una contraseña incorrecta.
3. Seleccionar **Iniciar sesión**.
4. Observar el mensaje y comprobar que no se acceda a `/inicio`.
5. Opcional: repetir con una identidad no registrada, como `test@example.com`, sin crear la cuenta.


### CP-AUT-05 — Cierre de sesión y acceso a ruta protegida

**Historia / criterio:** HU-40 · **Prioridad:** Alta (A) · **Procedimiento:** versión 1.0

| Campo | Registro |
|---|---|
| Identificador | `CP-AUT-05` |
| Ejecutado por / fecha y hora | Responsable QA / pendiente de registrar |
| Entorno / versión | Angular `localhost:4200`; Supabase compartido / commit pendiente de identificar |
| Navegador | Brave; versión pendiente de registrar |
| Dataset | DS-01 — Identidades (HU-53 QA53-1.2; ejecución del SQL no acreditada) |
| Precondiciones | Usuario autenticado y con acceso a `/inicio`. |
| Resultado esperado | La sesión deja de estar activa y el acceso directo a `/inicio` requiere autenticación; la aplicación puede redirigir al login sin aviso adicional. |
| Resultado observado | QA reportó que al cerrar sesión regresó a `/login`. También indicó que, al intentar entrar directamente a `/inicio` sin sesión, Tasker lo redirigió automáticamente a `/login`, sin mostrar otro aviso. La captura recibida de login documenta el estado final, pero no permite demostrar por sí sola la navegación desde `/inicio`. |
| Estado | **Aprobado según ejecución reportada** |
| Evidencia | EV-HU40-03 — pantalla `/login` después de cerrar sesión; EV-HU40-04 — redirección a `/login` reportada (captura final equivalente). |
| Incidencia / dependencia | No se confirmó defecto. |
| Reinicio y observaciones | Es recomendable guardar un video corto o registro de navegación con la URL solicitada `/inicio` y la URL final `/login`, sin incluir datos de sesión. |

**Pasos del procedimiento:**

1. Desde `/inicio`, seleccionar **Cerrar sesión**.
2. Comprobar que la aplicación regresa a `/login`.
3. Tras cerrar sesión, escribir directamente `http://localhost:4200/inicio` en la barra de direcciones.
4. Pulsar Enter y observar el comportamiento.


### CP-AUT-01 — Registro de cuenta con datos válidos

**Historia / criterio:** HU-40 · **Prioridad:** Alta (A) · **Procedimiento:** versión 1.0

| Campo | Registro |
|---|---|
| Identificador | `CP-AUT-01` |
| Ejecutado por / fecha y hora | Responsable QA / pendiente de registrar |
| Entorno / versión | Angular `localhost:4200`; Supabase compartido / commit pendiente de identificar |
| Navegador | Brave; versión pendiente de registrar |
| Dataset | DS-01 — Identidad temporal por crear durante la prueba (HU-53 QA53-1.2; ejecución del SQL no acreditada) |
| Precondiciones | Implementación del registro desde el login según HU-54 y autorización del equipo para crear una cuenta temporal en Supabase compartido. |
| Resultado esperado | Se crea la cuenta conforme al flujo de HU-54 y se aplica la confirmación de correo solo cuando corresponda. |
| Resultado observado | QA informó que la función de registro de usuarios aún no está implementada. No fue posible realizar el procedimiento. |
| Estado | **Bloqueado** |
| Evidencia | No existe evidencia de ejecución de registro; dependencia HU-54 informada por QA. |
| Incidencia / dependencia | Dependencia funcional HU-54, no se atribuye defecto de HU-40 sin verificar fechas de entrega y alcance. |
| Reinicio y observaciones | Reejecutar cuando HU-54 esté disponible. Coordinar cuenta temporal y limpieza con backend. |

**Pasos del procedimiento:**

1. Abrir `/login`.
2. Seleccionar la opción de registro, una vez disponible.
3. Introducir datos válidos con correo ficticio nuevo.
4. Enviar el formulario y comprobar el flujo y las confirmaciones aprobadas.


### CP-AUT-02 — Registro con datos inválidos o cuenta duplicada

**Historia / criterio:** HU-40 · **Prioridad:** Alta (A) · **Procedimiento:** versión 1.0

| Campo | Registro |
|---|---|
| Identificador | `CP-AUT-02` |
| Ejecutado por / fecha y hora | Responsable QA / pendiente de registrar |
| Entorno / versión | Angular `localhost:4200`; Supabase compartido / commit pendiente de identificar |
| Navegador | Brave; versión pendiente de registrar |
| Dataset | DS-05 — Entradas inválidas; DS-01 como referencia de cuenta ya existente (HU-53 QA53-1.2; ejecución del SQL no acreditada) |
| Precondiciones | Formulario de registro de HU-54 implementado y reglas de validación aprobadas. |
| Resultado esperado | Las entradas inválidas o duplicadas se rechazan de manera controlada, sin exponer información sensible. |
| Resultado observado | QA confirmó que el registro de nuevos usuarios no está implementado. La captura con `test@example.com` corresponde al formulario de **inicio de sesión**, por lo que no constituye evidencia de este caso. |
| Estado | **Bloqueado** |
| Evidencia | Sin evidencia de ejecución de registro inválido. |
| Incidencia / dependencia | Dependencia HU-54; no corresponde inventar un resultado de registro. |
| Reinicio y observaciones | Ejecutar solo cuando esté disponible la funcionalidad; no modificar datos reales del Supabase compartido. |

**Pasos del procedimiento:**

1. Abrir el formulario de registro.
2. Intentar enviar entradas inválidas o incompletas conforme a las reglas aprobadas.
3. Intentar registrar un correo ya existente sin modificar esa cuenta.
4. Verificar los mensajes de rechazo y que no se haya creado indebidamente un usuario.


### EXT-AUT-01 — Comportamiento ante una sesión expirada o invalidada

**Historia / criterio:** HU-40 · **Prioridad:** Alta (propuesta; pendiente de aprobación en HU-39) · **Procedimiento:** versión 1.0

| Campo | Registro |
|---|---|
| Identificador | `EXT-AUT-01` |
| Ejecutado por / fecha y hora | Responsable QA / pendiente de registrar |
| Entorno / versión | Angular `localhost:4200`; Supabase compartido / commit pendiente de identificar |
| Navegador | Brave; versión pendiente de registrar |
| Dataset | DS-07 — Sesión caducada sin posibilidad de renovación (HU-53 QA53-1.2; ejecución del SQL no acreditada) |
| Precondiciones | Mecanismo de autenticación y renovación de tokens conocido; escenario controlado aprobado por backend para el Supabase compartido. |
| Resultado esperado | Ante una **sesión realmente inválida y no renovable**, se niega el acceso a recursos protegidos y se exige autenticación. La mera caducidad de un token que pueda renovarse automáticamente no equivale a una sesión terminada. |
| Resultado observado | QA indicó que no encontró una configuración explícita de límite activo de sesión en Angular. No se ejecutó una invalidación o expiración controlada, por lo que no existe resultado funcional comprobado. |
| Estado | **Pendiente** |
| Evidencia | Sin captura ni evidencia funcional de sesión expirada. |
| Incidencia / dependencia | Requiere definición de procedimiento de prueba junto con backend; no hay defecto confirmado. |
| Reinicio y observaciones | No modificar límites globales ni revocar sesiones de otros integrantes en el Supabase compartido. |

**Pasos del procedimiento:**

1. Iniciar sesión con una cuenta de QA.
2. Provocar, mediante un procedimiento autorizado, que la sesión sea inválida o no renovable.
3. Intentar abrir `/inicio` y realizar una operación protegida.
4. Observar si la aplicación exige autenticación y evita el acceso protegido.

## 3. Resumen de ejecución

**Inventario base de HU-39 para autenticación:** cinco casos (`CP-AUT-01` a `CP-AUT-05`).

| Estado | Casos originales HU-39 |
|---|---:|
| Aprobados | 3 (`CP-AUT-03`, `CP-AUT-04`, `CP-AUT-05`) |
| Fallidos | 0 confirmados |
| Bloqueados | 2 (`CP-AUT-01`, `CP-AUT-02`) |
| **Total** | **5** |

**Ampliación de cobertura:** un caso propuesto, `EXT-AUT-01`, pendiente de ejecutar; no se incorpora al total de los 45 casos originales.

**Desglose de los siete criterios/comprobaciones solicitados en HU-40:** cuatro satisfactorios (login válido, login inválido, cierre de sesión y rutas protegidas), uno pendiente (sesión expirada) y dos bloqueados (registro válido e inválido). Esta desagregación no debe confundirse con el conteo de las fichas de HU-39, porque `CP-AUT-05` cubre dos comprobaciones.

No se calcula una tasa de aprobación definitiva de HU-40 ni se declara cobertura completa: existen escenarios no ejecutados y falta identificar el build/commit probado. Tampoco se han confirmado defectos funcionales con las evidencias disponibles.

## 4. Inventario y resguardo de evidencias

| ID | Contenido de la evidencia recibida o reportada | Asociación |
|---|---|---|
| `EV-HU40-01` | Captura de `localhost:4200/inicio`, con pantalla principal y botón «Cerrar sesión». | `CP-AUT-03` |
| `EV-HU40-02` | Captura de `/login` con `ana@example.com` y mensaje de credenciales incorrectas. | `CP-AUT-04` |
| `EV-HU40-03` | Captura de `/login` sin mensaje de error, compartida para el cierre de sesión. | `CP-AUT-05`, cierre |
| `EV-HU40-04` | Redirección desde `/inicio` hacia `/login` reportada por QA; la captura del estado final es equivalente a `EV-HU40-03`. | `CP-AUT-05`, ruta protegida |
| `EV-HU40-05` | Captura de `/login` con `test@example.com` y rechazo de credenciales. | `CP-AUT-04`, prueba adicional |

Las capturas fueron proporcionadas durante la revisión; su incorporación efectiva al repositorio o Jira **está pendiente**. No se debe inventar una captura separada para `EV-HU40-04`.

**Ubicación propuesta de archivos, si el equipo autoriza incorporarlos al repositorio:**

```text
docs/qa/evidencias/hu-40/
  EV-HU40-01-login-valido.png
  EV-HU40-02-login-invalido.png
  EV-HU40-03-cierre-sesion.png
  EV-HU40-05-login-correo-no-registrado.png
```

Si se guarda evidencia adicional de redirección, asignarle `EV-HU40-04` y describir el método usado. Verificar que las imágenes no revelen contraseñas, tokens ni datos sensibles.

## 5. Dependencias y acciones pendientes

1. **HU-54:** implementar el registro de usuarios y reejecutar `CP-AUT-01` y `CP-AUT-02`.
2. **Backend / autenticación:** acordar un procedimiento seguro de expiración o invalidación de sesión en el Supabase compartido y ejecutar `EXT-AUT-01`.
3. **Identificación del build:** registrar rama, hash de commit, fecha y hora de la campaña, y versión del navegador para reproducibilidad.
4. **Evidencia de ruta protegida:** si se requiere prueba visual independiente, capturar la navegación desde `/inicio` sin sesión y la URL final `/login`.
5. **Trazabilidad formal:** vincular este registro con la clave real de Jira de HU-40 y con las incidencias que lleguen a confirmarse. Los bloqueos por falta de implementación no se contabilizan automáticamente como defectos.
6. **Dataset:** confirmar si se ejecutó la restauración HU-53. La autenticación observada usó las cuentas preexistentes de HU-52, lo cual es válido para estos casos sin afirmar que se restauraron los proyectos QA53.

## 6. Estado y recomendación de QA

**Estado:** ejecución parcial documentada.

Los casos originales `CP-AUT-03`, `CP-AUT-04` y `CP-AUT-05` presentan resultados favorables según las evidencias y observaciones reportadas. La sesión expirada continúa sin probarse; los dos casos de registro están bloqueados por HU-54.

**Decisión:** no declarar HU-40 completamente aprobada ni cerrar sus criterios de aceptación. El registro puede incorporarse a GitHub y someterse a revisión como resultado parcial, dejando pendientes y dependencias visibles. Su aprobación final requiere la reejecución de los casos faltantes o una decisión formal y documentada del responsable del proyecto.

