---
version: alpha
name: Tasker — Orbit Dark sobre Zard
description: "Referencia de diseño de Tasker: identidad oficial, tema Orbit Dark, componentes Zard e iconografía mediante ng-icons."
---

# Tasker — sistema de diseño

## Overview

**Tasker combina su identidad oficial con componentes Zard, el tema Orbit Dark e iconografía mediante ng-icons.**
Esta referencia guía el diseño de proyectos, equipos y tareas con claridad y densidad moderada, sin crear una biblioteca paralela a Zard.

### Alcance de la referencia

| Área | Criterio de uso |
| --- | --- |
| Identidad | Logo A, Orbit Dark, paleta de marca, Geist y pesos oficiales; véanse los [recursos de marca](frontend/public/brand/README.md). |
| Sistema visual | Los colores funcionales, la tipografía y las composiciones de muestra cuentan con validación visual. No modifican la paleta del logo. |
| Composición de producto | Los layouts, la navegación/sidebar y los flujos no mostrados son orientación de diseño, no soluciones validadas en todos los contextos. |
| Implementación | Cotejar stack, versiones, API, tokens y configuración de iconos con el frontend real. La muestra visual no acredita integración, autenticación, persistencia ni accesibilidad del producto. |
| Decisiones de producto | Solo integrantes asignados a la tarea pueden cambiar su estado o moverla entre columnas; el propietario también debe estar asignado (HU-31/HU-33). Los límites de autenticación siguen pendientes de definición por sus responsables; no bloquean la entrega visual. |

El alcance funcional corresponde a [SCRUM-14 / HU-08](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-14) y a las historias citadas en Components.
El documento usa el formato [Google alpha](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md); `version: alpha` identifica la versión del formato.

### Referencias técnicas

- [Guía oficial Zard](https://github.com/zard-ui/zardui/blob/master/skills/zard/SKILL.md), [Button y fuente publicada](https://zardui.com/docs/components/button.md) y [Theming](https://zardui.com/docs/theming.md).
- [Reglas de iconos de Zard](https://github.com/zard-ui/zardui/blob/master/skills/zard/rules/icons.md).

Antes de implementar, leer `components.json`, los componentes instalados y la documentación de su versión.
Verificar aliases, `icons`, API y tokens; no reconstruirlos de memoria ni importar componentes inexistentes.
Las referencias no prescriben instalaciones ni cambios de dependencias.

Lectura sugerida: roles y contraste → primitivas y composiciones → decisiones funcionales pendientes.
Los cálculos de contraste y la validación visual de la muestra no sustituyen la verificación de los contextos renderizados del producto.

### Marca que se conserva

Usar [logo horizontal](frontend/public/brand/tasker-logo-dark.svg) o [isotipo](frontend/public/brand/tasker-symbol.svg) oficiales.
Conservar trazados del wordmark, proporciones, capas y degradados; no reconstruirlos con Geist ni extenderlos a controles.
Guía: logo ≥120 px CSS, isotipo ≥24 px de alto, margen ≥0,5x; x ≈55 unidades de altura de mayúscula del maestro.
Alt identificativo «Tasker»; isotipo decorativo sin nombre duplicado cuando haya texto adyacente.
Orbit Dark no exige tema claro ni selector de tema.

## Colors

### Identidad y roles semánticos

Anclas HU-07: Void **#08090A**, Carbon **#0F1011**, Obsidian **#161718**, Graphite **#23252A**,
Fog **#8A8F98**, Mist **#D0D6E0**, blanco suavizado **#F7F6F5**, lavanda frontal **#7276FC**.
El violeta posterior **#4C4ACD** y degradados permanecen en los SVG aprobados.
No se modifica esa paleta: el lavanda funcional **#9296FF** aporta luminosidad para soportar variantes con alfa.
Coral técnico HU-07 #EB5757 no es marca aprobada; usar **#FFB3B3** para texto destructivo sobre tintes nativos en los contextos indicados abajo.
Estos roles funcionales no recolorean el logo ni garantizan contraste en contextos no comprobados.

```yaml
colors:
  background: "#08090A"
  foreground: "#F7F6F5"
  card: "#0F1011"
  card-foreground: "#F7F6F5"
  popover: "#161718"
  popover-foreground: "#F7F6F5"
  primary: "#9296FF"
  primary-foreground: "#08090A"
  secondary: "#23252A"
  secondary-foreground: "#F7F6F5"
  muted: "#23252A"
  muted-foreground: "#D0D6E0"
  accent: "#23252A"
  accent-foreground: "#F7F6F5"
  destructive: "#FFB3B3"
  destructive-foreground: "#08090A"
  border: "#23252A"
  input: "#8A8F98"
  ring: "#F7F6F5"
```

Cada clave equivale al rol CSS `--<clave>` de Zard; no son nombres de clases. El YAML no genera CSS por sí solo.
`--muted` es superficie; **`--muted-foreground` es texto secundario**, aquí Mist para tolerar rellenos de campos.
`--input` sirve tanto de borde como de relleno oscuro al 30 %; no tratarlo solo como contorno.
`--destructive-foreground` conserva el par semántico, pero la fuente consultada no lo consume en el botón destructivo.
No se añaden tokens de gráficos ni sidebar sin necesidad; si se compone `z-sidebar`, revisar sus roles separados.
Una exportación Google no configura automáticamente `@theme inline` ni garantiza equivalencia con Zard.

### Contraste: supuestos y límites

Cálculo offline WCAG sobre sRGB, mezcla alfa por canal, sin otros velos, sobre Void/Carbon/Obsidian.
Los pares opacos declarados en Components y los pares semánticos de texto se contrastan contra **4,5:1**.
No se presupone AA renderizado: comprobar el CSS compilado, espacio de mezcla y fondo efectivo en la versión instalada.

| Uso de la fuente consultada | Aplicación y comprobación aritmética |
| --- | --- |
| Primario | `bg-primary text-primary-foreground`; el hover `/80` está limitado por `[a]` en la fuente. Void sobre mezcla al 80 %: mínimo 5,16:1 en las tres superficies. No inventar ese hover para todos los botones. |
| Destructivo | **Tinte**, no botón coral sólido: `text-destructive` sobre `bg-destructive/10`; oscuro `/20`, hover oscuro `/30`. Contraste mínimo de las tres superficies: 8,65 / 6,73 / 5,11:1 respectivamente. |
| Campos | Fog al 30 % sobre esas superficies: texto principal ≥10,41:1, texto Mist ≥7,69:1; borde Fog frente al relleno ≥3,45:1. |
| Foco base | Blanco suavizado al 50 %: ≥4,96:1 frente a esas superficies y ≥3,10:1 frente al relleno input/30 adyacente; confirmar geometría y mezcla reales. |
| Separación | Graphite es decorativo: no cumple necesariamente 3:1 como límite necesario de control. |

Ámbito comprobado del destructivo: acciones sobre canvas, card o popover, **no dentro de rellenos secondary/accent**.
Sobre Graphite el hover destructivo al 30 % daría 4,39:1: no usar esa composición sin nueva comprobación/ajuste local.
No certificar foco por mapear `--ring`: el anillo nativo lleva `/50` y la variante destructiva original usa otro token; aplicar la excepción siguiente solo tras cotejar la fuente instalada y sus contextos.
Si falla un contexto, ajustar primero el token; solo después documentar una excepción local mínima, sin crear otra biblioteca.

### Excepción acotada: foco destructivo

Los overrides originales de foco destructivo de Zard pueden conservar un anillo coral con contraste insuficiente, aunque se configure `--ring`.
Cotejar `button.variants.ts` con la fuente instalada: en los contextos afectados, retirar únicamente los **tres overrides destructivos de foco** para heredar
`focus-visible:border-ring`, el anillo nativo `ring/50` y su anchura de **3 px**.
Conservar fondo/tintes, texto, hover, geometría y demás variantes; no aplicar un override global.
Verificar con teclado el borde, la mezcla, la geometría y las adyacencias renderizadas reales. Esta instrucción no implica que el ajuste ya exista en el producto ni certifica AA.
Una regeneración upstream con overwrite puede perder la excepción: revisarla al actualizar.
No comunicar estado, vencimiento o selección únicamente mediante color.

## Typography

Usar Geist Sans (`Geist`) y Geist Mono (`Geist Mono`), fuentes oficiales HU-07; pesos 400/500/600/700.
[Procedencia](frontend/public/brand/fonts/font-provenance.json) y [SIL OFL 1.1](frontend/public/brand/fonts/LICENSE.txt).
No instalar fuentes del sistema ni sustituir el wordmark trazado.
Los archivos se distribuyen en `frontend/public/brand/fonts/`. Para utilizarlos, servir `public/` como recursos estáticos y declarar `@font-face` con sus rutas, familias y pesos en el CSS de la aplicación; disponer de los archivos no activa las fuentes automáticamente.
La guía de marca establece lectura de 15–16 px; los siguientes roles corresponden al contenido de aplicación, no a overrides universales de controles.

```yaml
typography:
  title:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  section:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
```

Título de página → sección → cuerpo → metadatos; encabezados semánticos, no solo negrita.
Heredar la tipografía propia de las variantes Zard bajo Geist; comprobar legibilidad y zoom antes de cualquier excepción.
Mono para identificadores como TK-042, no párrafos. Truncar solo si el contenido completo sigue accesible.

## Layout

**Orientación para la composición de aplicación**, no padding interno ni tamaños de primitivas Zard:

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 48px
```

- Contenedor de lectura/formularios hasta 640 px; contenido general hasta 1200 px, sujetos a contenido real.
- Desde 1024 px: navegación lateral propuesta de 240 px, principal flexible y margen 32 px.
- Entre 640 y 1023 px: margen 24 px y navegación compacta; debajo, margen 16 px y una columna.
- Navegación compacta nombrada, estado expandido y rutas esenciales accesibles; no ocultar funcionalidades.
- Separación entre secciones/grupos/campos: 32/24/16 px; usar `gap`, no alterar anatomía nativa del campo.
- Kanban: columnas propuestas desde 280 px y desplazamiento localizado; tablas/cronograma con región nombrada.
- Verificar zoom, reflow y tamaños de objetivo según WCAG 2.2; elegir `zSize` adecuado antes de excepciones de área interactiva.

Estos umbrales son hipótesis de layout. Alturas, padding e iconos dentro de controles los gobierna la versión instalada.

## Elevation & Depth

Orbit Dark se expresa mediante canvas Void, card Carbon y popover Obsidian, más espacio y títulos.
Usar overlay, sombras, apilamiento y transiciones nativos de Zard; no imponer velo, sombra o z-index alternativos globales.
Verificar contraste de límites necesarios, foco no oculto y que solo el panel activo reciba interacción.
No inferir estilos de interfaz del SVG: sin glass, glows ni degradados decorativos nuevos.
Los degradados aprobados del logo se conservan, no son una prohibición genérica de marca.

## Shapes

Heredar `--radius` y derivados Zard; no reutilizar como mandato los radios históricos de HU-07 por componente.
Referencia upstream consultada: base **0.625rem**; a raíz de 16 px, sm/md/lg/xl = **6/8/10/14 px**.
Son valores de referencia de la fuente, no constantes de marca ni evidencia del frontend destino.
Elegir `zShape` y variantes antes de clases; no añadir un segundo juego de radios a tarjetas, campos o diálogos.
No modificar las curvaturas del isotipo. La selección requiere marca/texto además del relleno.

## Components

**Zard es la base de componentes de Tasker.** Componer lo existente antes de inventar primitivas.
El YAML siguiente solo registra pares opacos; el tinte destructivo y los campos con alfa se describen arriba, no como superficies sólidas ficticias.
No sustituye las variantes ni prescribe dimensiones o interacción propias.

```yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
  popover:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
```

### Primitivas, anatomía y estados

| Necesidad | Base documentada y responsabilidad de uso |
| --- | --- |
| Acciones | `z-button` sobre `button` nativo para acciones o `a` para navegación. `zType`: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; elegir `zSize`/`zShape` reales. No imponer alturas, padding ni subrayado propios a todas las variantes. |
| Carga / disabled | Usar `zLoading` y `zDisabled`, conservar etiqueta y evitar doble envío; anunciar «Guardando…» mediante estado accesible/`aria-busy` donde corresponda. No rehacer el spinner. La opacidad nativa 50 % no es automáticamente infracción: los controles inactivos están exentos de contraste. |
| Formularios | `input[z-input]`, `textarea[z-textarea]`; `z-field-group`, `z-field`, `z-field-label`, `z-field-description`, `z-field-error`. Mantener API Angular existente: Signal, Reactive o template-driven; sin migrarla por esta guía. |
| Validación | Label visible, obligatoriedad y ayuda/error asociados con `aria-describedby`; `data-invalid` en campo y `aria-invalid` en control. Conservar valores; validar al enviar y corregir tras error; resumen enfocable cuando proceda. No inventar límites ni usar placeholder como label. |
| Tarjetas | Componer `z-card` con header/title/content/footer de Zard. Proyecto: título enlazado, descripción, fechas, progreso y acciones separadas. Tarea: nombre, responsables, entrega y vencimiento textual; detalle con fechas/estado/complejidad si definida. Sin interacciones anidadas. |
| Crear / editar | `z-dialog` con título, descripción, formulario y footer cancelar/guardar; editar precarga valores. Declaración `[(zVisible)]` o servicio del mismo panel según versión; no overlay rehecho con booleano y `@if`. Sin ancho fijo añadido por esta guía. |
| Confirmación | `z-alert-dialog`: objeto y alcance de eliminación acordado, foco inicial seguro en Cancelar, sin prometer recuperación. Verificar teclado, Escape/backdrop, trap y retorno de foco nativos. Política de descarte de cambios pendiente: nunca pérdida silenciosa. |
| Selección | `z-select`/`z-combobox` o composición con `z-checkbox` según capacidades verificadas para uno/varios responsables. Búsqueda, selección marcada y retirada nombrada; no inventar una API multiselect. |
| Navegación | Primitivas Zard apropiadas (`z-breadcrumb`, navegación/sidebar si se necesitan); ruta activa y selección anunciadas. Kanban/cronograma conservan proyecto y tareas. Roles de sidebar se revisan al elegir esa composición. |
| Estado y feedback | `z-badge`, `z-progress`, `z-skeleton`, `z-empty`, `z-table`; vacío/carga/error/reintento según contexto. Críticos no solo en toast. Etiquetas exactas **Por hacer**, **En progreso**, **Completada**; vencida no es cuarto estado. |

Nombres de composición, imports y capacidades deben cotejarse con el código instalado en el destino; esta tabla no ordena instalar todo el catálogo.
La fuente Button consultada usa `zSize="default"` con `h-8` y `zShape="default"` con `rounded-md`: referencia mutable, no mandato de tamaños para el destino.
En tarjetas de altura compartida, usar `mt-auto` en los footers cuando sea necesario alinearlos al pie. Es un ajuste de composición: conservar geometría y radio nativos de Zard, sin convertirlo en regla universal de primitivas.
Zard no implementa permisos, persistencia, Kanban/Gantt, fórmulas ni reportes del producto.

### Composiciones y reglas funcionales de las historias

- **Acceso:** login con correo y contraseña, «Crear cuenta», error de credenciales, carga y entrada al dashboard; cierre de sesión retorna al login.
- **Registro:** cuatro campos: **nombre completo, correo electrónico, contraseña y confirmación de contraseña**. Obligatorios, formato de correo y coincidencia; no inventar mínimo ni política de contraseña.
- Confirmación por correo y retorno al login o acceso directo dependen de Supabase Auth; configuración y límites pendientes. Correo registrado no revela datos de otra cuenta; registro no agrega a proyectos.
- **Proyecto:** nombre, descripción, fechas y obligatorios/fechas coherentes según HU-21–25 ([SCRUM-32](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-32), [SCRUM-33](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-33), [SCRUM-34](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-34), [SCRUM-35](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-35), [SCRUM-36](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-36)); no agregar campos o límites. Creador pasa a propietario; solo propietario edita/elimina. Crear/editar en modal y eliminación confirmada con listado actualizado.
- **Tarea:** nombre, descripción, inicio y entrega según HU-26–30 ([SCRUM-39](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-39), [SCRUM-40](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-40), [SCRUM-41](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-41), [SCRUM-42](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-42), [SCRUM-43](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-43)); obligatorios y valores actuales al editar. Estado inicial Por hacer; propietario crea/edita/elimina, con confirmación y actualización de vistas/progreso.
- **Integrantes:** lista de nombre, correo, rol y cantidad incluyendo propietario. Solo propietario agrega/quita; buscar registrados por correo, informar no encontrado y duplicado. Propietario no removible; quitar previa confirmación elimina asignaciones y actualiza vistas.
- **Responsables:** selector de uno o varios, únicamente integrantes del proyecto; búsqueda, selección marcada, chips removibles con nombre accesible y vacío/carga/error de consulta.
- **Permisos de cambio de estado/arrastre:** según [HU-31 / SCRUM-44](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-44) y [HU-33 / SCRUM-47](https://api-proyecto-disc01.atlassian.net/browse/SCRUM-47), solo integrantes del proyecto asignados a la tarea pueden cambiar su estado o moverla entre columnas. El propietario solo puede hacerlo cuando esté asignado; sus facultades de crear, editar y eliminar tareas no conceden una excepción para cambiar estados. Ningún integrante no asignado ni usuario ajeno al proyecto puede cambiar el estado o mover la tarea. Se permite uno o varios responsables conforme a la regla anterior. Verificar estos permisos en la interfaz y mediante políticas RLS en Supabase; esta referencia no acredita su implementación.
- **Kanban:** tres columnas con los estados exactos; persistir movimiento autorizado y conservarlo al recargar. Fallo de DnD informa y revierte estado visual anterior. La alternativa de cambio por menú/teclado aplica la misma comprobación de pertenencia al proyecto y asignación a la tarea que el arrastre, también para el propietario; no amplía permisos.
- **Cronograma:** vista temporal de consulta con nombre, inicio/finalización y estado legibles; mismas tareas que Kanban. No incorpora edición ni arrastre de fechas.
- **Progreso:** (tareas completadas / total de tareas) × 100; **0 tareas = 0 %**. Recalcular al crear, eliminar o cambiar estado. Barra con valor accesible y porcentaje textual en dashboard/detalle.
- **Reportes:** botón dentro del proyecto; tabla con nombre, responsable, estado, entrega y vencimiento. Resumen por estado, total vencidas y avance del proyecto seleccionado. Encabezados semánticos, título de tabla y fechas legibles.
- **Impresión:** incluir proyecto, tareas y resumen; excluir navegación y controles innecesarios. PDF solo mediante impresión del navegador, sin exportador propio ni gráficos adicionales; revisar paginación y contraste impreso posteriormente.

### Iconografía: ng-icons, sin integración duplicada

**ng-icons es el adaptador, no una colección.** Usar Lucide mediante **`@ng-icons/lucide` con `provideIcons`**, con configuración `icons: lucide` acorde a la versión instalada.
Referencias de uso: `lucideFolder`, `lucideSquareCheck`, `lucideUsers`, `lucideCalendarDays`, `lucidePlus`, `lucidePencil`, `lucideTrash2` y `lucideSearch`.
Los 24 px corresponden solo a la muestra estática; cada componente gobierna el tamaño interno de sus controles.
Usar `aria-hidden` en SVG decorativos y etiquetas adyacentes.
Esta elección no introduce un SDK Lucide independiente, no exige cambiar iconos internos ni autoriza instalar otra colección.
No añadir `@lucide/angular` ni otra integración standalone. En el frontend destino aún se deben confirmar `components.json.icons`, imports y familia instalada al integrar.
Iconos decorativos ocultos a lectores; controles solo-icono con nombre accesible, objetivo y foco verificables.

## Do's and Don'ts

- **Sí:** identidad oficial + variantes Zard + tokens semánticos; verificar su aplicación en el frontend real.
- **Sí:** usar `zType`/`zSize`/`zShape` y composición antes de clases; conservar comportamiento nativo y revisar API real.
- **Sí:** una acción primaria por contexto; labels, errores asociados, teclado, foco visible/no oculto y anuncios de carga/resultados.
- **Sí:** verificar objetivos, zoom, retorno de foco y movimiento reducido en cada composición; usar Zard no certifica accesibilidad.
- **No:** permitir cambios de estado o movimientos entre columnas a integrantes no asignados, incluido el propietario no asignado, ni a usuarios ajenos al proyecto; tampoco mediante menú/teclado.
- **No:** reimplementar hover, spinner, diálogos, sombras o radios globales; excepciones solo por evidencia concreta y acotadas.
- **No:** usar color como única información, prometer contraste desde tokens opacos o confundir ng-icons con una colección.
- **No:** glass, glows, modo claro obligatorio ni estilos o dependencias ajenos a las decisiones de Tasker.
