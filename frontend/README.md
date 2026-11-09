# Tasker — Frontend / HU-16

Base Angular con tema Orbit Dark, siguiendo el DESIGN.md proporcionado. Incluye rutas Inicio, Proyectos, Tareas y 404, configuración de entornos y componentes Zard. La autenticación (HU-19/HU-20) y la creación y edición de proyectos (HU-21/HU-24) usan Supabase.

## Requisitos y ejecución

Node.js 24.15 o superior dentro de la rama 24; npm. Se verificó con Node 24.22.1.

Desde la raíz del repositorio:

```bash
cd frontend
npm ci
npm start
```

Abrir http://localhost:4200. No requiere Angular CLI global. Iniciar sesión y Proyectos usan el Supabase configurado en `environment.development.ts`, con la migración inicial aplicada y los usuarios de prueba de [docs/test-users.md](../docs/test-users.md).

## Entornos independientes

| Comando             | Configuración                                 |
| ------------------- | --------------------------------------------- |
| `npm start`         | `src/environments/environment.development.ts` |
| `npm run build:dev` | `src/environments/environment.development.ts` |
| `npm run build`     | `src/environments/environment.ts`             |

El reemplazo de desarrollo se define en `angular.json`. Cada ambiente se configura de manera independiente: los valores no se copian ni se sincronizan automáticamente. Mantener `production: false` en desarrollo y `production: true` en producción.

Variables: `production`, `appName`, `supabaseUrl` y `supabasePublishableKey`. Las de Supabase permanecen vacías en esta entrega. Al integrar estos archivos, conservar los valores públicos ya configurados por el equipo en cada ambiente. Nunca incluir contraseñas, claves secretas o `service_role`: el navegador recibe estos valores. No se cargan archivos `.env` automáticamente.

Para publicar, ejecutar `npm run build` y servir `dist/tasker-frontend/browser/`. Configurar fallback a `index.html` para las rutas Angular. Cambiar valores de producción requiere recompilar y volver a publicar.

## Arquitectura visual

- `src/styles.css`: tokens Orbit Dark, mapeo Tailwind, fuentes locales y composición adaptable.
- `src/app/shared/components/`: componentes fuente Zard (button, card, badge y empty) y encabezado de página.
- `src/app/shared/core/` y `shared/utils/`: infraestructura Zard y utilidades.
- `src/app/layouts/main-layout/`: navegación, cabecera y pie.
- `src/app/features/`: Inicio, Tareas y 404.
- `components.json`: aliases y familia de iconos Lucide.
- `public/brand/fonts/`: Geist, Geist Mono, licencia y procedencia.

## Fuentes técnicas

- https://zardui.com/docs/cli
- https://zardui.com/docs/components-json
- https://zardui.com/docs/theming
- https://www.npmjs.com/package/geist/v/1.9.1
