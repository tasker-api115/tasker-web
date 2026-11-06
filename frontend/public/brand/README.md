# Recursos oficiales de marca de Tasker

Esta carpeta contiene el logotipo horizontal, el isotipo y las fuentes oficiales de Tasker, con sus archivos de procedencia y licencia. Los recursos conservan sin modificaciones los originales aprobados en HU-07.

## Archivos y procedencia

- [Logo horizontal para fondo oscuro](tasker-logo-dark.svg).
- [Isotipo](tasker-symbol.svg).
- [Licencia de fuentes SIL OFL 1.1](fonts/LICENSE.txt).
- [Procedencia, SHA-256 y tamaños de las fuentes](fonts/font-provenance.json).

Estos recursos corresponden a la identidad visual aprobada en HU-07. Las reglas de uso se describen en [DESIGN.md](../../../DESIGN.md#marca-que-se-conserva).

Se incluyen ocho fuentes TTF oficiales de Vercel: Geist y Geist Mono en pesos Regular/Medium/SemiBold/Bold (400/500/600/700). El [manifiesto de procedencia](fonts/font-provenance.json) conserva las URLs oficiales, la versión, el commit, los hashes y los tamaños de los archivos. La licencia SIL OFL se aplica **solo a las fuentes**, no concede licencia al logotipo ni al resto del proyecto.

## Uso de marca

Conservar trazados del wordmark, geometría, proporciones, orientación, capas, curvaturas, espaciado y degradados originales. No reescribir «Tasker» con Geist ni girar, reflejar, estirar, recortar, recolorear o añadir efectos a los SVG.

Logo horizontal ≥120 px CSS; isotipo ≥24 px de alto; margen ≥0,5x, con x ≈55 unidades de altura de mayúscula del maestro. Usar fondos oscuros tranquilos. Alt «Tasker» para identificación; isotipo decorativo sin nombre duplicado si hay texto adyacente. No inferir colores de controles desde el logo; los roles funcionales y sus límites están en [DESIGN.md](../../../DESIGN.md#colors).

## Uso de fuentes

Usar Geist y Geist Mono con los pesos incluidos. Su presencia en `public/brand/fonts/` no los carga automáticamente: servir `public/` como recursos estáticos y declarar `@font-face` en el CSS de la aplicación con las rutas, familias y pesos correspondientes. No instalar fuentes del sistema ni sustituir el wordmark trazado.
