# Análisis de coherencia: constitución, especificación, plan, contratos y tareas

**Fecha:** 2026-10-23 (segunda pasada, tras resolver O-1 a O-9). **Documentos revisados:** `constitution.md`, `001-lftime/spec.md` (v4), `plan.md`, `contratos-preliminares.md`, `tasks.md`, la referencia visual `design/panel-coordinacion-referencia.png` y las reglas comunes de `LFMova/AGENTS.md` y `LFClub/.specify/memory/constitution.md`.

**Conclusión:** tras las correcciones de §1 **no quedan contradicciones abiertas entre documentos**. Siguen abiertos los pendientes de negocio de §3, que **no están cerrados**. Hay dos condiciones previas operativas para el hito 1 (B-1, B-2 en `tasks.md`).

## 1. Inconsistencias encontradas y corregidas

### Primera pasada
| # | Hallazgo | Corrección |
|---|----------|------------|
| C-1 | Constitución prohibía toda persistencia en Fase 1, pero D9 admite almacenamiento local | Principio 3 reescrito |
| C-2 | HU-06 decía que un GPS fallido generaba un evento «pendiente de revisión» (D8), contrario a D13 y D23 | Línea reemplazada; D8 marcada como reemplazada |
| C-3 | P-27 figuraba como propuesta y como bloqueante a la vez | Cerrado con D25 y D26 |
| C-4 | La constitución no incluía las reglas comunes de LFMova y LFClub | Sección R-1…R-15 y vocabulario |

### Segunda pasada
| # | Hallazgo | Corrección |
|---|----------|------------|
| C-5 | HU-08 decía que la exportación sería «solo representada en la interfaz», contrario a D9 (archivos descargables) | Reescrita: Excel (ExcelJS) y CSV descargables con marca DEMO |
| C-6 | Spec §9 decía «no incluye exportación real de archivos con datos persistentes» y «verificación real de GPS» de forma ambigua con D13 | Reescrita: sin informes reales, geolocalización real del navegador, validación por el servidor en Fase 2 |
| C-7 | Quedaba una marca `[NEEDS CLARIFICATION]` sobre si el coordinador ve todos los hospitales, ya resuelta por D7 y D28 | Reemplazada por el texto resuelto |
| C-8 | HU-02 decía que la foto se guarda en «almacenamiento local» sin precisar; el plan usa IndexedDB | Precisado (D35); la constitución nombra `localStorage` e `IndexedDB` |
| C-9 | El plan decía «zona = municipio» y «sin responsable, cualquier coordinador revisa», contrario a D28 | Filas P-28 y P-29 del plan reescritas; contratos con historial de asignaciones, `PENDIENTE_ASIGNACION` y escalada |
| C-10 | El plan hablaba de elegir entre `exceljs` y `xlsx` | Fijada ExcelJS (D34) con comprobación en T-1.5 |
| C-11 | R-7 presentaba el tema oscuro como «propuesta por confirmar» | Marcado como confirmado (D32), de prioridad baja y al final (hito 12) |
| C-12 | El estado de los pendientes estaba disperso en varias secciones | `spec.md` §0.4 consolida el estado de P-01…P-29 |

## 2. Observaciones O-1 a O-9: resueltas

| # | Resolución | Dónde quedó |
|---|------------|-------------|
| O-1 | Autorización solo visual y con aviso fijo (D27) | Spec D27; plan §7; T-4.3 |
| O-2 | Zona = hospitales asignados a un coordinador (D28) | Spec D28, HU-03, HU-06; plan P-28; contratos; T-5.7, T-9.4 |
| O-3 | Bandera por usuario de prueba; consentimiento del trabajador como requisito de producción pendiente (D30) | Spec D30 y P-13; plan §7; T-6.4 |
| O-4 | Estados de la referencia incorporados (D31) | Spec HU-01; plan §12; T-3.2 |
| O-5 | Tema claro/oscuro al final (D32) | Constitución R-7; plan §12; T-12.3 |
| O-6 | Datos relativos al día actual (D33) | Spec HU-01; T-2.4 |
| O-7 | ExcelJS aislada, previa comprobación (D34) | Plan §3 y §11; T-1.5, T-11.1 |
| O-8 | IndexedDB para fotos con límites y errores (D35) | Plan §6; T-6.2 |
| O-9 | DEMO en nombre y encabezado, CSV y Excel (D36) | Plan §11; contratos §7; T-11.1 |

## 3. Pendientes de negocio: lo que NO se cierra

Ninguno de los siguientes se declara cerrado; `spec.md` §0.4 conserva el estado de cada uno.

- **Abiertos sin supuesto:** P-03 (almuerzo, legal), P-05 (festivos, recargos, horas extra, legal), P-11 (suplantación), P-12 (quién corrige marcaciones; **T-9.7 queda bloqueada**), P-15 (conservación, legal), P-22 (escenarios de datos; propuesta sin confirmar), P-09, P-10 y P-24 (Fase 2), y la parte legal de P-13 (consentimiento de foto y ubicación).
- **Con supuesto provisional aceptado, regla sin validar:** P-01, P-02, P-04, P-06, P-07, P-16 a P-21, P-23, P-25, y las definiciones provisionales de P-28 y P-29. Son configurables, no son reglas laborales y no generan sanciones.
- **Valores provisionales de GPS:** 100 m y 25 m, pendientes de pruebas y validación antes de producción.

## 4. Verificaciones de conformidad con la constitución

| Principio / regla | ¿Cumple? | Nota |
|-------------------|----------|------|
| No inventar reglas de negocio | Sí, con condición | Los supuestos están aceptados como provisionales; deben validarse antes de la Fase 2. T-9.7 queda bloqueada para no inventar la regla de P-12 |
| Frontend primero, sin servicios externos | Sí | T-5.6 y T-12.5 verifican la ausencia de peticiones externas |
| Honestidad de la demo | Sí | Aviso de demo, aviso de control solo visual, aviso de ubicación no validada, marca DEMO |
| Separación de capas | Sí | Estructura y tareas respetan Página → Hook → Servicio → Repositorio |
| Contratos antes de integración | Sí | `contratos-preliminares.md`, T-2.1 |
| Una incidencia no es sanción | Sí | T-7.7 y T-9.3 lo exigen en su criterio de terminado |
| Privacidad por diseño | Parcial | Falta validación legal (P-13, P-15) |
| Cálculos verificables | Sí | Hito 7 completo con pruebas |
| R-1 español, R-2 JSDoc | Sí | Parte de la definición de terminado |
| R-3 250 líneas | Sí | Script T-1.2 y verificación T-12.5 |
| R-6 CSS separado | Sí | `estilos/componentes` y `estilos/paginas` |
| R-9 hora de Colombia | Sí | T-1.4 y su uso exclusivo |
| R-10 histórico inmutable | Sí | Intentos, historial de incidencias, asignaciones y coordenadas |
| R-11 GPS obligatorio | Sí | T-8.2 |
| R-12 definición de terminado | Sí | Encabezado de `tasks.md` |
| R-14 git | **Condición abierta** | El directorio no es un repositorio (B-1) |

## 5. Trazabilidad

Cada tarea de `tasks.md` referencia una decisión de la spec (D…), una historia (HU-…), un criterio (CA-…) o una regla de la constitución (R-…). Los criterios CA-1 a CA-14 tienen al menos una tarea que los verifica; T-12.4 comprueba la matriz completa.

## 6. Estado

- La spec **no está libre de bloqueantes de negocio**.
- No hay contradicciones documentales abiertas.
- No se ha iniciado ninguna implementación.
