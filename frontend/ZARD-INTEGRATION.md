# Integración Zard

Instalado con `zard-cli init` y `zard-cli add button card badge empty` desde el registro oficial https://zardui.com/r. Los componentes se distribuyen como código fuente, no como una dependencia runtime llamada zard.

HU-21 (SCRUM-74) agrega `dialog` y `textarea`, copiados sin modificaciones de las entradas `dialog.json` y `textarea.json` del registro oficial (repositorio `zard-ui/zardui`, commit `f3de03a`) y formateados con Prettier. No agregan dependencias: usan `@angular/cdk` y `@ng-icons/lucide`, ya instalados.

Configuración: `components.json`; estilos: `src/styles.css`; proveedor: `provideZard()`; alias `@/*` en `tsconfig.json`.

Versiones exactas de dependencias en el lockfile:

- `@angular/cdk`: `22.2.6`
- `@angular/core`: `22.2.4`
- `@ng-icons/core`: `36.1.0`
- `@ng-icons/lucide`: `36.1.0`
- `tailwindcss`: `4.3.4`

