# CLAUDE.md — LFTime

LFTime controla las jornadas laborales del personal de salud que una empresa asigna a hospitales de distintos municipios de Colombia: registro de entrada, almuerzo y salida con GPS, comparación con el horario, incidencias, alertas e informes. Hay tres roles: administrador, coordinador y trabajador.

El proyecto sigue **SDD (desarrollo guiado por especificación)** con documentos propios en markdown, y se construye en **dos fases separadas**:

1. **Fase 1 (la actual): solo frontend** con datos de demostración. Sin backend, base de datos ni servicios externos.
2. **Fase 2: backend e integración.** No se empieza hasta terminar y revisar la Fase 1.

## Antes de hacer nada, lee esto (en este orden)

1. `specs/constitution.md` — principios y reglas de código R-1 a R-15 (obligatorias).
2. `specs/001-lftime/spec.md` — qué se construye. Decisiones D1 a D37 y el estado de cada pendiente en §0.4.
3. `specs/001-lftime/plan.md` — cómo (pila, capas, supuestos provisionales §13).
4. `specs/001-lftime/contratos-preliminares.md` — contratos de datos.
5. `specs/001-lftime/tasks.md` — **el estado real del trabajo**: cada tarea marcada y un registro de ejecución por hito con lo que quedó pendiente.
6. `specs/001-lftime/analisis-coherencia.md` — contradicciones resueltas y observaciones.
7. `specs/001-lftime/design/panel-coordinacion-referencia.png` — referencia visual (datos ficticios).

**El estado se lee en `tasks.md`, no aquí.** Para saber qué sigue: busca el primer hito con tareas `[ ]` o `[~]`. Leyenda: `[ ]` pendiente · `[~]` en curso · `[X]` terminada y verificada · `[B]` bloqueada por una decisión pendiente.

## Reglas que no se negocian (resumen; el texto completo está en la constitución)

- **No inventar reglas de negocio.** Si falta una decisión, se detiene esa parte y se pregunta. Los supuestos del plan §13 son **provisionales y configurables**: no son reglas laborales y **nunca generan sanciones**. No declares cerrado un pendiente de negocio que no lo está (spec §0.4).
- **Todo en español**: carpetas, archivos, componentes, hooks, funciones, variables, tipos, props, comentarios y JSDoc (solo se mantienen los términos técnicos del ecosistema). Cada clase, componente o servicio importante lleva JSDoc que dice qué representa, su responsabilidad y qué **no** debe hacer.
- **Ningún archivo escrito a mano supera 250 líneas** (`npm run verificar:tamano`). Se divide por responsabilidad.
- **Capas**: Página → Componentes → Hook → Servicio (interfaz) → Repositorio de demo. Los componentes no tienen lógica de negocio ni acceden a datos; las reglas viven en `reglas/` como funciones puras y provisionales; los servicios se eligen en un solo lugar (`servicios/fabrica.ts`).
- **CSS por componente o página**, en `src/estilos/componentes/` y `src/estilos/paginas/` (nunca junto al `.tsx`); `index.css` solo tiene reinicio y tokens. Un archivo CSS lo importa un solo componente.
- **Sin librerías nuevas sin necesidad concreta**; cada dependencia se justifica en `plan.md` §3. Sin librerías de UI, de estado ni de iconos.
- **Hora de Colombia (UTC−5)** siempre mediante `utilidades/horaColombia` (nunca `new Date()` suelto). Instantes reales en UTC.
- **Histórico inmutable**: marcaciones, intentos rechazados, historiales y auditoría solo se añaden.
- **GPS obligatorio** en cada marcación; sin ubicación válida no hay marcación ni se simula. Un fallo técnico nunca se presenta como ubicación indebida.
- **Honestidad de la demo**: aviso de modo demostración, control de acceso por rol «solo visual», archivos exportados con la marca DEMO. Nunca aparentar guardado permanente ni validación real.
- **Una incidencia no es una sanción.**
- **Definición de terminado**: una tarea es `[X]` solo si está implementada, compilada, probada y verificada. Si algo no se pudo verificar (por ejemplo, GPS real, compresión de fotos o aspecto visual en un navegador), se deja `[~]` y se dice.

## Cómo trabajar

- Se trabaja **por hitos**, en el orden de `tasks.md`. Al terminar cada hito: compilar, probar, verificar el tamaño, actualizar `tasks.md` (estado de las tareas y un apartado en «Registro de ejecución») y, si cambia algo de diseño, `spec.md`, `plan.md` o `contratos-preliminares.md`.
- Antes de cada tarea: ¿hay requisito, regla de negocio, contrato, tarea y dependencias? Si depende de un pendiente, no se inventa.
- Si encuentras una contradicción entre documentos, señálala antes de implementar. Prioridad: requisitos aprobados > constitución > spec > plan > tasks > decisiones de implementación.
- **No hagas commits ni toques el repositorio remoto sin que se te pida.** Mensajes de commit en español, cambios pequeños y trazables.
- Pregunta solo lo que cambia lo que harás y no se pueda resolver con el código o los documentos.

## Comandos (en `frontend/`)

```bash
npm install                 # versiones fijas en package.json (Node 22.12 o superior)
npm run dev                 # servidor de desarrollo
npm run build               # tsc -b + vite build
npm test                    # Vitest, una vez
npm run lint                # oxlint
npm run verificar:tamano    # falla si un archivo supera 250 líneas
```

Las cuatro comprobaciones (`build`, `test`, `lint`, `verificar:tamano`) deben pasar antes de dar un hito por terminado.

## Cosas útiles de saber

- **Persistencia de la demo**: `localStorage` (prefijo `lftime.demo.`, versión de esquema en `repositorios/demo/inicializacionDemo.ts`; **sube la versión si cambias la forma de un contrato guardado**) e `IndexedDB` para las fotos. Los datos se generan relativos al día actual de Colombia (`datos-demo/`); las incidencias **de hoy** no se siembran: las crean las reglas.
- **Pruebas**: archivos `*.prueba.ts(x)` bajo `src/pruebas/`, espejo de la estructura. jsdom no tiene IndexedDB ni `canvas`: las fotos se prueban con `fake-indexeddb` (solo desarrollo) y un almacén en memoria (`pruebas/ayudas/`).
- **Fechas de prueba**: `establecerRelojParaPruebas(() => new Date('...'))`; los datos de demo cambian con la hora, así que las pruebas fijan el reloj.
- **Usuarios de prueba**: ver `datos-demo/usuarios.ts` (administradores con y sin permiso de fotos, dos coordinadores, cuatro trabajadores) y `/ingreso`. El ingreso es simulado, sin contraseñas.
- **Pendientes de negocio abiertos** (no se resuelven por cuenta propia): P-03 y P-05 (laborales), P-11, P-12, P-15, parte legal de P-13 y la validación definitiva de los supuestos. `T-9.7` (corrección manual de marcaciones) está bloqueada por P-12.
- **Decisión del responsable pendiente**: `npm audit` informa 2 avisos moderados en `uuid` por `exceljs`; la única corrección propuesta rebaja ExcelJS a una versión incompatible y no se aplicó (ver `plan.md` §15).
- **Idioma de trabajo con la persona responsable**: español.
