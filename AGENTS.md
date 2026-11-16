
# AGENTS.md — Estándares técnicos y de colaboración de Tasker

**Versión:** 1.0 — Propuesta para revisión
**Historia:** [SCRUM-22 / HU-15](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-22)
**Responsable:** Líder de desarrollo
**Aprobación:** Scrum Master, según la matriz RACI
**Periodo del proyecto:** 3 al 17 de noviembre de 2026

Este documento establece las convenciones técnicas y de colaboración que deben seguir los integrantes y agentes de IA que trabajen en Tasker.

Las historias de usuario y los criterios de aceptación registrados en Jira determinan el alcance funcional. Este documento complementa dichos requisitos, pero no los sustituye ni autoriza su modificación.

## 1. Propósito y contexto del proyecto

Tasker es una aplicación web para organizar proyectos y tareas académicas, desarrollada como parte de la asignatura Administración de Proyectos Informáticos (API115) de la Universidad de El Salvador.

### Tecnologías y herramientas

| Área | Tecnología |
| --- | --- |
| Frontend | Angular y TypeScript |
| Backend y autenticación | Supabase |
| Base de datos | PostgreSQL |
| Control de versiones | Git y GitHub |
| Planificación y seguimiento | Jira |
| Diseño UX/UI | [DESIGN.md](DESIGN.md) y prototipos aprobados |

El desarrollo se realizará mediante un único sprint, priorizando una aplicación funcional, segura, verificable y demostrable.

El alcance contempla autenticación, registro de usuarios, gestión de proyectos e integrantes, administración de tareas, tablero Kanban, cronograma, seguimiento del progreso y reportes.

Las funcionalidades se incorporarán progresivamente conforme a las historias aprobadas.

## 2. Organización del repositorio y nomenclatura

### 2.1. Estructura del proyecto

El repositorio utilizará la siguiente estructura objetivo:

```text
tasker-web/
├── frontend/
│   └── src/app/
│       ├── core/
│       ├── shared/
│       └── features/
├── supabase/
│   ├── migrations/
│   ├── scripts/
│   └── config.toml
├── docs/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── AGENTS.md
├── DESIGN.md
└── README.md
```

Esta estructura se completará progresivamente según las historias correspondientes.

**Responsabilidad de las carpetas:**

- `core/`: servicios generales, autenticación, guards y configuración.
- `shared/`: componentes, utilidades y elementos reutilizables.
- `features/`: funcionalidades organizadas por dominio.
- `supabase/migrations/`: migraciones SQL y políticas de seguridad.
- `supabase/scripts/seed-auth-users.py`: datos semilla para desarrollo (HU-52).
- `docs/`: documentación técnica complementaria.
- `.github/`: plantillas y configuraciones de colaboración.

**Reglas de organización:**

1. Agrupar los archivos relacionados con una funcionalidad.
2. Separar la presentación de la lógica de acceso a datos.
3. Evitar duplicación de código y dependencias innecesarias.
4. Mantener los componentes reutilizables en `shared/`.
5. Consultar [DESIGN.md](DESIGN.md) como referencia del sistema visual y el [README de recursos de marca](frontend/public/brand/README.md) para su uso, licencia y procedencia. Mantener las reglas de colores, tipografía y componentes en `DESIGN.md`, sin duplicarlas en estos estándares.
6. No modificar la estructura general sin justificarlo en el Pull Request.

### 2.2. Convenciones de nombres

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Clases, tipos e interfaces | PascalCase | `ProjectService`, `ProjectMember` |
| Variables y funciones | camelCase | `projectId`, `loadProjects()` |
| Constantes globales de configuración | UPPER_SNAKE_CASE | `MAX_PROJECT_NAME_LENGTH` |
| Archivos y carpetas | kebab-case | `project-detail.ts` |
| Selectores de componentes Angular | Prefijo `app-` | `app-project-card` |
| Tablas y columnas PostgreSQL | snake_case | `project_members`, `created_at` |
| Ramas Git | Clave Jira + descripción | `SCRUM-22-hu-15-definicion-de-estandares-tecnicos-en-agents-md` |

Se utilizará inglés para los identificadores técnicos y español para la documentación del proyecto, los mensajes de commits y las descripciones de Pull Requests.

Los nombres de archivos generados por Angular CLI deberán respetar las convenciones de la versión utilizada.

## 3. Estándares Angular y TypeScript

### 3.1. Desarrollo frontend

1. Utilizar componentes standalone.
2. Mantener TypeScript en modo estricto (`strict`).
3. Evitar `any`; preferir tipos explícitos o `unknown` con validación.
4. Utilizar servicios para centralizar la comunicación con Supabase.
5. Preferir formularios reactivos para operaciones que requieran validación.
6. Implementar estados de carga, error y contenido vacío cuando corresponda.
7. Gestionar correctamente las suscripciones y recursos asíncronos.
8. Reutilizar componentes y estilos existentes antes de crear nuevos.
9. Aplicar los lineamientos aprobados por UX/UI.
10. Evitar lógica de negocio compleja dentro de las plantillas HTML.

### 3.2. Dependencias y configuración

- Instalar únicamente dependencias necesarias y compatibles.
- Justificar las nuevas dependencias en el Pull Request.
- Versionar `package.json` y `package-lock.json`.
- No modificar versiones de paquetes sin comprobar su compatibilidad.
- Mantener la configuración específica de cada entorno separada del código funcional.

### 3.3. Verificaciones

Una vez inicializado Angular, comprobar que la aplicación compile:

```bash
cd frontend
npm ci
npm run build
```

Ejecutar también las pruebas y herramientas de análisis que estén configuradas en el proyecto.

No declarar como ejecutada ninguna prueba que no se haya realizado.

## 4. Estrategia de ramas y protección

### 4.1. Ramas base

El repositorio utiliza tres ramas permanentes:

| Rama | Propósito |
| --- | --- |
| `main` | Versión estable, validada y destinada al despliegue. |
| `develop` | Integración de funcionalidades y correcciones. |
| `testing` | Validación de versiones integradas mediante QA. |

Las tres ramas cuentan con reglas de protección creadas en GitHub.

### 4.2. Restricciones obligatorias

Las siguientes son políticas del equipo para las tres ramas base:

1. **Pull Request obligatorio:** no realizar pushes directos a `main`, `develop` o `testing`.
2. **Aprobación:** solicitar al menos una aprobación de un revisor distinto del autor, con permisos de escritura o superiores.
3. **Nuevos cambios:** si se modifica un PR después de su aprobación, deberá revisarse nuevamente. GitHub deberá configurarse para invalidar aprobaciones anteriores.
4. **Conversaciones:** resolver los comentarios de revisión pendientes antes de integrar cambios.
5. **Administradores:** no deben omitir las protecciones ni utilizar sus permisos para evitar las revisiones.
6. **Historial:** prohibido utilizar `git push --force` sobre ramas base.
7. **Eliminación:** prohibido eliminar las ramas base.
8. **Verificaciones automáticas:** incorporar requisitos de CI/CD cuando existan workflows confiables configurados.

Estas políticas deben reflejarse en las reglas de GitHub, disponibles en:

`Settings → Branches → Branch protection rules`

La existencia de las tres reglas está confirmada. También se verificó que `develop` exige una aprobación antes del merge. Las demás opciones deben comprobarse individualmente en GitHub para garantizar que coincidan con lo documentado.

### 4.3. Flujo de integración

```text
Rama de historia
      |
      | PR + revisión
      v
   develop
      |
      | PR de promoción
      v
   testing
      |
      | Validación QA
      v
     main
```

Reglas del flujo:

- Las ramas de historias se crean a partir de `develop`.
- Las funcionalidades y correcciones se integran mediante PR hacia `develop`.
- La promoción a `testing` se realiza mediante un PR independiente.
- QA valida la versión integrada en `testing` y documenta sus resultados.
- Una versión validada se promueve a `main` mediante otro PR.
- No se permite integrar funcionalidades directamente a `main` o `testing`.
- Las correcciones detectadas durante QA deben regresar a `develop` y volver a probarse antes de su promoción.

Los PR de promoción entre ramas base son excepciones a la regla de un PR por historia de usuario.

### 4.4. Creación de ramas de trabajo

Antes de crear una rama, actualizar `develop`:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c SCRUM-XX-descripcion
```

El nombre debe contener la clave real de Jira y una descripción identificable.

Para correcciones urgentes sobre `main`, se podrá utilizar una rama `hotfix/` creada desde `main`, con incidencia registrada, revisión obligatoria y posterior sincronización con `develop` y `testing`.

Ninguna excepción permite omitir arbitrariamente las revisiones o las reglas de protección.

## 5. Commits y Pull Requests

### 5.1. Convención de commits

Se utilizará Conventional Commits:

```text
tipo(alcance): descripción breve (SCRUM-N)
```

| Tipo | Propósito |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de defectos |
| `docs` | Documentación |
| `chore` | Configuración y mantenimiento |
| `refactor` | Reestructuración sin alterar comportamiento |
| `test` | Incorporación o actualización de pruebas |
| `style` | Cambios de formato |
| `build` | Compilación y dependencias |
| `ci` | Integración continua |

Ejemplos:

```text
docs(standards): definir estandares tecnicos (SCRUM-22)
feat(auth): implementar registro de usuarios (SCRUM-XX)
fix(tasks): corregir validacion de fechas (SCRUM-XX)
```

Los commits deben describir los cambios realizados y estar relacionados con la historia correspondiente.

### 5.2. Convención de Pull Requests

**Regla general: un Pull Request por historia de usuario.**

El título seguirá exactamente este formato:

```text
[SCRUM-XX] HU-XX - Nombre de la historia de usuario
```

Ejemplo:

```text
[SCRUM-22] HU-15 - Definición de estándares técnicos en AGENTS.md
```

**Procedimiento:**

1. Crear la rama desde `develop`.
2. Desarrollar los cambios relacionados con la historia.
3. Registrar uno o varios commits en la misma rama.
4. Crear el PR hacia `develop` usando `.github/PULL_REQUEST_TEMPLATE.md`.
5. Mantenerlo en estado Draft mientras existan criterios pendientes.
6. Actualizar la descripción y evidencias conforme avance el trabajo.
7. Marcarlo Ready for review cuando esté listo para revisión.
8. Solicitar la aprobación de un integrante distinto del autor.
9. Integrar los cambios una vez cumplidos los criterios y las verificaciones correspondientes.

Un PR puede contener varios commits y recibir correcciones antes de ser aprobado. No se debe crear un nuevo PR por cada commit.

Si una historia requiere dividirse en varios PR, debe justificarse y registrarse la excepción en Jira.

Los PR de promoción entre ramas base deben identificarse como tales y especificar los cambios y versiones que incluyen.

### 5.3. Revisión de código

El revisor deberá comprobar, según el tipo de cambio:

- Correspondencia con la historia y sus criterios de aceptación.
- Calidad, claridad y organización del código.
- Cumplimiento de los estándares del proyecto.
- Ausencia de credenciales o información sensible.
- Manejo de errores y validaciones necesarias.
- Resultados de compilación y pruebas pertinentes.
- Actualización de la documentación cuando corresponda.

La aprobación de un PR confirma la revisión realizada, pero no sustituye las verificaciones funcionales ni la aceptación de la historia.

## 6. Supabase, PostgreSQL y seguridad

### 6.1. Base de datos y migraciones

1. Utilizar PostgreSQL mediante Supabase.
2. Mantener los cambios de esquema en migraciones SQL versionadas.
3. Crear migraciones utilizando Supabase CLI.
4. Registrar tablas, relaciones, restricciones, índices y políticas RLS en las migraciones correspondientes.
5. Evitar cambios manuales de esquema en el dashboard remoto sin su correspondiente versionado.
6. Aplicar cambios al entorno compartido de forma coordinada y después de su revisión.
7. Mantener actualizado el diccionario de datos de HU-18.

Las migraciones deben ser verificables y no deben aplicarse simultáneamente por varios integrantes al mismo entorno.

### 6.2. Autenticación y autorización

- Utilizar Supabase Auth para la autenticación.
- Aplicar Row Level Security (RLS) en las tablas expuestas mediante la API.
- Definir políticas según el propietario, los integrantes y los permisos del proyecto.
- Comprobar los permisos en PostgreSQL, no solo mediante controles de Angular.
- No utilizar metadatos editables por el usuario como fuente de privilegios.
- Validar casos de acceso permitido y denegado.

**Política de contraseñas:** antes de implementar HU-54, el equipo backend deberá verificar y documentar aquí la política configurada en Supabase Auth, incluyendo requisitos de longitud, complejidad y confirmación de correo cuando corresponda. No se asumirán valores que no hayan sido configurados.

**Autorización para modificar estados de tareas (HU-31 y HU-33):**

- Solo el integrante asignado a una tarea puede modificar su estado, incluido el dueño del proyecto cuando sea el asignado.
- Los estados permitidos son `Por hacer`, `En progreso` y `Completada`.
- El cambio mediante drag and drop debe respetar las mismas restricciones de HU-31.
- Los usuarios que no pertenecen al proyecto no pueden modificar estados.
- Los permisos deben verificarse en la interfaz y mediante políticas RLS en Supabase.
- Los cambios deben persistirse en la base de datos y reflejarse en las vistas correspondientes.
- Si falla una operación de drag and drop, se debe informar al usuario y restaurar el estado anterior.

### 6.3. Credenciales y datos de prueba

**Prohibido publicar:**

- Contraseñas de PostgreSQL.
- Claves `service_role` o claves secretas de Supabase.
- Tokens de acceso privados.
- Archivos `.env` con secretos.
- Credenciales reales o información privada de usuarios.

La URL de Supabase y su clave pública *publishable* pueden utilizarse en Angular, siempre que las políticas RLS estén correctamente configuradas.

Los datos semilla de desarrollo (HU-52) y los datos de prueba de QA (HU-53) deben ser reproducibles, mantenerse diferenciados y no cargarse en producción.

## 7. Calidad, pruebas y Definition of Done

### 7.1. Criterios generales de calidad

Cada funcionalidad debe:

1. Cumplir los criterios de aceptación de Jira.
2. Compilar y ejecutarse correctamente.
3. Manejar errores y validaciones relevantes.
4. Respetar las restricciones de acceso.
5. Superar las pruebas correspondientes.
6. Integrarse sin provocar regresiones conocidas.
7. Mantener la documentación necesaria actualizada.

### 7.2. Definition of Done (propuesta)

Una historia de desarrollo se considera completada cuando:

- Se implementan sus requisitos acordados.
- Se verifican sus criterios de aceptación.
- El PR ha sido revisado e integrado.
- Se ejecutan y documentan las pruebas pertinentes.
- No quedan defectos críticos conocidos sin resolver.
- Las evidencias están registradas en Jira.
- Se obtiene la validación que corresponda según el proceso del equipo.

Para historias documentales o de configuración, se aplican sus criterios específicos y no se exigen pruebas funcionales que no correspondan.

Las historias no deben marcarse como completadas únicamente por tener código escrito o un PR aprobado.

### 7.3. Validación QA

- QA utilizará `testing` para verificar versiones integradas.
- Los defectos se registrarán en Jira.
- Las correcciones se incorporarán mediante PR.
- Las funcionalidades corregidas deberán volver a probarse.
- La versión destinada a `main` debe corresponder a una versión validada por QA.

No se deben añadir cambios no validados a la versión candidata después de la aprobación final de QA.

## 8. Gestión de cambios y documentación

### 8.1. Jira como fuente de seguimiento

Jira será el registro principal de:

- Historias de usuario y criterios de aceptación.
- Responsables y estado de las actividades.
- Defectos e impedimentos.
- Solicitudes de cambio.
- Evidencias de desarrollo y pruebas.
- Decisiones relevantes del equipo.

Los cambios de alcance deben documentarse y contar con la validación del Product Owner cuando corresponda.

### 8.2. Gestión de defectos

Una incidencia debe incluir:

- Descripción del problema.
- Pasos para reproducirlo.
- Resultado esperado y resultado obtenido.
- Entorno afectado.
- Evidencia disponible.
- Responsable y prioridad.

Los impedimentos que bloqueen el trabajo deben comunicarse oportunamente al Scrum Master y a los responsables técnicos.

### 8.3. Cambios técnicos

Los cambios que afecten la arquitectura, las dependencias, las reglas de protección, la base de datos o los estándares compartidos deberán justificarse en Jira o en el PR correspondiente.

Las decisiones que afecten a todo el equipo deberán comunicarse por el canal acordado.

## 9. Agentes de IA y mantenimiento de estándares

### 9.1. Uso de agentes de IA

Los agentes de IA están sujetos a las mismas reglas de desarrollo, seguridad y colaboración establecidas en este documento.

**Pueden:**

- Analizar historias y proponer soluciones.
- Crear o modificar código dentro de una rama autorizada.
- Preparar commits y Pull Requests.
- Ejecutar verificaciones disponibles.
- Detectar problemas y documentar recomendaciones.

**No pueden, sin autorización humana explícita:**

- Integrar Pull Requests.
- Modificar las reglas de protección del repositorio.
- Cambiar requisitos o criterios de aceptación.
- Alterar configuraciones sensibles de Supabase.
- Realizar despliegues o acciones administrativas.

Las prohibiciones generales sobre push directo, force push, eliminación de ramas base y omisión de revisiones también se aplican a los agentes, incluso si disponen de permisos técnicos suficientes.

Los agentes no deben declarar como realizadas pruebas, aprobaciones o integraciones que no hayan ocurrido.

Cada desarrollador es responsable de comprender, revisar y comprobar el código generado con asistencia de IA.

### 9.2. Actualización de AGENTS.md

Cualquier modificación de estos estándares deberá:

1. Estar justificada y asociada a una actividad de Jira.
2. Realizarse desde una rama de trabajo.
3. Documentarse mediante Pull Request hacia `develop`.
4. Recibir la revisión correspondiente.
5. Comunicarse al equipo si modifica su forma de trabajo.

Según la matriz RACI del proyecto, el Scrum Master es responsable final de aprobar HU-15.

Hasta esa aprobación, este documento permanece como propuesta técnica.