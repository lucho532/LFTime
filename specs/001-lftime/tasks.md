# Tareas: LFTime, Fase 1 (frontend con datos de demostración)

**Estado:** BORRADOR para aprobación. **Ninguna tarea está iniciada ni completada.** No se empieza a implementar hasta que el responsable apruebe este documento.
**Base:** `constitution.md` (R-1…R-15), `spec.md` v4, `plan.md`, `contratos-preliminares.md`, `analisis-coherencia.md`.
**Alcance:** solo frontend con datos de demostración. Sin backend, base de datos ni servicios externos. Los supuestos del plan §13 son provisionales y configurables; no son reglas laborales y no generan sanciones.

## Definición de terminado (aplica a TODAS las tareas, constitución R-12)

Una tarea se marca `[X]` solo cuando está **implementada + compilada + probada + verificada**:
1. `npm run build` compila sin errores de TypeScript.
2. Las pruebas relevantes pasan (`npm test`) y no hay regresiones.
3. Ningún archivo escrito a mano supera 250 líneas (`npm run verificar:tamano`).
4. Nombres, comentarios y JSDoc en español (qué representa, responsabilidad, qué no debe hacer).
5. Sin lógica de negocio en componentes; sin acceso a datos fuera de `servicios/`.
6. Criterios de aceptación de la tarea y los CA/HU que referencia, verificados (prueba automática o verificación manual documentada).
7. Supuestos provisionales usados: rotulados «provisional» y tomados de `configuracion`, no incrustados.

Leyenda de estado: `[ ]` pendiente · `[~]` en curso · `[X]` terminada y verificada · `[B]` bloqueada por una decisión pendiente.

---

## Hito 1: Andamiaje

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-1.1 | Crear `frontend/` con Vite + React + TypeScript (modo estricto). Fijar y registrar versiones **instalando de verdad** las candidatas del plan §3 (Node 22.14.0). Si hay incompatibilidad, ajustar versiones y anotarlo en `plan.md` | Aprobación de este documento; B-1, B-2 | `npm install`, `npm run dev`, `npm run build` y `npm test` funcionan; versiones fijadas en `package.json`; resultado anotado | Plan §3 |
| [X] T-1.2 | Crear la estructura de carpetas del plan §4 (con archivos `.gitkeep` donde haga falta) y el script `scripts/verificarTamano.mjs` que falla si un archivo escrito a mano supera 250 líneas | T-1.1 | `npm run verificar:tamano` pasa y falla con un archivo de prueba de 251 líneas | R-3 |
| [X] T-1.3 | `estilos/index.css` con reinicio, **tokens de color como variables** (azul oscuro, azul eléctrico, blanco, estados) y tipografía; `App.css` | T-1.1 | Los colores del panel salen de variables; no hay estilos de componente en `index.css` | R-6, R-7 |
| [X] T-1.4 | `utilidades/horaColombia` (hoy, ahora, formateo, conversión de instante UTC a hora de Colombia) con pruebas | T-1.1 | Pruebas con fechas límite (medianoche, cambio de día) pasan; ningún otro módulo usa `new Date()` directo | R-9 |
| [~] T-1.5 | **Prueba de humo de ExcelJS** aislada en `utilidades/exportacion`: generar un `.xlsx` mínimo con `import()` dinámico; comprobar que Vite lo separa en su propio fragmento y que el archivo abre | T-1.1 | Prueba automática del exportador + verificación manual en navegador anotada; si falla, se documenta y se detiene (no se cambia de librería sin decisión) | D34 |
| [X] T-1.6 | Enrutado básico (`App.tsx`), disposición vacía, `AvisoModoDemo` visible y su CSS | T-1.3 | La app arranca, muestra el aviso de modo demo y navega entre rutas vacías | D9 |
| [X] T-1.7 | `frontend/README.md` en español: cómo instalar, ejecutar, probar, restablecer la demo y requisitos (`localhost`/HTTPS para GPS) | T-1.1 | Un tercero puede levantar la app con el README | R-12 |

## Hito 2: Contratos, datos de demostración y servicios

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-2.1 | `contratos/` y `modelos/` con los tipos de `contratos-preliminares.md`, y `mapeadores/` | T-1.2 | Compila; cada tipo documentado; sin lógica en mapeadores | R-4 |
| [X] T-2.2 | Almacenamiento local versionado en `repositorios/demo` (con `try/catch`, prefijo `lftime.demo.`, versión de esquema) y pruebas | T-2.1 | Pruebas con almacenamiento bloqueado, lleno y versión distinta; ofrece restablecer | D9 |
| [X] T-2.3 | Semillas maestras: municipios, hospitales (algunos **sin coordenadas confirmadas**, uno **sin responsable**), usuarios de prueba por rol (con y sin permiso de fotos), trabajadores | T-2.1. Usa la **propuesta de escenarios** (spec §9); confirmar P-22 | Cada archivo ≤ 250 líneas; cubre los escenarios del spec §9 | P-22 |
| [X] T-2.4 | Semillas relativas al día actual de Colombia: horarios, marcaciones, intentos (con y sin ubicación válida) e incidencias de ejemplo | T-2.3, T-1.4 | Al abrir la app cualquier día, el panel tiene datos coherentes con «hoy» | D33 |
| [X] T-2.5 | Interfaces `I...Servicio` + fábrica + implementaciones demo (personal, hospitales, horarios, usuarios, configuración) | T-2.2, T-2.3 | Los servicios devuelven datos de demo; cambiar de implementación toca solo la fábrica | R-4 |
| [X] T-2.6 | `configuracion/reglasProvisionales` + servicio, con los valores del plan §13 y contratos §8 | T-2.5 | Valores editables y persistentes; documentados como provisionales en el código (el rótulo «provisional» en pantalla se verifica en T-12.1) | D37 |
| [X] T-2.7 | Restablecer datos de demostración (reglas, semillas y fotos) | T-2.2, T-2.4 | Tras restablecer, la app vuelve al estado inicial verificable | D9 |

## Hito 3: Componentes base y estados

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-3.1 | `Boton`, `Campo`, `Selector`, `Aviso`, `Tarjeta`, `Modal` con su CSS cada uno | T-1.3 | Accesibles por teclado; etiquetas y errores enlazados | R-7 |
| [X] T-3.2 | `Insignia` de estado: **siempre texto + color**; catálogo del plan §12 | T-3.1 | Prueba de que ningún estado depende solo del color | D31 |
| [X] T-3.3 | `EstadoCarga`, `EstadoError`, `EstadoVacio`, `Confirmacion` | T-3.1 | Cada uno con prueba de renderizado y mensaje comprensible | Spec §8 |
| [X] T-3.4 | `Tabla`, `Paginacion` y hook `useTablaPaginada` (búsqueda, filtros, página) | T-3.1 | Pruebas de filtro, búsqueda y paginación; adaptable a móvil | HU-02 |
| [X] T-3.5 | `Avatar` (foto o avatar por defecto según permiso) | T-3.1 | Pruebas para propietario, coordinador autorizado, administrador con y sin permiso | D14, D20, D24 |

## Hito 4: Sesión simulada, disposición y navegación

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-4.1 | `useSesion` + `/ingreso` con usuarios de prueba por rol | T-2.5, T-3.1 | Se puede ingresar y salir como cada rol; no hay contraseñas reales | D9 |
| [~] T-4.2 | `BarraLateral`, `BarraSuperior`, `MenuPerfil` según la referencia visual | T-3.1, T-4.1 | Coincide en estructura con `design/panel-coordinacion-referencia.png`; funciona en móvil | D10 |
| [X] T-4.3 | `RutaProtegida` y menú por rol (matriz plan §13) + **aviso fijo «control de acceso solo visual»** | T-4.1 | Cada rol ve solo sus rutas; el aviso es visible; prueba por rol | D27 |

## Hito 5: Hospitales, coordenadas y mapa

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-5.1 | Lista y ficha de hospital; alta/edición con validaciones | T-3.4, T-2.5 | CRUD en la demo; mensajes de error comprensibles | HU-03 |
| [X] T-5.2 | `validadores/coordenadas` (rangos, numérico, obligatorio) con pruebas | T-2.1 | Casos límite (±90, ±180, texto, vacío) pasan | CA-7 |
| [X] T-5.3 | `useUbicacion` (permiso, posición, motivos técnicos tipificados) | T-1.2 | Pruebas con la API simulada **solo en pruebas**; en la app usa la real | D13 |
| [~] T-5.4 | `FormularioCoordenadas`: modo manual y «usar mi ubicación actual» con **precisión visible antes de confirmar**; historial de cambios | T-5.2, T-5.3 | Verificación manual en dispositivo; CA-7 | D22 |
| [X] T-5.5 | Advertencia visible de hospital sin coordenadas confirmadas | T-5.1 | CA-6, CA-11 | D25 |
| [~] T-5.6 | `MapaEsquematico` local (SVG), marcadores por hospital, lista de hospitales sin coordenadas | T-5.1 | Sin ninguna petición de red externa; verificado en la pestaña de red | D18 |
| [X] T-5.7 | **Asignación de coordinador responsable** con historial y vigencia (solo administrador autorizado) y señal de «sin responsable» | T-5.1, T-4.3 | Un cambio cierra la vigencia anterior sin borrarla; prueba de historial | D28 |

## Hito 6: Personal, horarios y fotos

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-6.1 | Lista, ficha y formulario de personal, con estado del trabajador | T-3.4, T-2.5 | Búsqueda, filtros y paginación; validación de formulario | HU-02, P-20 |
| [X] T-6.2 | `IAlmacenFotos` sobre IndexedDB con límites y errores | T-2.2 | Pruebas de base bloqueada, cuota excedida y fallo de escritura; la app sigue funcionando | D35 |
| [~] T-6.3 | `utilidades/comprimirFoto` y `validadores/foto` (JPG, JPEG, PNG, WebP; ≤ 2 MB tras comprimir) | T-6.2 | CA-8; pruebas de formato inválido e imposibilidad de comprimir | D24 |
| [X] T-6.4 | Subir, cambiar y retirar foto; retirar **no** borra historial | T-6.2, T-6.3, T-3.5 | CA-8; visibilidad por rol y bandera de administrador (D30) | D14, D20, D24, D30 |
| [X] T-6.5 | Jornadas/horarios: coordinador asigna y edita horario y almuerzo; cambios con vigencia e historial | T-6.1 | El trabajador ve su horario y no lo edita; cruce de medianoche aceptado | D15, D5, P-07 |

## Hito 7: Reglas de jornada (`reglas/`, funciones puras)

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [ ] T-7.1 | `reglas/duraciones`: efectivo, almuerzo, total; cómputo **incompleto** sin duración estimada | T-1.4, T-2.1 | Pruebas con el ejemplo de la spec §6 y con marcaciones faltantes; total = efectivo + almuerzo | D16 |
| [ ] T-7.2 | `reglas/secuencia`: impide secuencias inválidas, duplicados y salida sin jornada abierta | T-2.1 | Pruebas de todas las transiciones | HU-05 |
| [ ] T-7.3 | `reglas/fechaOperativa` (provisional P-04) | T-1.4 | Pruebas de turno que cruza medianoche | D5, P-04 |
| [ ] T-7.4 | `reglas/distanciaGeografica` (Haversine) | T-2.1 | Pruebas con distancias conocidas | D19 |
| [ ] T-7.5 | `reglas/evaluarMarcacion`: válida, fuera de radio, fallo técnico | T-7.4, T-2.6 | Pruebas de 100 m y 25 m exactos, por encima y por debajo | D19, D23 |
| [ ] T-7.6 | `reglas/estadoActual` del trabajador con el catálogo de estados | T-7.1, T-2.6 | Pruebas por estado; respeta estado inactivo (P-20) | D31 |
| [ ] T-7.7 | `reglas/detectarIncidencias` (tolerancias y umbrales de `configuracion`) | T-7.6 | Una prueba por tipo de incidencia; no genera ninguna acción sancionatoria | HU-06, P-18 |
| [ ] T-7.8 | `reglas/agruparIntentos` por trabajador + fecha operativa + hospital | T-7.3, T-7.5 | CA-12, CA-14 | D26 |

## Hito 8: Registro del trabajador y geolocalización

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [ ] T-8.1 | Pantalla `/registro` (móvil): jornada del día, **solo la acción siguiente permitida**, contador mientras la jornada está abierta (los tiempos oficiales salen de las marcas) | T-7.1, T-7.2, T-4.2 | Verificación manual en móvil; CA-3 | HU-05 |
| [ ] T-8.2 | Flujo de marcación con geolocalización real y servicio de marcaciones | T-5.3, T-7.5, T-2.5 | CA-1, CA-2; nunca se simula ni se marca sin coordenadas | D13 |
| [ ] T-8.3 | Intentos rechazados guardados aparte, con motivo; fallos técnicos sin incidencia de ubicación indebida | T-8.2, T-7.8 | CA-3, CA-4, CA-5, CA-14 | D23 |
| [ ] T-8.4 | Instrucciones cuando el permiso está bloqueado; reintento que vuelve a comprobar permisos | T-8.2 | Verificación manual en navegador | D13 |
| [ ] T-8.5 | Hospital sin coordenadas confirmadas: explicación y sin botón de marcar | T-5.5, T-8.1 | CA-11 | D25 |
| [ ] T-8.6 | Historial propio del trabajador; aviso «ubicación capturada, no validada por el servidor» | T-8.1 | CA-10 | D13 |

## Hito 9: Incidencias, alertas y auditoría

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [ ] T-9.1 | Lista y detalle de incidencias con filtros, y detalle con todos los intentos asociados | T-3.4, T-7.7, T-7.8 | CA-5, CA-12 | HU-06 |
| [ ] T-9.2 | Justificación (trabajador sobre las propias; coordinador en su nombre con motivo), texto sin adjuntos | T-9.1 | Prueba por rol | P-16 |
| [ ] T-9.3 | Resolución (justificada / no justificada / pendiente de información), historial inmutable, reabrir con motivo; **sin ninguna sanción** | T-9.1 | CA-13; los intentos no cambian | D11, P-17, P-18 |
| [ ] T-9.4 | Escalada manual con motivo; intervención directa del administrador; bandeja «pendientes de asignación» | T-9.3, T-5.7 | Prueba de incidencia en hospital sin responsable | D28, D29 |
| [ ] T-9.5 | Registro de auditoría de cambios de horario, coordenadas, asignaciones, resoluciones y escaladas | T-9.3 | Cada acción deja quién, cuándo y por qué | D29 |
| [ ] T-9.6 | Alertas y campana con contador; alerta revisada al abrir la incidencia | T-9.1 | Texto distingue leído/sin leer (no solo color) | HU-07, P-19 |
| [B] T-9.7 | Corrección manual de una marcación por el coordinador, con permiso, motivo y auditoría | — | **BLOQUEADA por P-12** (quién puede crear o corregir): no se implementa hasta decidirlo | HU-05 |

## Hito 10: Panel de coordinación

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [ ] T-10.1 | Tarjetas de indicadores con enlace al detalle filtrado | T-7.6, T-3.1 | Cada indicador lleva a su lista | HU-01 |
| [ ] T-10.2 | Tabla «Personal en tiempo real» (búsqueda, filtros por municipio y estado, paginación, acciones) | T-3.4, T-7.6 | Igual de estructura a la referencia | HU-01 |
| [ ] T-10.3 | Panel de alertas, resumen por hospital, mapa de hospitales | T-9.6, T-5.6 | Resumen coherente con los datos | HU-01 |
| [ ] T-10.4 | Horas trabajadas hoy, estados del personal y promedio de almuerzo, **con tiempos separados** | T-7.1 | Coherentes con `reglas/duraciones` | HU-01, D21 |
| [ ] T-10.5 | Actualización cada 60 s (configurable) y botón «Actualizar» con «última actualización» | T-10.2 | Verificado con el reloj | P-25 |

## Hito 11: Informes y exportación

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [ ] T-11.1 | `utilidades/exportacion`: CSV y Excel (ExcelJS aislado tras `IExportadorExcel`); nombre `DEMO_...` y fila de encabezado DEMO | T-1.5 | **Marca DEMO en nombre y encabezado, CSV y Excel**; ningún otro módulo importa `exceljs` | D36, D34 |
| [ ] T-11.2 | Pantalla de informes: asistencia diaria, horas por trabajador, incidencias, intentos rechazados, cumplimiento por hospital, con filtros | T-7.1, T-9.1, T-3.4 | Distingue programadas, registradas, descanso y efectivo | HU-08 |
| [ ] T-11.3 | Botones de exportación por informe y prueba de contenido | T-11.1, T-11.2 | Los archivos abren y su contenido coincide con la pantalla | P-23 |

## Hito 12: Configuración, pulido y revisión final

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [ ] T-12.1 | Pantalla `/configuracion` (solo administrador): reglas provisionales, usuarios de prueba, restablecer | T-2.6, T-2.7 | Todos los valores rotulados «provisional» | HU-09 |
| [ ] T-12.2 | Revisión responsiva (teléfono, tableta, escritorio) y accesibilidad (teclado, etiquetas, contraste, estado por texto) | Hitos 4-11 | Lista de verificación firmada por pantalla | Spec §8 |
| [ ] T-12.3 | **Tema claro y oscuro** con preferencia guardada y cambio en el menú del perfil | T-1.3, T-4.2 | Nombre accesible dice a qué tema cambia; colores verificados en ambos temas | D32 |
| [ ] T-12.4 | Revisión de criterios CA-1…CA-14 y de HU-01…HU-09 | Hitos 4-11 | Matriz CA/HU → prueba o verificación, completa | Spec §5, §5.1 |
| [ ] T-12.5 | Auditoría final: límite de 250 líneas, español, JSDoc, sin lógica en componentes, sin servicios externos (pestaña de red) | Todo | `verificar:tamano` pasa; informe sin hallazgos abiertos | R-1…R-6, CA-10 |
| [ ] T-12.6 | Documento de traspaso a la Fase 2 (contratos, reglas provisionales que deben validarse, autorización real, consentimientos) | T-12.4 | Entregado y revisado | Plan §17 |

---

## Dependencias entre hitos

```text
1 → 2 → 3 → 4 → 5 ┐
              └→ 6 ┤
        2 → 7 ─────┼→ 8 → 9 → 10 → 11 → 12
                    └─ (5, 6 y 7 alimentan 8)
```
El hito 12 no se inicia hasta terminar el 11; T-12.3 (tema) puede aplazarse sin afectar la entrega funcional.

## Bloqueos y condiciones previas al hito 1

| # | Situación | ¿Impide empezar el hito 1? | Qué hace falta |
|---|-----------|----------------------------|----------------|
| B-1 | `LFTime` **no es un repositorio git** (la constitución R-14 exige cambios pequeños y trazables) | **Sí, para cumplir R-14** | Decidir si ejecuto `git init` (local, sin remoto) antes de empezar |
| B-2 | Ubicación de la app: se propone `LFTime/frontend/` junto a `specs/` (como en LFClub) | Confirmación | Confirmar esa carpeta |
| B-3 | Versiones del plan §3 consultadas pero **no instaladas** | No | Se verifican en T-1.1; si fallan, se ajusta y se anota |
| B-4 | Compatibilidad de ExcelJS con Vite | No | **Comprobada** parcialmente en T-1.5 (ver registro de ejecución); falta la prueba manual en navegador |
| B-5 | P-22: escenarios de datos de demo no confirmados | No para el hito 1; **sí para T-2.3** | Confirmar la propuesta de spec §9 antes del hito 2 |
| B-6 | P-12: quién corrige marcaciones | No | T-9.7 queda `[B]` |
| B-7 | Pendientes de negocio abiertos (P-03, P-05, P-11, P-15, parte legal de P-13, validación de los supuestos) | **No** | Se cubren con supuestos provisionales configurables; hay que validarlos antes de la Fase 2 |

---

## Registro de ejecución

### Hito 1 (2026-10-23)

- B-1 resuelto: `git init` ejecutado (repositorio local, sin remoto, **sin commits**; se hará un commit solo si el responsable lo pide). B-2 resuelto: la app está en `LFTime/frontend/`.
- **T-1.1 [X]:** instaladas y fijadas (sin `^` ni `~`) las versiones: `react` 19.3.1, `react-dom` 19.3.1, `react-router-dom` 7.18.4, `exceljs` 4.4.0, `vite` 8.3.4, `vitest` 5.0.5, `jsdom` 29.1.1, `@testing-library/react` 16.3.3, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.8, `@vitejs/plugin-react` 6.1.2, `@types/node` 24.19.2, **`typescript` 6.0.3** (la plantilla de Vite trae esta; la candidata 7.0.2 del plan no se usó) y `oxlint` 1.88.0 (viene en la plantilla de Vite, es herramienta de desarrollo). Verificado en Node 22.14.0: `npm install`, `npm run dev` (HTTP 200, título «LFTime»), `npm run build` y `npm test` funcionan.
- **T-1.2 [X]:** estructura creada y `npm run verificar:tamano` pasa (18 archivos). Comprobado también que **falla** con un archivo de 251 líneas (informa el archivo y termina con error) y vuelve a pasar al retirarlo.
- **T-1.4 [X]:** 8 pruebas de `horaColombia` pasan, incluidos límites de medianoche (05:00 UTC) y de año.
- **T-1.5 [~]:** prueba automática pasa (genera un `.xlsx`, lo vuelve a leer y comprueba fila DEMO, columnas y datos), y una compilación temporal confirmó que Vite separa ExcelJS en su propio fragmento (929 kB, 256 kB comprimido) cargado con `import()`. **Pendiente: la verificación manual en un navegador real** (no se ha ejecutado la descarga desde la interfaz, que no existe aún). Se cierra en T-11.1.
- **T-1.6 [X]:** disposición base provisional, aviso de modo demostración y rutas vacías; 2 pruebas de la app pasan (aviso visible, redirección a Inicio, navegación). No se ha revisado visualmente en un navegador.
- **Hallazgo de seguridad de dependencias:** `npm audit` informa 2 vulnerabilidades **moderadas** en `uuid` (<11.1.1: falta de comprobación de límites en v3/v5/v6 cuando se pasa un `buf`), dependencia de `exceljs` 4.4.0. La única corrección que ofrece npm es **bajar a `exceljs` 3.4.0** (cambio incompatible), que no se aplica. Riesgo en esta aplicación: bajo (se usa solo en el navegador para generar archivos con datos de demostración, sin entrada externa). **Decisión pendiente del responsable** antes de la Fase 2; ver `plan.md` §15.

### Hito 2 (2026-10-23)

P-22 confirmado por el responsable (spec §0.4). Resultado: `npm run build` compila; `npm test` pasa **61 pruebas** (7 archivos); `npm run verificar:tamano` pasa (75 archivos); `npm run lint` sin hallazgos.

- **T-2.1 [X]:** `contratos/` (10 archivos por entidad), `modelos/` (trabajador, hospital, usuario, estado de datos demo) y `mapeadores/`. Los demás contratos se usan directamente en los servicios por ahora (R-5: no duplicar tipos sin necesidad). Se corrigió `INTENTO_AÑADIDO` a `INTENTO_ANADIDO` (sin eñe en identificadores) en `contratos-preliminares.md`.
- **T-2.2 [X]:** `almacenamientoLocal` con `try/catch`, prefijo `lftime.demo.` y versión de esquema; si el navegador bloquea o llena el almacenamiento, trabaja en memoria durante la sesión e informa el fallo. Pruebas de bloqueo, cuota excedida, versión distinta y otro día. Decisión de diseño: **los datos de otra versión o de otro día no se borran**: se informa `VERSION_DISTINTA` / `DE_OTRO_DIA` y el aviso de demo ofrece restablecer.
- **T-2.3 [X]:** 5 municipios, 5 hospitales, 8 usuarios de prueba y 48 trabajadores (17 con escenario, 31 generados de forma determinista). Reparto 15 / 11 / 10 / 2 / 10. Casos: `hosp-04` sin coordenadas confirmadas, `hosp-05` sin responsable, `hosp-03` con cambio de coordinador y vigencia.
- **T-2.4 [X]:** marcaciones de los 7 días anteriores y de hoy (solo hasta el instante actual), intentos rechazados e incidencias de días pasados. **Las incidencias de hoy no se siembran** (dependen de la hora): las detectará el hito 7 y se crearán en el hito 9. Probado a cada hora del día (24 instantes): sin eventos futuros y con secuencia válida. Tamaño total ≈ 443 KB.
- **T-2.5 [X]:** 6 interfaces `I...Servicio`, implementaciones en `servicios/demo/` y fábrica única. `HospitalServicioDemo` resuelve el coordinador vigente de hoy.
- **T-2.6 [X]:** valores provisionales en `configuracion/reglasProvisionales.ts` (D1: entrada 0 min; D19: 100 m y 25 m; el resto, supuestos del plan §13), servicio con validación (números no negativos). El criterio original pedía también el rótulo «provisional» en pantalla; **ese rótulo visible se verifica en T-12.1** y se ajustó el criterio para reflejarlo.
- **T-2.7 [X]:** «Restablecer datos de demostración» en el aviso de demo (borra todas las claves, regenera y recarga). Probado: borra la configuración editada y vuelve a sembrar.
- **Pendiente de tareas posteriores, no de este hito:** la limpieza de fotos al restablecer (IndexedDB) llega con T-6.2.

### Hito 3 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **126 pruebas** (13 archivos); `npm run verificar:tamano` pasa (116 archivos); `npm run lint` sin hallazgos. No se ha revisado visualmente en un navegador real.

- **T-3.1 [X]:** `Boton`, `Campo`, `Selector`, `Aviso`, `Tarjeta`, `Modal` y `CampoEnvoltorio` (etiqueta, ayuda y error compartidos por `Campo` y `Selector`), cada uno con su CSS. Accesibilidad verificada con pruebas: etiqueta enlazada al control, `aria-invalid` y `aria-describedby` hacia ayuda y error, `role="alert"` en errores, `aria-busy` al cargar, `type="button"` por defecto. El `Modal` mueve el foco al abrirse, lo mantiene dentro (Tab y Mayús+Tab), cierra con Escape o al pulsar fuera y devuelve el foco a quien lo abrió. Sin librerías de UI ni de accesibilidad nuevas.
- **T-3.2 [X]:** `Insignia` (texto obligatorio, símbolo decorativo con `aria-hidden`) e `InsigniaEstado` con el catálogo de 13 estados de D31 (`modelos/estadoVisible.ts` + `presentacionEstado.ts`). Prueba: cada estado se comunica con texto, los 13 textos son distintos y los tres estados añadidos por la referencia («Sin registrar», «Salida anticipada», «Almuerzo prolongado») están en el catálogo.
- **T-3.3 [X]:** `EstadoCarga` (`role="status"`, con respeto a `prefers-reduced-motion`), `EstadoError` (`role="alert"`, reintento opcional), `EstadoVacio` y `Confirmacion` (rótulo «Listo»). Una confirmación nunca afirma guardado permanente: el texto lo decide quien la usa.
- **T-3.4 [X]:** `Tabla` genérica (descripción para lectores de pantalla y vista de fichas en móvil mediante `data-etiqueta`), `Paginacion` («Mostrando 1 - 10 de 48», `aria-current`, máximo 5 páginas numeradas) y `useTablaPaginada` (búsqueda sin distinguir mayúsculas ni tildes, filtros por nombre, vuelta a la página 1 al buscar o filtrar, 10 por página). Utilidad `utilidades/texto.ts`.
- **T-3.5 [X]:** `Avatar` (foto solo si existe **y** hay permiso; si no, iniciales) y la regla provisional `reglas/permisoFoto.ts`: propietario sí; coordinador sí (en la demo todos son «autorizados», plan §13); administrador solo con permiso explícito; trabajador no ve la de otros; sin sesión nadie. Cubre la matriz del criterio de terminado. **Pendiente de validación:** qué significa «coordinador autorizado» en producción (P-13/P-21).
- Ajuste de herramienta: `.oxlintrc.json` desactiva la regla `only-export-components` solo dentro de `src/pruebas/` (los componentes auxiliares de las pruebas viven en el mismo archivo).

### Hito 4 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **155 pruebas** (15 archivos); `npm run verificar:tamano` pasa (140 archivos); `npm run lint` sin hallazgos.

- **T-4.1 [X]:** `ISesionServicio` + `SesionServicioDemo` (guarda solo el identificador del usuario de prueba; **sin contraseñas**), `ProveedorSesion`, `useSesion` y `/ingreso` con los 8 usuarios de prueba y su descripción. Probado: sin sesión se redirige al ingreso; se puede entrar y salir como cada rol; la sesión sobrevive a reabrir la aplicación; un usuario inexistente se rechaza sin dejar sesión; si el usuario guardado ya no existe, no hay sesión. Se recuerda a qué ruta se quería ir si el rol la permite; si no, aterriza en su inicio (trabajador → Registro; coordinador y administrador → Inicio).
- **T-4.2 [~]:** `BarraSuperior` (marca de LFTime con reloj y «Cada minuto cuenta», menú del usuario), `BarraLateral` (iconos propios en SVG, página actual con `aria-current` y color, pie «Fase 1 · demostración») y `MenuPerfil` (nombre, rol y cerrar sesión; se cierra con Escape o al pulsar fuera). En pantallas pequeñas la navegación se abre con el botón «Menú de navegación» (`aria-expanded`) y se cierra al cambiar de página. Estructura construida a partir de la referencia visual. **Pendiente: comparación visual contra `design/panel-coordinacion-referencia.png` y revisión en móvil real**, que no se ha hecho (las pruebas no cargan los estilos). El logo es una representación propia, no el arte final. La campana de alertas y el cambio de tema se añaden en T-9.6 y T-12.3.
- **T-4.3 [X]:** `reglas/permisosRuta.ts` es la **única fuente del menú y de los accesos** (matriz provisional del plan §13, P-21); `RutaProtegida` (exige sesión) y `RestriccionPorRol` (pantalla «no disponible para tu rol»). El aviso fijo «control de acceso por rol es solo visual» está en el aviso de demostración, visible en el ingreso y en todas las pantallas con sesión, y se repite en la pantalla de acceso restringido. Pruebas por rol: menú exacto de cada rol, rutas permitidas y denegadas, y coherencia entre menú y acceso.
- **Decisión de diseño:** la matriz da al trabajador las entradas «Mi ficha», «Mi horario», «Registro» y «Mis incidencias» (interpretación de la matriz del plan: «solo su ficha», «ver el propio» horario, «ver y justificar las propias» incidencias). Es provisional y se confirma con P-21.
- **Corregido durante el hito:** tras iniciar sesión, la redirección al inicio pisaba la ruta recordada; ahora una sola redirección decide el destino.

### Hito 5 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **256 pruebas** (21 archivos); `npm run verificar:tamano` pasa (179 archivos); `npm run lint` sin hallazgos. No se ha revisado visualmente en un navegador real.

- **T-5.1 [X]:** `PaginaHospitales` (lista con búsqueda, filtros por municipio y por estado de coordenadas, paginación, mapa y alta) y `PaginaHospital` (ficha: datos, coordenadas, responsable, personal asignado y edición). Servicio con `crear`, `actualizar`, `confirmarCoordenadas` y `asignarCoordinador`, con auditoría y mensajes de error comprensibles. Quien puede editar (coordinador) y quien puede asignar responsable (administrador) sale de `reglas/permisosHospital.ts` (solo visual, D27). Un hospital nuevo toma el radio y la precisión de las reglas provisionales vigentes y queda sin coordenadas (no admite marcaciones).
- **T-5.2 [X]:** `validadores/coordenadas` (rangos de ±90 y ±180, numérico, obligatorio, coma decimal) y `validadores/hospital`. Pruebas en los extremos (±90, ±180, justo fuera del rango), vacíos, texto, notación científica, `NaN`, `Infinity` y signo `+`.
- **T-5.3 [X]:** `utilidades/geolocalizacion` (geolocalización **real** del navegador, entorno inyectable solo para pruebas) y `useUbicacion`. Comprueba contexto seguro y permiso **en cada intento**; con permiso bloqueado no insiste y da instrucciones; distingue permiso denegado, bloqueado, ubicación no disponible, tiempo agotado y contexto no seguro; nunca inventa una ubicación. No valida precisión ni radio (eso es del hito 7).
- **T-5.4 [~]:** `FormularioCoordenadas` con los dos modos (manual y GPS del coordinador); el GPS **muestra la precisión antes de confirmar** y advierte, sin impedir, si supera el máximo provisional de 25 m; el historial de cambios guarda quién, cuándo y el valor anterior. Cubierto con pruebas automáticas (CA-7). **Pendiente: verificación manual en un dispositivo con GPS real**, que no se ha hecho.
- **T-5.5 [X]:** insignia «Sin coordenadas confirmadas» en lista y ficha y aviso «necesita configuración antes de habilitar el registro» (CA-6, CA-11). El aviso que verá el **trabajador** en su pantalla de registro llega con T-8.5.
- **T-5.6 [~]:** `MapaEsquematico` en SVG propio (proyección ilustrativa, marcadores accesibles con teclado, lista aparte de los hospitales sin coordenadas, nota «mapa ilustrativo»). Evidencia de que no usa servicios externos: ningún `fetch`, `XMLHttpRequest`, `WebSocket` ni URL en el código de producción, y el paquete compilado solo contiene espacios de nombres XML y enlaces de documentación de React (no son peticiones). **Pendiente: comprobarlo en la pestaña de red del navegador**, como pide el criterio; se repite en T-12.5.
- **T-5.7 [X]:** asignación del coordinador responsable por el administrador, con motivo opcional. Cambiar cierra la vigencia anterior (`vigenteHasta` = ayer), abre una nueva desde hoy y no borra nada; rechaza a quien ya es responsable y a quien no es coordinador; un hospital sin responsable lo dice y explica que sus incidencias quedan pendientes de asignación. Si se cambia dos veces el mismo día, el historial se conserva completo.
- **Cambios de contrato:** `HospitalDto.historialCoordenadas` y `EntradaAuditoriaDto.detalle`; la versión del esquema de la demostración pasó a **2** (los datos guardados de la versión 1 muestran el aviso «otra versión» y ofrecen restablecer).
- **Detalle a confirmar:** si en producción se puede quitar el responsable sin reemplazarlo (hoy solo se cambia o se asigna), y qué administradores son «autorizados» (P-28).

### Hito 6 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **376 pruebas** (28 archivos); `npm run verificar:tamano` pasa (232 archivos); `npm run lint` sin hallazgos. No se ha revisado visualmente en un navegador real.

- **T-6.1 [X]:** `PaginaPersonal` (lista de 48 con búsqueda sin tildes por nombre, documento, cargo u hospital; filtros por hospital y estado; paginación; cédula visible según D17; alta para administración y coordinación) y `PaginaTrabajador` (ficha: datos, estado, foto, horario). El trabajador que entra a Personal va directo a su ficha y no puede abrir la de otra persona. Validación (`validadores/trabajador`) con **lista provisional de tipos de documento** (CC, CE, PPT, PA, P-13). **Supuesto provisional añadido:** un solo trabajador por documento (se rechaza un documento repetido aunque cambie el formato); no está en la spec, hay que confirmarlo. Los estados distintos de «Activo» se marcan como suprimidores de la detección (P-20). **Pendiente de otros hitos:** el «historial de jornadas e incidencias» de la ficha (HU-02) llega con los hitos 8, 9 y 11, cuando existan esos módulos.
- **T-6.2 [X]:** `IAlmacenFotos` y `AlmacenFotosIndexedDb`. Probado contra un IndexedDB simulado (`fake-indexeddb`, dependencia **solo de pruebas**): guardar, leer, reemplazar sin contar doble, eliminar, máximo de 100 fotos (reemplazar una existente sí se permite), IndexedDB inexistente, apertura bloqueada con recuperación al reintentar, cuota excedida y otros fallos de escritura. Ante cualquier fallo la lectura devuelve «sin foto» y la escritura explica el motivo; la app sigue funcionando.
- **T-6.3 [~]:** `validadores/foto` (JPG, JPEG, PNG, WebP; decide por el tipo y, si no lo hay, por la extensión) y `prepararFoto` (no toca lo que ya cabe en 2 MB; si pesa más prueba 4 tamaños × 4 calidades; nunca devuelve algo mayor de 2 MB; informa formato inválido, imagen ilegible o imposibilidad de comprimir). Probado con un motor de imagen simulado. **Pendiente: probar `MotorImagenCanvas` en un navegador real con una foto grande de teléfono**; jsdom no tiene `canvas` y ese motor no se ha ejecutado.
- **T-6.4 [X]:** `FotoServicioDemo`, `useFotoPerfil`, `SelectorFoto`, `AvatarPersona` y la opción «Mi foto de perfil» del menú del usuario (todo usuario, también administración, D14). Cada persona cambia solo la suya; coordinación ve la de los trabajadores; el administrador solo con permiso explícito (D24, D30). **Retirar borra solo la imagen**: marcaciones, intentos e incidencias quedan intactos (probado). Restablecer la demostración borra también las fotos. Los fallos de almacenamiento se explican y la app sigue sin foto. **Los avatares de otras pantallas** (tablas, ficha de hospital) reaccionan a cambios de foto mediante un aviso interno.
- **T-6.5 [X]:** `PaginaJornadas`, `TablaHorarios`, `PanelHorarioTrabajador`, `FormularioHorario` y `HorarioServicioDemo.asignar`. El coordinador asigna y edita horario y almuerzo; el administrador consulta; el trabajador ve solo «Mi horario». Un horario nuevo **se añade** con su fecha de inicio y los anteriores se conservan; el historial marca «(vigente)» y «(programado)». Se acepta el turno que cruza la medianoche (también con el almuerzo pasada la medianoche). Supuestos provisionales (P-07): rige desde hoy o una fecha futura, no repite la fecha de otro horario, al menos un día, la salida distinta de la entrada, el almuerzo dentro de la jornada y la duración cabe en el intervalo. Todo queda en auditoría.
- **Cambios técnicos:** `utilidades/horas` (extraída de los datos de demostración y reutilizada por los validadores) y `useCarga`. `package.json` suma `fake-indexeddb` 6.2.5 (solo desarrollo); `plan.md` §3 lo justifica.
- **Para confirmar:** documento único por trabajador; lista de tipos de documento; límites del formulario de horario (P-07); que nadie cambie la foto de otra persona, ni siquiera administración o coordinación.
