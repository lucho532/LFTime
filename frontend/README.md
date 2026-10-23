# LFTime — Frontend (Fase 1, modo demostración)

Aplicación web de control de jornadas laborales del personal de salud en hospitales de Colombia.
Esta es la **Fase 1**: solo interfaz, con **datos de demostración** guardados en el navegador. No hay backend, base de datos ni servicios externos.

Los documentos de especificación están en [`../specs/`](../specs/): constitución, spec, plan, contratos preliminares y tareas.

## Requisitos

- Node.js 22.12 o superior (probado con 22.14.0) y npm.
- Para registrar jornadas con GPS, abrir la aplicación en `http://localhost` o en HTTPS: los navegadores no entregan la ubicación en conexiones inseguras.

## Comandos

```bash
npm install              # instala dependencias (versiones fijas en package.json)
npm run dev              # servidor de desarrollo
npm run build            # compila TypeScript y genera el paquete de producción
npm test                 # ejecuta las pruebas una vez
npm run test:vigilar     # pruebas en modo vigilancia
npm run lint             # análisis estático (oxlint)
npm run verificar:tamano # comprueba que ningún archivo supere 250 líneas
```

## Estructura

```text
src/
├── componentes/   piezas visuales reutilizables, por módulo
├── paginas/       una página por ruta
├── hooks/         lógica de interfaz reutilizable
├── servicios/     interfaces de acceso a datos (+ demo/ con la implementación de demostración)
├── repositorios/  persistencia local de la demostración
├── reglas/        reglas de negocio provisionales, funciones puras
├── validadores/   validaciones reutilizables
├── mapeadores/    modelo interno <-> contrato
├── contratos/     tipos de intercambio (futuro contrato con la API)
├── modelos/       tipos internos de la interfaz
├── configuracion/ valores provisionales editables
├── datos-demo/    semillas de datos ficticios
├── utilidades/    hora de Colombia, exportación, compresión de fotos
├── estilos/       index.css (tokens), componentes/ y paginas/ (un CSS por pieza)
└── pruebas/       pruebas, espejo de la estructura anterior
```

## Reglas del proyecto

Todo el código, comentarios y documentación van en español, ningún archivo supera 250 líneas y la lógica de negocio no vive en los componentes. Ver [`../specs/constitution.md`](../specs/constitution.md) (reglas R-1 a R-15).

## Notas de la demostración

- Los datos son ficticios y se guardan solo en este navegador (`localStorage` e `IndexedDB`).
- El control de acceso por rol es **solo visual**; no representa seguridad real.
- Los archivos exportados llevan la marca **DEMO** en el nombre y en el encabezado.
- Las reglas de jornada usadas son **provisionales** y configurables; no son reglas laborales definitivas.
