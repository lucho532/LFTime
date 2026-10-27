# Constitución del proyecto LFTime

Principios que gobiernan todas las especificaciones, planes y tareas. Cualquier cambio a este documento debe ser explícito y revisado.

## Flujo SDD

Cada feature sigue este orden y no se avanza sin revisión humana de la etapa anterior:

1. **Constitución** (este documento).
2. **Especificación** (`spec.md`): QUÉ y POR QUÉ. Sin decisiones técnicas (stack, librerías, base de datos).
3. **Clarificación**: se resuelven los `[NEEDS CLARIFICATION]` con el responsable del negocio.
4. **Plan técnico** (`plan.md`): CÓMO. Solo se crea con la spec aprobada y sin ambigüedades abiertas.
5. **Tareas** (`tasks.md`): pasos pequeños, verificables y ordenados.
6. **Implementación**: solo contra tareas aprobadas.

## Principios

1. **No inventar reglas de negocio.** Tolerancias, duración de descansos, cálculo de horas y permisos los define el responsable del negocio. Si falta una regla, se pregunta; no se asume.
2. **Frontend primero, backend después.** El desarrollo tiene dos fases separadas. No se inicia la Fase 2 hasta que la Fase 1 esté completa y revisada.
3. **Sin backend, base de datos ni servicios externos en la Fase 1.** Todo con datos de demostración. La única persistencia admitida es el almacenamiento local del navegador (`localStorage` e `IndexedDB`), como ayuda de demo (spec D9, D35), siempre señalada como tal en la interfaz y con opción de restablecer.
4. **Honestidad en la demostración.** La interfaz no debe aparentar que se guardó algo de forma permanente ni que una ubicación fue verificada si esa función aún no existe.
5. **Separación de capas.** Los componentes visuales no contienen lógica de negocio definitiva ni conocen el origen de los datos; acceden a ellos mediante una capa de servicios/repositorios sustituible por llamadas a la API.
6. **Contratos antes de integración.** Los datos simulados siguen contratos preliminares documentados, para que el backend los sustituya sin rehacer pantallas.
7. **"Terminado" no es "se ve bien".** Una funcionalidad está terminada cuando cumple sus criterios de aceptación, incluidos estados de carga, error, vacío y confirmación.
8. **Una incidencia no es una sanción.** El sistema detecta y presenta; la persona coordinadora revisa, solicita justificación y resuelve.
9. **Privacidad por diseño.** Solo los datos personales estrictamente necesarios; ubicación tratada de forma proporcionada; trazabilidad de correcciones y operaciones administrativas. Toda persona puede pedir la eliminación de su cuenta y de sus datos personales, con las condiciones de la excepción de supresión de R-10.
10. **Cálculos verificables.** Toda regla de cálculo de jornada debe poder comprobarse con pruebas.
11. **Idioma y contexto.** Interfaz en español (Colombia), zona horaria de Colombia, sujeta a la normativa laboral y de protección de datos colombiana.
12. **Accesibilidad y responsividad.** Diseño adaptable a escritorio, tableta y móvil, con formularios accesibles.

## Fases

| Fase | Alcance | Criterio para pasar a la siguiente |
|------|---------|------------------------------------|
| 1 | Frontend completo con datos simulados | Todos los módulos revisados y aceptados por el responsable |
| 2 | Backend, base de datos, autenticación, API, integración | Pruebas unitarias y de integración, reglas de negocio aprobadas |

## Reglas comunes de código (heredadas de LFMova y LFClub)

Estas reglas son las que ambos proyectos hermanos comparten y se adoptan tal cual en LFTime. Fuentes: `LFMova/AGENTS.md` (§2, §3, §34, §38, §41, §42, §43, §44) y `LFClub/.specify/memory/constitution.md` (§2, §2.3, §3, §6, §24, §25, §27, §29).

### R-1. Todo en español
- Nombres de carpetas, archivos, componentes, hooks, funciones, variables, parámetros, props, tipos, interfaces, enumeraciones, constantes propias, servicios, repositorios, DTOs y excepciones propias: **en español**.
- Comentarios y documentación JSDoc: **en español**.
- Única excepción: términos técnicos obligatorios del ecosistema (`props`, `hooks`, `useState`, `useEffect`, nombres de paquetes npm, atributos HTML/ARIA, APIs del navegador como `navigator.geolocation`) y nombres oficiales de tecnologías (React, TypeScript, Vite, Vitest).
- No usar inglés cuando exista una denominación clara en español.
- Convenciones: componentes y tipos en `PascalCase` (`TarjetaIndicador`, `IncidenciaDto`), funciones y variables en `camelCase` (`obtenerPorCedula`, `horaEntrada`), interfaces con prefijo `I` (`ITrabajadorRepositorio`), implementaciones sin prefijo (`TrabajadorRepositorioDemo`).

### R-2. Documentación obligatoria
Todo componente importante, hook, servicio, repositorio, tipo y enumeración tiene un comentario JSDoc en español que indica: **qué representa**, **su responsabilidad principal** y **qué no debe hacer**. Nunca comentarios genéricos o decorativos que no aporten información.

### R-3. Tamaño máximo: 250 líneas por archivo
Ningún archivo escrito a mano (componente, página, hook, servicio, hoja de estilos, archivo de pruebas) supera las **250 líneas**. Al acercarse se divide por responsabilidad (lógica a hooks, bloques de pantalla a subcomponentes, reglas a `reglas/`). No se elude comprimiendo líneas ni quitando documentación. Dividir no cambia el comportamiento ni los contratos públicos. Exentos: archivos generados automáticamente. Los datos de demostración se parten en varios archivos por entidad para respetar el límite.

### R-4. Arquitectura por capas y separación
- Flujo en el frontend: **Página → Componentes → Hook → Servicio (interfaz) → Repositorio (implementación de demo) → almacenamiento local / datos de demostración**.
- Los componentes visuales no contienen lógica de negocio ni acceden directamente a datos: solo la capa `servicios/` accede a ellos. Hoy son implementaciones de demo; mañana serán llamadas HTTP a la API.
- Las reglas de negocio (cálculo de duraciones, detección de incidencias, distancia al hospital) viven en `reglas/`, son funciones puras y se marcan como **provisionales** mientras no estén aprobadas.
- Los repositorios solo persisten y consultan; no deciden reglas. La autorización de negocio no vive en el repositorio.
- Los contratos de datos (DTO) son distintos de los modelos internos de la interfaz y se mantienen en `contratos/`. No se usa el modelo interno como contrato público por comodidad.
- Los mapeadores transforman modelo ↔ DTO y no contienen reglas de negocio.
- Los validadores centralizan las validaciones de formato y de reglas reutilizables; no se duplica la misma validación en varios componentes.
- No mover lógica entre capas solo para simplificar temporalmente.

### R-5. Componentes pequeños y solo lo necesario
- Un componente hace una sola cosa. Si mezcla layout, acceso a datos y lógica de formulario compleja, se separa en subcomponentes o se extrae a un hook (`use*`) o a `servicios/`.
- No se crean abstracciones (contextos, hooks genéricos, wrappers) para casos hipotéticos. Solo lo que la pantalla actual necesita.
- No se agregan librerías de UI, gestión de estado, CSS-in-JS ni utilidades sin una necesidad concreta ya existente. Si `useState` / `useContext` alcanzan, no se introduce otra librería. Cada dependencia se justifica por escrito en `plan.md`.
- No sobreingenierizar: nada de patrones o infraestructura que ningún requisito justifique.

### R-6. Estilos CSS separados
- Cada componente de `componentes/` y cada página de `paginas/` tiene su propio archivo CSS, importado solo por su `.tsx`.
- Los CSS **no van junto al `.tsx`**: viven en `src/estilos/componentes/` y `src/estilos/paginas/`, replicando la estructura.
- `index.css` solo contiene reinicio global, variables de tema (tokens de color en `:root`) y estilos de elementos raíz. Nada específico de un componente.
- No hay hoja de estilos monolítica compartida entre componentes no relacionados.

### R-7. Diseño y accesibilidad
- Toda pantalla funciona en teléfono y en escritorio.
- Los estados (jornada, almuerzo, retraso, ausencia, incidencia, pendiente, resuelto) se distinguen **por texto además de por color**.
- La referencia visual aprobada es `specs/001-lftime/design/panel-coordinacion-referencia.png`. Sus datos son ficticios y no son reglas de negocio.
- Tema claro y oscuro como en LFClub y LFMova (confirmado, spec D32), con el cambio en el menú del perfil y un nombre accesible que dice a qué tema cambia. Es de prioridad baja y no retrasa las funcionalidades prioritarias; desde el inicio los colores se declaran como variables de tema. La referencia solo muestra el tema claro.

### R-8. No inventar reglas; detener y documentar
Claude Code implementa las decisiones aprobadas y no actúa como diseñador autónomo de reglas de negocio. Ante una contradicción, ambigüedad o requisito faltante que afecte el comportamiento: identificarlo, documentarlo, detener esa parte y pedir decisión. No se introducen funcionalidades "por si acaso útiles". Si una tarea depende de una decisión pendiente, no se inventa: se usa un **supuesto provisional documentado y configurable** solo cuando el plan lo autoriza expresamente (como en `plan.md` §13).

### R-9. Fechas y horas (Colombia)
Todo se expresa en hora de Colombia (UTC−5 fijo, sin horario de verano).
- **Fechas y horas programadas** (horarios, fecha operativa): se guardan como las escribe el coordinador, en hora de Colombia, sin convertir. "Hoy" y "ahora" para compararlas salen de una única utilidad (`utilidades/horaColombia`), nunca de `new Date()` directo.
- **Instantes reales** (marcaciones, intentos, acciones de auditoría): se guardan en UTC y se muestran en hora de Colombia.
- No se dispersan reglas de zonas horarias; la única conversión permitida está en esa utilidad.
- Se mantienen separadas las propiedades de fecha y hora cuando así se definieron; no se reemplazan por un único `Date` sin decisión expresa.

### R-10. Histórico inmutable
Nunca se modifica información histórica por haber cambiado el dato actual. Las marcaciones, los intentos rechazados, las decisiones y las correcciones no se sobrescriben: cada cambio añade una entrada (quién, cuándo, qué, por qué). Resolver una incidencia no altera los intentos originales. Se mantiene solo el estado actual salvo historial explícito en la spec.

**Excepción de supresión (Fase 2; enmienda aprobada por el responsable el 2026-10-27).** La eliminación de una cuenta, pedida por la propia persona o por un administrador de su empresa, y la eliminación de una empresa, pedida por el desarrollador, suprimen o anonimizan los datos personales. Condiciones:
1. Solo se hace mediante una **operación de plataforma de eliminación** explícita, con confirmación de quien la pide. La aplicación ordinaria sigue sin poder modificar ni borrar registros históricos.
2. Se suprimen la identidad, el correo, el teléfono, la foto y el dispositivo de la persona. Al eliminar una **cuenta**, los registros de jornada (marcaciones, intentos, incidencias) **se conservan desvinculados de toda persona identificable**, sin datos que permitan reidentificarla. Al eliminar una **empresa entera** (decisión del responsable, 2026-10-27), se borran también los registros de jornada de esa empresa, salvo lo que la norma obligue a conservar (condición 4).
3. Queda una entrada de auditoría de plataforma **sin datos personales** (quién eliminó, cuándo, qué identificador anulado y de qué tipo), que no se borra con la empresa.
4. No se elimina lo que una norma vigente obligue a conservar; el plazo lo valida el asesor legal (N-3 de la spec de la Fase 2).
5. El último administrador de una empresa no puede eliminarse.
6. Esta excepción no autoriza corregir, editar ni borrar marcaciones o intentos por otra vía.

### R-11. GPS obligatorio en cada marcación
Toda marcación se registra con ubicación del dispositivo; sin coordenadas válidas no hay marcación ni se simula (ver spec HU-05).

### R-12. Definición de terminado
Una tarea solo se marca como completada cuando está **implementada + compilada + probada + verificada** según sus criterios de aceptación; que el código se escriba o la pantalla se vea no basta. Antes de terminar: compilar, ejecutar las pruebas relevantes, corregir, comprobar regresiones, verificar el límite de 250 líneas, la documentación en español y documentar excepciones. Las reglas de negocio importantes tienen pruebas automatizadas.

### R-13. Trazabilidad y prioridad de documentos
Cada funcionalidad se relaciona: **requisito → especificación → plan → tarea → código → prueba**. Orden de prioridad ante conflicto: (1) requisitos aprobados, (2) esta constitución, (3) `spec.md`, (4) `plan.md`, (5) `tasks.md`, (6) decisiones de implementación. Nunca se usa una decisión técnica para contradecir una regla de negocio aprobada. Antes de cada tarea se comprueba: ¿hay requisito? ¿regla de negocio? ¿contrato? ¿tarea? ¿dependencia con otra tarea?

### R-14. Git
Cambios pequeños y trazables, con mensajes que describen el cambio. No mezclar nueva funcionalidad, refactor masivo, cambio de arquitectura y cambios de formato en un mismo cambio sin necesidad.

### R-15. Prioridades finales
Claridad → correctitud → seguridad → mantenibilidad → escalabilidad. Entre dos soluciones que cumplan las reglas, se prefiere la más sencilla.

### Vocabulario del dominio (un solo término por concepto)

| Término | Significado |
|---------|-------------|
| Trabajador | persona del personal asignada a un hospital |
| Coordinador | persona que supervisa personal, hospitales, horarios e incidencias |
| Administrador | persona que gestiona usuarios, permisos y configuración |
| Hospital | centro de trabajo, asociado a un municipio |
| Municipio | municipio de Colombia donde está un hospital |
| Horario | planificación de entrada, salida y almuerzo de un trabajador |
| Jornada | día de trabajo de un trabajador con sus marcaciones |
| FechaOperativa | fecha a la que se asigna una jornada (puede cruzar medianoche) |
| Marcacion | evento registrado de la jornada (entrada, salida a almuerzo, regreso, salida final) |
| IntentoMarcacion | intento de marcación rechazado, guardado aparte de las marcaciones válidas |
| Incidencia | anomalía detectada, sujeta a revisión (nunca una sanción) |
| Justificacion | explicación aportada sobre una incidencia |
| Alerta | aviso en el panel que apunta a una incidencia o situación |

No se usan sinónimos en el código (por ejemplo `Employee`, `Shift`, `Attendance`, `Empleado`, `Turno`) para estos conceptos.
