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
| [X] T-7.1 | `reglas/duraciones`: efectivo, almuerzo, total; cómputo **incompleto** sin duración estimada | T-1.4, T-2.1 | Pruebas con el ejemplo de la spec §6 y con marcaciones faltantes; total = efectivo + almuerzo | D16 |
| [X] T-7.2 | `reglas/secuencia`: impide secuencias inválidas, duplicados y salida sin jornada abierta | T-2.1 | Pruebas de todas las transiciones | HU-05 |
| [X] T-7.3 | `reglas/fechaOperativa` (provisional P-04) | T-1.4 | Pruebas de turno que cruza medianoche | D5, P-04 |
| [X] T-7.4 | `reglas/distanciaGeografica` (Haversine) | T-2.1 | Pruebas con distancias conocidas | D19 |
| [X] T-7.5 | `reglas/evaluarMarcacion`: válida, fuera de radio, fallo técnico | T-7.4, T-2.6 | Pruebas de 100 m y 25 m exactos, por encima y por debajo | D19, D23 |
| [X] T-7.6 | `reglas/estadoActual` del trabajador con el catálogo de estados | T-7.1, T-2.6 | Pruebas por estado; respeta estado inactivo (P-20) | D31 |
| [X] T-7.7 | `reglas/detectarIncidencias` (tolerancias y umbrales de `configuracion`) | T-7.6 | Una prueba por tipo de incidencia; no genera ninguna acción sancionatoria | HU-06, P-18 |
| [X] T-7.8 | `reglas/agruparIntentos` por trabajador + fecha operativa + hospital | T-7.3, T-7.5 | CA-12, CA-14 | D26 |

## Hito 8: Registro del trabajador y geolocalización

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [~] T-8.1 | Pantalla `/registro` (móvil): jornada del día, **solo la acción siguiente permitida**, contador mientras la jornada está abierta (los tiempos oficiales salen de las marcas) | T-7.1, T-7.2, T-4.2 | Verificación manual en móvil; CA-3 | HU-05 |
| [~] T-8.2 | Flujo de marcación con geolocalización real y servicio de marcaciones | T-5.3, T-7.5, T-2.5 | CA-1, CA-2; nunca se simula ni se marca sin coordenadas | D13 |
| [X] T-8.3 | Intentos rechazados guardados aparte, con motivo; fallos técnicos sin incidencia de ubicación indebida | T-8.2, T-7.8 | CA-3, CA-4, CA-5, CA-14 | D23 |
| [~] T-8.4 | Instrucciones cuando el permiso está bloqueado; reintento que vuelve a comprobar permisos | T-8.2 | Verificación manual en navegador | D13 |
| [X] T-8.5 | Hospital sin coordenadas confirmadas: explicación y sin botón de marcar | T-5.5, T-8.1 | CA-11 | D25 |
| [X] T-8.6 | Historial propio del trabajador; aviso «ubicación capturada, no validada por el servidor» | T-8.1 | CA-10 | D13 |

## Hito 9: Incidencias, alertas y auditoría

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-9.1 | Lista y detalle de incidencias con filtros, y detalle con todos los intentos asociados | T-3.4, T-7.7, T-7.8 | CA-5, CA-12 | HU-06 |
| [X] T-9.2 | Justificación (trabajador sobre las propias; coordinador en su nombre con motivo), texto sin adjuntos | T-9.1 | Prueba por rol | P-16 |
| [X] T-9.3 | Resolución (justificada / no justificada / pendiente de información), historial inmutable, reabrir con motivo; **sin ninguna sanción** | T-9.1 | CA-13; los intentos no cambian | D11, P-17, P-18 |
| [X] T-9.4 | Escalada manual con motivo; intervención directa del administrador; bandeja «pendientes de asignación» | T-9.3, T-5.7 | Prueba de incidencia en hospital sin responsable | D28, D29 |
| [X] T-9.5 | Registro de auditoría de cambios de horario, coordenadas, asignaciones, resoluciones y escaladas | T-9.3 | Cada acción deja quién, cuándo y por qué | D29 |
| [X] T-9.6 | Alertas y campana con contador; alerta revisada al abrir la incidencia | T-9.1 | Texto distingue leído/sin leer (no solo color) | HU-07, P-19 |
| [-] T-9.7 | ~~Corrección manual de una marcación por el coordinador, con permiso, motivo y auditoría~~ | — | **DESCARTADA (2026-10-27):** el responsable decidió que no habrá corrección manual de marcaciones (D-B23 de `specs/002-lftime-backend/spec.md`); P-12 queda resuelta en ese sentido | HU-05 |

## Hito 10: Panel de coordinación

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-10.1 | Tarjetas de indicadores con enlace al detalle filtrado | T-7.6, T-3.1 | Cada indicador lleva a su lista | HU-01 |
| [~] T-10.2 | Tabla «Personal en tiempo real» (búsqueda, filtros por municipio y estado, paginación, acciones) | T-3.4, T-7.6 | Igual de estructura a la referencia | HU-01 |
| [X] T-10.3 | Panel de alertas, resumen por hospital, mapa de hospitales | T-9.6, T-5.6 | Resumen coherente con los datos | HU-01 |
| [X] T-10.4 | Horas trabajadas hoy, estados del personal y promedio de almuerzo, **con tiempos separados** | T-7.1 | Coherentes con `reglas/duraciones` | HU-01, D21 |
| [X] T-10.5 | Actualización cada 60 s (configurable) y botón «Actualizar» con «última actualización» | T-10.2 | Verificado con el reloj | P-25 |

## Hito 11: Informes y exportación

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-11.1 | `utilidades/exportacion`: CSV y Excel (ExcelJS aislado tras `IExportadorExcel`); nombre `DEMO_...` y fila de encabezado DEMO | T-1.5 | **Marca DEMO en nombre y encabezado, CSV y Excel**; ningún otro módulo importa `exceljs` | D36, D34 |
| [X] T-11.2 | Pantalla de informes: asistencia diaria, horas por trabajador, incidencias, intentos rechazados, cumplimiento por hospital, con filtros | T-7.1, T-9.1, T-3.4 | Distingue programadas, registradas, descanso y efectivo | HU-08 |
| [~] T-11.3 | Botones de exportación por informe y prueba de contenido | T-11.1, T-11.2 | Los archivos abren y su contenido coincide con la pantalla | P-23 |

## Hito 12: Configuración, pulido y revisión final

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-12.1 | Pantalla `/configuracion` (solo administrador): reglas provisionales, usuarios de prueba, restablecer | T-2.6, T-2.7 | Todos los valores rotulados «provisional» | HU-09 |
| [~] T-12.2 | Revisión responsiva (teléfono, tableta, escritorio) y accesibilidad (teclado, etiquetas, contraste, estado por texto) | Hitos 4-11 | Lista de verificación firmada por pantalla | Spec §8 |
| [X] T-12.3 | **Tema claro y oscuro** con preferencia guardada y cambio en el menú del perfil | T-1.3, T-4.2 | Nombre accesible dice a qué tema cambia; colores verificados en ambos temas | D32 |
| [X] T-12.4 | Revisión de criterios CA-1…CA-14 y de HU-01…HU-09 | Hitos 4-11 | Matriz CA/HU → prueba o verificación, completa | Spec §5, §5.1 |
| [~] T-12.5 | Auditoría final: límite de 250 líneas, español, JSDoc, sin lógica en componentes, sin servicios externos (pestaña de red) | Todo | `verificar:tamano` pasa; informe sin hallazgos abiertos | R-1…R-6, CA-10 |
| [~] T-12.6 | Documento de traspaso a la Fase 2 (contratos, reglas provisionales que deben validarse, autorización real, consentimientos) | T-12.4 | Entregado y revisado | Plan §17 |

---

## Hito 13: Aplicación móvil del trabajador y foto solo en la ficha

| ID | Tarea | Depende de | Criterio de terminado | Traza |
|----|-------|-----------|-----------------------|-------|
| [X] T-13.1 | Disposición móvil con barra inferior (Inicio, Historial, Perfil) para el trabajador; el resto de roles conserva el panel | T-4.2 | Prueba de menú por rol | D40 |
| [X] T-13.2 | Pantalla principal, confirmación (almuerzo aparte), «Se requiere tu ubicación» y detalle de jornada | T-8.x | Pruebas del flujo de registro | D40, HU-05 |
| [X] T-13.3 | Historial por día con intentos aparte y resumen con tres tiempos | T-8.x | Pruebas de historial y «Incompleto» | D40, CA-5 |
| [X] T-13.4 | Ingreso con «Usuario o cédula» y contraseña no validada, más lista de usuarios de prueba | T-4.x | Prueba de ingreso | D40, D9 |
| [X] T-13.5 | Foto de perfil solo en la ficha, editable con el botón de la cámara; fuera de barra, menú y app móvil | T-6.x | Pruebas de foto | D41 |
| [X] T-13.7 | Ficha del trabajador con tarjeta «Jornada de hoy»: cronómetro en vivo (corre, se pausa en el almuerzo, se detiene al salir), marcaciones con hora programada y registrada, resumen con tramos, almuerzo frente a lo autorizado y total | T-13.2 | Pruebas de la tarjeta y de las reglas del cronómetro | HU-02, D16 |
| [X] T-13.8 | Reportes: nombres e incidencias como enlaces, desglose de la diferencia con lo programado (entrada, almuerzo, salida), columna de diferencia fija, tabla sin apretar | T-11.2 | Pruebas de enlaces y del desglose (los aportes suman la diferencia) | HU-08, D38 |
| [X] T-13.9 | Informes «Acumulado mensual» y «Tiempo por reponer» con desglose día por día | T-13.8 | Pruebas de las reglas y de la pantalla | HU-08 |
| [X] T-13.10 | Fechas de informes: por defecto solo hoy, ocultas tras «Filtrar por fechas»; los informes mensuales usan el mes en curso | T-13.8 | Pruebas de periodo por defecto | HU-08 |
| [~] T-13.6 | Revisión visual frente al diseño en un teléfono real y en ambos temas | T-13.1 a T-13.5 | Revisada pantalla por pantalla | D40 |

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

### Hito 7 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **449 pruebas** (33 archivos); `npm run verificar:tamano` pasa (248 archivos); `npm run lint` sin hallazgos. Todo son funciones puras en `reglas/`, sin acceso a datos ni al reloj (reciben `ahora`). Los umbrales y tolerancias salen de `configuracion`.

- **T-7.1 [X]:** `reglas/duraciones` (`calcularDuraciones`, `instantesDeJornada`). Reproduce el ejemplo de la spec §6 (8 h + 1 h = 9 h). Los instantes se truncan al minuto, así que total = efectivo + almuerzo siempre. Sin salida final, sin regreso o con marcas desordenadas: efectivo y total son `null` (incompleto); el almuerzo se entrega si existen sus dos marcas. Tratamiento laboral del almuerzo y horas extra siguen abiertos (P-03, P-05): no se decide nada.
- **T-7.2 [X]:** `reglas/secuencia` (`siguienteMarcacion`, `validarSecuencia`): rechaza duplicados (`DUPLICADA`), eventos sin entrada (`SIN_JORNADA_ABIERTA`, incluida la salida final) y saltos (`FUERA_DE_SECUENCIA`). La corrección autorizada sigue bloqueada por P-12 (T-9.7).
- **T-7.3 [X]:** `reglas/fechaOperativa` + `reglas/turnoProgramado`. P-04 provisional: la jornada pertenece a la fecha en que empieza el turno; se compara el turno del día anterior, el mismo y el siguiente (gana el que contiene el instante o, si ninguno, el más cercano). Probado con turno nocturno (22:00-06:00), entrada anticipada antes de medianoche y fecha de Colombia frente a UTC.
- **T-7.4 [X]:** `reglas/distanciaGeografica` (Haversine, radio 6 371 008,8 m). Probado con 1° de latitud (≈111,2 km), 1° de longitud a 0° y 60°, y Bogotá-Medellín.
- **T-7.5 [X]:** `reglas/evaluarMarcacion`. Recibe los límites como parámetro (el llamador elige los del hospital o los de `configuracion`; a decidir en T-8.2). Primero la precisión: con precisión peor que el máximo es **fallo técnico** aunque esté lejos (CA-14); luego el radio. Los límites exactos son válidos y solo lo que los supera se rechaza (probado en radio y en precisión). Hospital sin coordenadas confirmadas devuelve `HOSPITAL_SIN_COORDENADAS` (D25).
- **T-7.6 [X]:** `reglas/estadoActual` con el catálogo D31. Definiciones **provisionales** que conviene confirmar (P-01, P-02): sin entrada pasada la hora → «Retraso» y, tras 60 min, «Ausencia aparente»; **entrar tarde no deja el estado en «Retraso»** (queda «En jornada» y la anomalía se ve como incidencia de entrada tardía); almuerzo pasado de lo autorizado → «Almuerzo prolongado» y, tras 30 min, «Sin registrar»; sin salida 60 min tras el fin → «Sin registrar». «Incidencia» solo se aplica si el llamador indica que hay una abierta y no oculta retraso ni ausencia. Devuelve `null` cuando no se espera nada (sin horario, día no laborable, aún no empieza, hospital sin coordenadas); el catálogo no tiene un estado para eso y no se inventó uno.
- **T-7.7 [X] (criterio ajustado):** `reglas/detectarIncidencias` detecta los **9 tipos temporales**, uno por prueba. `UBICACION_NO_AUTORIZADA` no sale de aquí sino de los intentos rechazados (`agruparIntentos`), según D23; por eso el criterio «una prueba por tipo» se cumple para esos 9 y el décimo se cubre en T-7.8. Definiciones provisionales que hay que confirmar: `SIN_ENTRADA` = hay marcas posteriores pero falta la entrada, y `AUSENCIA_APARENTE` = ninguna marca (la spec no distingue ambos); `REGRESO_TARDIO` = sin regreso 30 min después del almuerzo autorizado, y `ALMUERZO_EXCEDIDO` = almuerzo completo más largo que lo autorizado; `TIEMPO_INFERIOR` descuenta la suma de las tres tolerancias; con tolerancias en 0 una entrada tardía produce también `TIEMPO_INFERIOR` (son hechos distintos de la spec, pero el coordinador verá dos incidencias). Un trabajador sin estado activo no genera nada (P-20). El resultado solo trae tipo e instante de detección: nunca consecuencias (probado, P-18).
- **T-7.8 [X]:** `reglas/agruparIntentos` (`agruparIntentos`, `resolverAgrupacion`): una incidencia por trabajador + fecha operativa + hospital, con todos sus intentos (CA-12); los fallos técnicos quedan fuera (CA-14); indica si hay que abrir la incidencia o añadir solo los intentos que aún no lista. No modifica los intentos.
- **Sin cambios de contrato** ni de la versión del esquema de la demostración. **No se tocó la interfaz**; las reglas se conectan a pantallas en los hitos 8 a 10.
- **Para confirmar con el responsable:** las definiciones provisionales de T-7.6 y T-7.7 señaladas arriba (en especial si entrar tarde debe seguir mostrándose como «Retraso»).

### Hito 8 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **467 pruebas** (35 archivos); `npm run verificar:tamano` pasa (268 archivos); `npm run lint` sin hallazgos. **Nada de este hito se ha probado con un GPS real ni en un teléfono**: las pruebas sustituyen `obtenerUbicacionActual` por una respuesta controlada (solo en pruebas) y jsdom no carga los estilos.

- **Arquitectura:** `IMarcacionServicio` + `MarcacionServicioDemo` (orquesta las reglas del hito 7 y guarda en el almacenamiento local), `asociarIntentoAIncidencia` (agrupa en una incidencia por trabajador + fecha operativa + hospital, abre su alerta y la deja «pendiente de asignación» si el hospital no tiene responsable), `useRegistroJornada` y `useContador`, y `PaginaRegistro` con `AccionDeRegistro`, `MensajeResultadoRegistro`, `ResumenJornadaDelDia` e `HistorialPropio`. Sin cambios de contrato ni de la versión del esquema.
- **T-8.1 [~]:** `/registro` muestra la jornada del día, **solo la acción siguiente permitida**, el estado, los tiempos efectivo, de almuerzo y total por separado (con «Incompleto» si falta una marca), el horario planificado y un contador desde la entrada rotulado como referencia (los tiempos oficiales salen de las marcas). Probado por componentes. **Pendiente: verificación manual en un móvil.**
- **T-8.2 [~]:** el flujo pide la ubicación real en cada intento (`useUbicacion`), la entrega al servicio y nunca marca sin coordenadas ni simula una (CA-1, CA-2 probados con ubicación controlada). **Pendiente: probar con GPS real** (permiso, precisión y radio en un dispositivo).
- **T-8.3 [X]:** los intentos rechazados se guardan aparte con su motivo. Fuera de radio con ubicación válida: intento + incidencia de ubicación no autorizada + alerta (CA-4); varios intentos el mismo día y hospital comparten **una** incidencia (CA-12); fallo técnico y precisión insuficiente: solo intento, sin incidencia ni alerta y con texto «Fallo técnico» (CA-14); un intento no cambia tiempos ni secuencia (CA-3).
- **T-8.4 [~]:** con el permiso bloqueado se muestran las instrucciones del navegador (candado, «Configuración del sitio») y el botón vuelve a pedir la ubicación y a comprobar el permiso (probado que se llama dos veces). **Pendiente: verificación manual en un navegador real** con el permiso realmente bloqueado.
- **T-8.5 [X]:** hospital sin coordenadas confirmadas: aviso «necesita configuración antes de habilitar el registro», ningún botón de marcar y el servicio devuelve `HOSPITAL_SIN_COORDENADAS` sin guardar nada (CA-11).
- **T-8.6 [X]:** historial propio con marcaciones e intentos rechazados en tablas separadas (CA-5, últimas 20 de cada una) y aviso «las ubicaciones se capturan en tu dispositivo y no están validadas por el servidor» (CA-10); tras registrar, el mensaje dice «ubicación capturada… no está validada por un servidor».
- **Decisiones de implementación a confirmar:** (1) los límites de radio y precisión que se aplican son los **del propio hospital** (copiados de la configuración al crearlo), no los de `/configuracion`; si se quiere que editar la configuración afecte a hospitales existentes, hay que decidirlo en T-12.1. (2) Un trabajador sin horario vigente **puede** marcar (ninguna regla lo impide); la pantalla solo avisa. (3) Un trabajador no activo tampoco está bloqueado para marcar (la spec solo dice que no se le detectan incidencias, P-20).
- **Pendiente para el hito 9:** la lista y el detalle de las incidencias creadas aquí, y la creación de incidencias por las reglas temporales (`detectarIncidencias`); aún no se ven en ninguna pantalla.

### Hito 9 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **499 pruebas** (38 archivos); `npm run verificar:tamano` pasa (300 archivos); `npm run lint` sin hallazgos. No se ha revisado visualmente en un navegador real. **T-9.7 sigue `[B]`** (P-12): no se implementó ninguna corrección manual de marcaciones.

- **Detección (`sincronizarIncidencias`):** las incidencias de hoy las abren las reglas del hito 7 (`detectarIncidencias`) sobre la jornada actual de cada trabajador, con su alerta (P-19). Es idempotente (el identificador sale de tipo + trabajador + fecha operativa), solo añade y solo mira la fecha operativa de «ahora» (los días anteriores traen su semilla). **En la demostración corre cuando alguien abre la lista de incidencias o la campana**; no hay un proceso continuo (el refresco cada 60 s llega con T-10.5). Un único `abrirIncidencia` crea también las de ubicación no autorizada del hito 8.
- **T-9.1 [X]:** `PaginaIncidencias` (búsqueda, filtros por estado, tipo, hospital y situación —pendientes de asignación o escaladas—, paginación) y `PaginaIncidencia` (datos, intentos asociados con hora, coordenadas, precisión, distancia y motivo, justificaciones, historial y acciones). El trabajador solo ve las suyas («Mis incidencias») y no abre las de otra persona. Los intentos aparecen separados de las marcaciones (CA-5 en pantallas; los informes llegan en el hito 11) y la incidencia agrupada los lista todos (CA-12).
- **T-9.2 [X]:** justifica el trabajador sobre las propias o el coordinador revisor en su nombre, **con motivo obligatorio**; texto sin adjuntos, hasta 1000 caracteres (P-16). El autor de las justificaciones nuevas es el **usuario**; las sembradas guardan el trabajador, y la pantalla resuelve ambos nombres.
- **T-9.3 [X]:** «Iniciar revisión», resolución (justificada / no justificada / pendiente de información), reabrir con motivo. **El motivo de toda resolución es obligatorio** (decisión mía, para cumplir «quién, cuándo y por qué»; hay que confirmarla). Cerrada = justificada o no justificada; una cerrada no admite justificar ni resolver, solo reabrir (pasa a «En revisión»). Una justificación sobre una «pendiente de información» la devuelve a «En revisión» (supuesto provisional). «No justificada» usa un tono neutro y solo queda registrada (P-18). Los intentos originales no cambian (CA-13, probado).
- **T-9.4 [X]:** escalada manual con motivo (solo una vez y solo el revisor), intervención directa del administrador (revisa, resuelve y reabre cualquiera; **interpretación provisional de «cuando se requiera»**, D29) y bandeja «pendientes de asignación» del administrador con asignación de revisor a la incidencia (`ASIGNADA`). Probado con una incidencia de un hospital sin responsable.
- **T-9.5 [X]:** auditoría de resoluciones, reaperturas, escaladas y asignaciones de revisor (quién, cuándo, motivo y detalle); los cambios de horario, coordenadas y coordinador ya se auditaban en los hitos 5 y 6. **No hay pantalla para consultar la auditoría** (el plan no la pide); cada incidencia muestra su historial.
- **T-9.6 [X]:** campana en la barra superior para coordinación y administración (el trabajador no ve alertas, P-19): «Alertas: N sin revisar», lista de las más recientes con el texto «Sin revisar» o «Revisada» y enlace a la incidencia. La alerta se marca revisada al abrir la incidencia quien revisa; las alertas no se descartan. El contador se actualiza al cambiar de pantalla.
- **Permisos (`reglas/permisosIncidencia`, solo visuales, D27):** provisionales, de la matriz del plan §13. Otro coordinador que no es el revisor **ve pero no actúa**. Es una interpretación de «revisor principal de sus hospitales» a confirmar con P-21 y P-28.
- **Sin cambios de contrato** ni de la versión del esquema. Nuevos: `IIncidenciaServicio`, `IAlertaServicio`, `modelos/alerta`, `modelos/etiquetasIncidencia` y los componentes de `componentes/incidencias/` y `MenuAlertas`.
- **Para confirmar con el responsable:** motivo obligatorio en toda resolución; intervención del administrador sobre cualquier incidencia; que otro coordinador no pueda actuar; el paso a «En revisión» tras una justificación.

### Hito 10 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **522 pruebas** (41 archivos); `npm run lint` sin hallazgos; `npm run verificar:tamano` pasa (326 archivos). Revisado a mano en Chrome (escritorio, ventana estrecha) como coordinadora: carga, tarjetas, tabla, resumen por hospital y mapa se ven bien. **No se revisó en tableta ni en otras anchuras, ni la pantalla completa frente a la referencia píxel a píxel** (por eso T-10.2 queda `[~]`).

- **Arquitectura:** `IPanelServicio` + `PanelServicioDemo` (arma una fila por trabajador con `estadoActual`, `duraciones` y `turnoProgramado`; solo lee), `reglas/indicadoresPanel` (indicadores, resumen por hospital, horas, estados, promedio de almuerzo; funciones puras), `calcularEfectivoHastaAhora` en `reglas/duraciones`, `usePanel`, `PaginaInicio` y los componentes de `componentes/panel/`. Ruta `/inicio` (antes en construcción). Sin cambios de contrato ni de la versión del esquema.
- **T-10.1 [X]:** seis tarjetas (activos, en jornada, en almuerzo, con retraso, sin entrada, con incidencias). Las cuatro de estado llevan a la tabla filtrada (`/inicio?indicador=…`, el número de la tarjeta coincide con el de la tabla, probado); activos va a Personal e incidencias a Incidencias.
- **T-10.2 [~]:** tabla con búsqueda, filtros por municipio y estado, paginación y «Ver detalle». Pendiente la comparación visual con la referencia en tableta/escritorio ancho.
- **T-10.3 [X]:** alertas (sin revisar primero, con texto «Sin revisar/Revisada»), resumen por hospital «presentes / esperados» y mapa esquemático.
- **T-10.4 [X]:** horas programadas vs. registradas hasta ahora (solo efectivo), estados del personal (anillo + lista con texto) y promedio de almuerzo aparte (D21).
- **T-10.5 [X]:** actualización cada `intervaloActualizacionSegundos` (60 s) y botón «Actualizar»; la tabla conserva búsqueda y página; si falla, se conservan los datos y se avisa. Probado con el reloj.
- **Definiciones provisionales a confirmar:** (1) «con retraso» = entrada posterior a la hora programada (tolerancia de configuración) **o** sin entrada pasada la hora; «sin entrada» es el subconjunto sin entrada; «en jornada/almuerzo» salen de la última marca de hoy. Sigue abierto si quien entra tarde debe mostrarse con estado «Retraso» (hito 7). (2) Las horas registradas son **parciales** durante el día y la «diferencia» es del momento, no un incumplimiento. (3) El panel muestra a **todo** el personal a cualquier coordinador, sin limitarlo a sus hospitales (permisos solo visuales, P-21). (4) «Esperado hoy» = activo, con horario laborable hoy y hospital con coordenadas confirmadas. (5) «Ver mapa completo» y «Ver hospitales» llevan a Hospitales; no hay reportes aún (hito 11).
- **Pruebas existentes ajustadas:** `App.prueba.tsx` buscaba el título provisional «Inicio»; ahora busca el saludo «Hola, …».

### Hito 11 (2026-10-23)

Resultado: `npm run build` compila (ExcelJS queda en un fragmento aparte que solo se descarga al exportar a Excel); `npm test` pasa **544 pruebas** (44 archivos); `npm run lint` sin hallazgos; `npm run verificar:tamano` pasa (355 archivos). Se revisó a mano en Chrome la carga de `/reportes`; **no se abrieron los archivos descargados en Excel ni LibreOffice** (se comprobaron releyéndolos con ExcelJS y analizando el CSV en las pruebas).

- **Arquitectura:** `IInformeServicio` + `InformeServicioDemo` (solo entrega lo registrado), `reglas/informes/` (funciones puras: `periodo`, `jornadasDelPeriodo` y un archivo por informe, unidos por `construirInforme`), `utilidades/exportacion/` (`csv`, `prepararArchivo`, `descargarArchivo`; `IExportadorExcel` ya existía), `useInformes`, `useExportarInforme` y `PaginaInformes` con `FormularioFiltrosInforme`, `TablaDeInforme` y `BotonesExportacion`. Ruta `/reportes`. Nueva utilidad `fechaColombiaDe`. Sin cambios de contrato ni de la versión del esquema.
- **T-11.1 [X]:** CSV sin librería y Excel con ExcelJS (solo en `ExportadorExcelExceljs`). Nombre `DEMO_<informe>_<AAAAMMDD>.csv|xlsx` y primera fila «DEMO — datos de demostración, sin validez» en ambos (probado leyendo el .xlsx y el CSV). El CSV lleva BOM UTF-8, entrecomilla lo necesario y antepone un apóstrofo a las celdas que parecerían fórmulas.
- **T-11.2 [X]:** cinco informes (asistencia diaria, horas por trabajador, incidencias, intentos rechazados, cumplimiento por hospital) con filtros por informe, trabajador, hospital, municipio y periodo (inicial: última semana; máximo 92 días; los días futuros no se evalúan). Horas separa programadas, efectivo, almuerzo y total (D21); las jornadas incompletas no se estiman y el informe lo dice (D16). Búsqueda y paginación solo afectan a lo que se ve.
- **T-11.3 [~]:** botones «Exportar CSV» y «Exportar Excel». La tabla que se exporta es **la misma** que se muestra (prueba: el CSV tiene tantas filas como la pantalla). **Pendiente: descargar un archivo desde un navegador real y abrirlo en Excel o LibreOffice** (lo mismo que deja abierta T-1.5); no lo hice porque descarga un archivo al equipo.
- **Decisiones provisionales a confirmar (P-03, P-05, P-06, P-23):** (1) en «Horas por trabajador», efectivo, almuerzo y total suman **solo jornadas completas**; la diferencia compara con lo programado de esas mismas jornadas; las programadas cuentan todos los días laborables del periodo hasta hoy. (2) En «Cumplimiento por hospital» las columnas de incidencias son **dos** (pendientes y resueltas) en vez de una combinada; «retraso» y «salida anticipada» usan las tolerancias de configuración. (3) Los estados de «Asistencia diaria» se calculan con la hora actual, así que un día pasado sin registros aparece como «Ausencia aparente» o «Sin registrar». (4) Los periodos de más de 92 días se rechazan. (5) Cualquier coordinador ve los informes de todo el personal (permisos solo visuales, P-21). (6) No hay informe «historial por trabajador» ni formato oficial o legal (sigue abierto con P-23 y P-13).
- **Pruebas existentes ajustadas:** `App.prueba.tsx` buscaba el título provisional «Reportes»; ahora busca «Informes».

### Hito 12 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **561 pruebas** (47 archivos); `npm run lint` sin hallazgos; `npm run verificar:tamano` pasa (371 archivos); `npm run verificar:contraste` (nuevo) pasa. **El hito queda con tareas en `[~]`: faltan verificaciones que solo se pueden hacer a mano** (ver `matriz-verificacion.md`, «Qué falta»).

- **T-12.1 [X]:** `/configuracion` (solo administración): las nueve reglas provisionales con su unidad, ayuda, decisión de origen y el rótulo «Provisional», validación de rango y de enteros (todos los errores juntos), guardar, restablecer valores por defecto, lista de solo lectura de los usuarios de prueba y restablecimiento de los datos con confirmación. Revisada en Chrome. **Decisión pendiente (del hito 8):** el radio y la precisión solo se copian a los hospitales **nuevos**; editarlos aquí no cambia los existentes, y la pantalla lo dice. Guardar la configuración no deja auditoría (el servicio no recibe el usuario).
- **T-12.2 [~]:** no se pudo revisar ninguna pantalla en móvil ni en tableta: la herramienta del navegador no cambió el ancho de la ventana. Solo se verificó que las hojas de estilo tienen puntos de corte (720 y 1100 px) y que las tablas se convierten en fichas en pantalla pequeña. **Pendiente: la revisión por pantalla y la lista firmada.** Accesibilidad: contraste comprobado con script (T-12.3); estados siempre con texto (probado en varias pantallas); la navegación por teclado se probó en menús y formularios por pruebas, no con una revisión completa.
- **T-12.3 [X]:** tema claro y oscuro con tokens en `index.css` (`data-tema` en la raíz), preferencia guardada (`lftime.preferencia.tema`, fuera del prefijo de la demo para que restablecer los datos no la borre; sin preferencia sigue al sistema) y botón en el menú del perfil que dice a qué tema cambia. Se separó el color de títulos y enlaces (`--color-titulo`, `--color-acento`) del azul de las barras. `npm run verificar:contraste` comprueba 25 pares en los dos temas (≥ 4.5:1) y obligó a **oscurecer los verdes, ámbar y rojos del tema claro**, que no llegaban (3.1, 2.5 y 4.1). Revisado en Chrome el tema oscuro en Inicio y Configuración.
- **T-12.4 [X]:** `matriz-verificacion.md` relaciona cada CA y cada HU con sus pruebas y dice cuáles quedan **parciales** (GPS real, foto real, descarga y apertura de archivos, móvil y tableta, pestaña de red, y la corrección manual por P-12).
- **T-12.5 [~]:** nueva prueba `arquitectura/reglasDeCodigo` (sin servicios externos, ExcelJS aislado, hora solo por `horaColombia`, CSS de un solo dueño y, desde el seguimiento, separación de capas). Los tres hallazgos de código se corrigieron en el seguimiento de abajo. **Sigue abierta solo la pestaña de red del navegador**: se comprobó con búsqueda estática y en lo compilado que no hay URLs externas, pero no se abrió la pestaña en un navegador real.
- **T-12.6 [~]:** `traspaso-fase-2.md` entregado como **borrador sin revisar** por el responsable.
- **Pruebas existentes ajustadas:** ninguna en este hito.

### Seguimiento del hito 12: hallazgos de código de T-12.5 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **567 pruebas** (48 archivos); `npm run lint` sin hallazgos; `npm run verificar:tamano` pasa (374 archivos); `npm run verificar:contraste` pasa. Sin cambios de reglas de negocio ni de decisiones pendientes.

- **Hallazgo 1, capas:** `hooks/useFotoPerfil` y `utilidades/mensajesFoto` importaban `ErrorAlmacenFotos` y `MotivoErrorFotos` desde `repositorios/demo`. El error es parte del contrato de `IFotoServicio` (el almacén y el servicio lo lanzan y el hook lo reconoce), así que pasó a `contratos/errorAlmacenFotos.ts` (con `git mv`) y se actualizaron sus siete importaciones. Además `ProveedorSesion` llamaba a la fábrica de servicios: su estado y llamadas pasaron a `hooks/useSesionSimulada` y el proveedor quedó solo con el contexto. Ya ningún archivo fuera de `repositorios/`, `servicios/demo/` y `mapeadores/` importa los repositorios, y ningún componente usa la fábrica (lo comprueba la prueba de arquitectura; se verificó que falla si se rompe).
- **Hallazgo 2, JSDoc:** las diez exportaciones sin documentación (`TonoInsignia`, `TRABAJADOR_INTENTO_FALLO_TECNICO`, `ResultadoEvaluacion`, `ResultadoSecuencia`, `ResultadoEscritura`, `MotivoFalloFoto`, `ResultadoPreparacionFoto`, `ResultadoUbicacion`, `PuntoEnLienzo`, `MENSAJE_FORMATO_NO_ADMITIDO`) tienen ahora su comentario en español. Un recorrido de todos los `export` de `src/` (sin pruebas) ya no encuentra ninguno sin JSDoc.
- **Hallazgo 3, lógica en componentes:** se movió solo lo que correspondía. El orden y el conteo de alertas (`PanelAlertas`) y el filtro «sin turno» (`TablaPersonalEnVivo`) pasaron a `reglas/indicadoresPanel` (con pruebas), y el reparto de los arcos del anillo (`EstadosDelPersonal`) a `utilidades/segmentosAnillo` (con pruebas). **Se dejó sin mover** lo puramente presentacional: las búsquedas de nombres (`trabajadorDe`, `hospitalDe`), el orden de historiales en `AsignacionCoordinador` y `PanelHorarioTrabajador`, y el reparto de hospitales con y sin coordenadas en el mapa.
- **No verificado:** el anillo de «Estados del personal» no se volvió a mirar en un navegador tras mover su cálculo (solo está probada la función); la pestaña de red sigue sin abrirse.

### Seguimiento 2 del hito 12: ubicación como enlace, informes y fichas (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **586 pruebas** (52 archivos); `npm run lint` sin hallazgos; `npm run verificar:tamano` pasa (393 archivos); `npm run verificar:contraste` pasa. **Sube la versión del esquema de la demostración a 3** (los usuarios de prueba traen datos personales): quien tenga datos guardados verá el aviso para restablecerlos. Revisada en Chrome la ficha de coordinadora con su lápiz y el formulario; **no se revisó** la ubicación con un registro real ni el enlace en el teléfono.

- **Ubicación como enlace (D38):** las marcaciones válidas muestran coordenadas y «Abrir en Maps» en lugar de la distancia en metros (historial propio, resumen de la jornada y mensaje tras registrar). Los **intentos rechazados conservan la distancia** (es la evidencia del rechazo) y suman el enlace. La incidencia muestra ahora los **registros válidos de su jornada** con hora y ubicación. La aplicación no consulta ningún servicio de mapas: solo ofrece el enlace, y la ubicación llega a Google cuando la persona lo pulsa. Guarda en la prueba de arquitectura que `enlaceMapa` solo lo usa `EnlaceUbicacion`.
- **Informes:** casilla «Solo personal con incidencias en el periodo» (aplica a los cinco informes). «Asistencia diaria» suma «Incidencias del día» y «Diferencia con lo programado»; «Incidencias» suma entrada, salida a almuerzo, regreso, salida final y la diferencia. La diferencia es el efectivo registrado menos el programado, **solo en jornadas completas** (si no, «Incompleto»); lo que falta sale **en rojo y con el signo −** (nunca solo color) y la pantalla aclara que es provisional (P-03, P-05) y no una sanción ni un descuento. **«Cuánto tiempo debe» se interpretó como esa diferencia; no se calcula ningún monto ni descuento.**
- **Fichas (D39):** administrador y coordinador tienen ficha (`/usuarios/:id`, «Mi ficha» en el menú del perfil y enlaces desde Configuración) con documento, cargo, teléfono, rol y hospitales a cargo; el lápiz dentro de la tarjeta «Datos» reemplaza el botón «Editar datos» de la cabecera de la ficha del trabajador. Cada persona edita sus datos; el administrador edita los de todos; en el formulario del propio trabajador no aparecen hospital ni estado. Los datos de usuarios quedan auditados (`EDITAR_DATOS_USUARIO`) y se rechaza un documento ya registrado por otra persona.
- **Para confirmar:** si el trabajador debe poder cambiar su propio cargo o documento (hoy sí, por la opción elegida); que otro coordinador no abra la ficha de un compañero; que editar el nombre de un trabajador no cambia el nombre de su cuenta de ingreso (son registros separados en la demostración).
- **Pruebas existentes ajustadas:** la de personal (el lápiz y la edición por el propio trabajador), la de registro (texto y enlace de ubicación) y la de la versión del esquema (3).

### Hito 13 (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **591 pruebas** (una de hospitales falló solo bajo carga y pasa sola); `npm run lint`, `verificar:tamano` y `verificar:contraste` pasan. Revisado en Chrome (ventana de escritorio, tema oscuro): ingreso por cédula, pantalla principal y ficha con la cámara. **No se revisaron** en un teléfono real ni todas las pantallas (confirmar, ubicación, detalle, historial, resumen) ni el tema claro frente al diseño; por eso T-13.6 queda `[~]`.

- **Cambios:** disposición móvil (`componentes/movil/`), flujo de registro por pantallas (`componentes/registro/`), historial (`componentes/historial/`, `PaginaHistorial`), ingreso renovado (`FormularioIngreso`, `buscarUsuarioDeIngreso`), `EncabezadoFicha` con la cámara y `AccionesDeCuenta` (horario, incidencias, tema, cerrar sesión) en la ficha propia del trabajador. Se eliminaron `AccionDeRegistro`, `ResumenJornadaDelDia`, `HistorialPropio` y `useContador`. Sin cambios de contratos ni de la versión del esquema.
- **Decisiones del diseño a confirmar:** sin campana ni «Recordarme» (ver D40); el tiempo trabajado del detalle es una referencia ("de N h programadas" cuenta de entrada a salida, incluido el almuerzo); la contraseña del ingreso no se valida; el día del historial usa la fecha operativa.
- **Pruebas ajustadas:** registro (flujo en dos pasos), fotos (se editan desde la ficha), menú del trabajador, ficha y título del ingreso.

### Seguimiento del hito 13: ficha, reportes y tiempo por reponer (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa **606 pruebas** (54 archivos; la de la lista de hospitales falló dos veces solo bajo carga del conjunto y pasa sola); `npm run lint`, `verificar:tamano` (441 archivos) y `verificar:contraste` pasan. Revisado en Chrome (escritorio, tema oscuro): ficha con cronómetro, reportes (tabla, enlaces, columna fija, desglose, acumulado mensual, tiempo por reponer y el botón «Filtrar por fechas»). **No se revisó** en teléfono real, en tema claro ni la jornada de un trabajador con el cronómetro corriendo.

- **Ficha del trabajador (T-13.7):** tarjeta «Jornada de hoy» a la derecha de Datos y Horario; la jornada se vuelve a leer cada 30 s. El horario no fija una hora exacta de almuerzo: la hora programada de la salida a almuerzo se muestra como la ventana y la del regreso como la duración autorizada. Nuevas reglas puras `calcularTramos` y `calcularEfectivoHastaAhoraSegundos`.
- **Reportes (T-13.8):** los nombres abren la ficha y las incidencias abren cada incidencia (`TablaInforme.enlaces`, solo para la pantalla, no se exporta). La diferencia con lo programado abre su desglose: como efectivo = salida − entrada − almuerzo, la diferencia es la suma de tres aportes (llegada, almuerzo y salida) y suma exactamente; no se estima en jornadas incompletas. La columna de diferencia queda fija a la derecha cuando es la última.
- **Acumulado mensual y Tiempo por reponer (T-13.9):** suman solo jornadas completas por trabajador y mes; «Debe tiempo» solo dice que lo registrado quedó por debajo de lo programado. El segundo lista a quienes deben y de dónde sale (entrada, almuerzo, salida) con el día por día y las incidencias de cada día.
- **Fechas (T-13.10):** por defecto el periodo es hoy; Desde y Hasta salen al pulsar «Filtrar por fechas». «Acumulado mensual» y «Tiempo por reponer» usan del día 1 del mes en curso a hoy. Al volver a otro informe, si seguía el mes automático, vuelve a hoy; las fechas elegidas a mano se conservan.
- **Para confirmar con el responsable:** que el desglose cuente la diferencia contra el efectivo programado (turno menos almuerzo autorizado) como ya hacía el informe; que «Debe tiempo» sea el rótulo; que «Tiempo por reponer» también use el mes en curso; todo sigue provisional (P-03 y P-05 abiertos): no es una sanción ni un descuento y no decide si el almuerzo se paga.
- **Pruebas ajustadas:** informes (fechas ocultas y por defecto), registro, fotos, menú, ficha.

### Recuperación de acceso (2026-10-23)

Resultado: `npm run build` compila; `npm test` pasa 609 de 610 (la de la lista de hospitales falló bajo carga y pasa sola, como antes); `npm run lint`, `verificar:tamano` (451 archivos) y `verificar:contraste` pasan.

- **Cambios (D41):** enlace «¿Olvidaste tu contraseña?» en `FormularioIngreso`; `PaginaRecuperarAcceso` con los pasos `solicitud` y `nueva`; `IRecuperacionAccesoServicio` y su demo (no envía ni guarda nada); `useRecuperacionAcceso`; `validadores/correo`. Prueba en `pruebas/paginas/recuperarAcceso.prueba.tsx`.
- **Pendiente (P-24, Fase 2):** envío con Brevo desde el backend, código de un solo uso en el enlace, caducidad, límite de intentos y reglas de la contraseña. **No se revisó en un navegador ni en el teléfono.**
