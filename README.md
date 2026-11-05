# Tasker

**Sistema de gestión de proyectos y tareas académicas**

Proyecto académico de la asignatura **Administración de Proyectos Informáticos (API115)**, Universidad de El Salvador. Tasker está dirigido a estudiantes universitarios que necesitan organizar proyectos, integrantes, tareas, fechas de entrega y avances.

> **Estado:** configuración inicial y desarrollo en curso. Este README documenta el alcance previsto, no afirma que las funcionalidades ya estén implementadas.

## Objetivo del producto

Desarrollar una aplicación web que permita organizar el trabajo académico colaborativo y consultar el progreso de los proyectos desde una interfaz accesible.

### Funcionalidades previstas

- Registro, inicio y cierre de sesión.
- Creación y administración de proyectos académicos.
- Gestión de integrantes y asignación de responsables a tareas.
- Creación, consulta, edición y eliminación de tareas.
- Seguimiento mediante tablero Kanban y cronograma.
- Cálculo del avance y generación e impresión de reportes.

Las historias de usuario, criterios de aceptación y prioridades se administran en **Jira**. Los documentos del backlog y la planificación del equipo son las referencias de alcance.

## Tecnologías acordadas

| Área | Tecnología |
| --- | --- |
| Frontend | Angular y TypeScript |
| Backend como servicio | Supabase |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth |
| Control de versiones | Git y GitHub |
| Planificación | Jira |

Se prevé usar **un solo repositorio** para el código Angular, las migraciones y la documentación. Supabase opera los servicios en su plataforma, GitHub conserva los archivos que definen los cambios de esquema y de código.

## Estructura prevista del repositorio

Al iniciar el desarrollo se incorporarán las carpetas pertinentes:

```text
tasker-web/
├── frontend/                # Aplicación Angular (HU-16)
├── supabase/                # Configuración y migraciones (HU-17/HU-18)
│   └── migrations/
├── docs/                    # Documentación técnica del proyecto
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── AGENTS.md                # Estándares de desarrollo (HU-15)
└── README.md
```

**Nota:** las carpetas de Angular y Supabase solo aparecerán después de que las historias correspondientes se implementen. No deben crearse vacías para simular entregables.

**Diseño y marca:** [DESIGN.md](DESIGN.md) es la referencia del sistema de diseño de Tasker. Los [recursos oficiales de marca](frontend/public/brand/README.md) incluyen logotipo, isotipo y fuentes.

## Organización del trabajo

El proyecto tiene **un sprint**, del **3 al 17 de noviembre de 2026**, con evaluación el **17 de noviembre**.

- **Product Owner:** docente de la asignatura, proporciona requisitos y revisa las planificaciones en Jira.
- **Scrum Master:** Nery.
- **Líder de desarrollo:** Karen.
- **Frontend:** Elías, David y Jairo.
- **Backend:** Medrano, Jaime y Kevin C.
- **UX/UI:** Adonay.
- **QA:** Gerson.
- **Integración y documentación técnica:** Kevin L.

Las Daily Scrum se realizan de lunes a viernes de **9:30 a 9:45 p. m.**, el desarrollo también puede realizarse durante fines de semana.

## Flujo de ramas y Pull Requests

Las ramas base acordadas son:

| Rama | Propósito |
| --- | --- |
| `main` | Versión estable y candidata a entrega |
| `develop` | Integración del trabajo de desarrollo |
| `testing` | Validación de una versión integrada por QA |

Cada integrante crea una rama de trabajo **a partir de `develop`**, relacionada con una actividad de Jira. Ejemplo:

```bash
git switch develop
git pull origin develop
git switch -c SCRUM-22-hu-15-definicion-de-estandares-tecnicos-en-agents-md
```

Flujo de integración:

1. **Rama de tarea → `develop`:** Pull Request y revisión de otro integrante.
2. **`develop` → `testing`:** Pull Request para que QA valide la versión integrada.
3. **`testing` → `main`:** Pull Request después de validar el mismo conjunto de cambios.
4. Los defectos se corrigen en una rama creada desde `develop` y recorren nuevamente el flujo.

No se realizan cambios directos a las ramas base. Las normas técnicas, criterios de revisión y excepciones están en [`AGENTS.md`](AGENTS.md) cuando dicho archivo quede integrado.

## Cómo ejecutar el proyecto (una vez inicializado)

Cuando HU-16 haya creado el proyecto Angular y su `package.json`, los desarrolladores podrán ejecutar en `frontend/`:

```bash
npm ci
npm start
```

Los pasos definitivos para vincular Supabase, ejecutar migraciones y configurar los entornos se documentarán después de HU-17 y HU-18. **No se deben publicar contraseñas o claves de administración.**

## Seguridad y repositorio público

El código fuente es público por decisión del equipo, **pero la información de los usuarios no lo es**.

- Nunca subir contraseñas, claves secretas de Supabase, credenciales administrativas, tokens ni archivos `.env` privados.
- La URL del proyecto y la clave *publishable* de Supabase son valores previstos para clientes públicos; su utilización exige políticas **Row Level Security (RLS)** correctas.
- Utilizar datos ficticios para demostraciones y pruebas. No publicar datos personales reales.
- Todo cambio de estructura de base de datos debe quedar versionado como migración y revisarse antes de aplicarse a un entorno compartido.

**Repositorio público no equivale a licencia abierta.** Cualquier licencia de reutilización del código deberá acordarse con el equipo antes de añadirla.

## Seguimiento y referencias

- [SCRUM-21 — HU-14: repositorios de GitHub](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-21)
- [SCRUM-22 — HU-15: estándares en AGENTS.md](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-22)

**Estado de la documentación:** inicial, se actualizará conforme se completen historias, pruebas y despliegue.
