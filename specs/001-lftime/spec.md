# Especificación funcional: LFTime

**Estado:** BORRADOR v4 para revisión (observaciones O-1 a O-9 resueltas; estado de pendientes en §0.4). **NO está libre de bloqueantes**: quedan decisiones laborales y operativas abiertas (ver §0.3). El plan técnico (`plan.md`) las cubre solo con supuestos provisionales y configurables, que no son reglas definitivas.
**Alcance de esta entrega:** especificación funcional (QUÉ y POR QUÉ). Sin decisiones técnicas.
**Marcador:** `[NEEDS CLARIFICATION: ...]` = decisión pendiente del responsable del negocio. No se debe implementar nada que dependa de ellos hasta resolverlos.

---

## 0. Decisiones tomadas (registro)

| # | Decisión | Estado |
|---|----------|--------|
| D1 | Tolerancia de entrada: **0 minutos** (entrada posterior a la hora programada = retraso). | Cerrada |
| D2 | Tolerancias de **salida** y **almuerzo**: por definir. | Pendiente |
| D3 | **Ausencia**: umbral propio, independiente de la tolerancia de entrada, y siempre con revisión humana. Valor del umbral: por definir. | Parcial |
| D4 | Almuerzo de **60 minutos**; ventana configurable. Se separan **tiempo de descanso** y **tiempo efectivo** hasta validar reglas laborales. | Cerrada (valor) / Pendiente (tratamiento laboral) |
| D5 | Horarios configurables, **incluidos cruces de medianoche**. | Cerrada |
| D6 | Festivos, dominicales y recargos: pendientes de confirmar. | Pendiente |
| D7 | El coordinador ve **todos** los hospitales. | Cerrada |
| D8 | ~~Si la validación GPS falla, el registro queda pendiente de revisión.~~ **Reemplazada por D13**: sin GPS válido la marcación no se completa. | Reemplazada |
| D9 | Demo Fase 1: persistencia en **almacenamiento local del navegador**; **login simulado** con usuarios de prueba; exportación **CSV y Excel descargables** con datos demo. | Cerrada |
| D10 | Referencia visual: [panel-coordinacion-referencia.png](design/panel-coordinacion-referencia.png). Válida para iniciar el frontend; sus datos son ficticios. | Cerrada |
| D12 | El coordinador **registra hospitales con su dirección** para verlos luego en el mapa. | Cerrada (requisito) / Pendiente (cómo se obtiene la posición, P-14) |
| D13 | **GPS obligatorio** en toda marcación (reglas en HU-05). Sin ubicación válida → no se marca. | Cerrada (principio) / Pendiente (umbrales P-08) |
| D14 | **Todo usuario** puede poner foto de perfil. | Cerrada (requisito) / Pendiente (privacidad P-13) |
| D15 | El **horario y la hora de almuerzo los asigna y edita el coordinador**; el trabajador no los modifica. | Cerrada |
| D16 | Definiciones de duración: efectivo, almuerzo y total (ver §6). La fórmula laboral definitiva requiere validación. | Cerrada (estructura) / Pendiente (L) |
| D17 | La cédula puede mostrarse en la tabla del panel como en la referencia. *(Interpretación de tu "3 correcto"; corrígeme si te referías a otra cosa.)* | Cerrada |
| D18 | **Mapa esquemático/local, sin servicios externos** (opción A de P-14). Sin excepción de servicios externos en Fase 1. | Cerrada |
| D19 | Marcación **fuera del radio del hospital: se bloquea**. Radio **provisional 100 m**; precisión GPS máxima **provisional 25 m**. No son reglas laborales definitivas y deben ser configurables. | Cerrada (comportamiento) / Provisional (valores) |
| D20 | La **foto de perfil** puede verla el propio trabajador y los coordinadores autorizados. | Cerrada |
| D21 | Almuerzo (P-03): pendiente de validación laboral; la interfaz **muestra siempre los tiempos separados** (efectivo, almuerzo, total). | Pendiente (L) |
| D22 | **Coordenadas del hospital (P-26):** dos mecanismos (latitud/longitud manual, o ubicación GPS actual del coordinador). Detalle en HU-03. | Cerrada |
| D23 | **Intentos rechazados (P-08):** se bloquean y se registran aparte de las marcaciones válidas; distinguen fuera de radio (ubicación válida) de fallo técnico. Detalle en HU-05 y HU-06. Valores 100 m / 25 m siguen provisionales. | Cerrada (comportamiento) / Provisional (valores) |
| D24 | **Foto de perfil (P-13):** visible para el propietario, coordinadores autorizados y administradores con permiso explícito; JPG/JPEG/PNG/WebP; máx. 2 MB con compresión automática si excede; retirable sin afectar el historial; opcional. Detalle en HU-02. | Cerrada (comportamiento) / Pendiente (legal, L) |
| D25 | **Coordenadas confirmadas (P-27):** un hospital sin coordenadas válidas y confirmadas **no admite marcaciones**. La interfaz explica que el hospital necesita configuración antes de habilitar el registro. Se mantienen las dos formas de configurarlas (D22). | Cerrada |
| D26 | **Intentos fuera de radio:** cada intento rechazado se conserva **individualmente** (datos de ubicación disponibles y motivo). Las incidencias visibles se **agrupan por trabajador, jornada operativa y hospital** para evitar duplicados; la agrupada permite consultar todos sus intentos. Revisor principal: el **coordinador responsable del hospital o zona**; el **administrador autorizado** puede intervenir o escalar. Resolver no elimina ni modifica los intentos originales. Sin ubicación válida: se registra el fallo técnico sin afirmar ubicación fuera de zona. | Cerrada (comportamiento) / Pendiente (P-28, P-29) |
| D27 | **Autorización por rol en la demo (O-1):** es **solo visual** y no representa seguridad real; se avisa en pantalla. La autorización real se comprueba en el backend (Fase 2). | Cerrada |
| D28 | **Zona y responsable (P-28):** una zona es un conjunto de hospitales asignados a un coordinador. Cada hospital tiene un **coordinador responsable principal**. Un administrador autorizado puede modificar las asignaciones, y los cambios conservan **historial y vigencia**. Si un hospital no tiene responsable, sus incidencias quedan **pendientes de asignación** y visibles para el administrador. El coordinador sigue viendo todos los hospitales (D7). | Definición provisional aceptada |
| D29 | **Escalada (P-29):** el coordinador puede **escalar manualmente** una incidencia al administrador indicando el motivo. El administrador puede **intervenir directamente** cuando no exista coordinador asignado o cuando se requiera. **Toda resolución queda auditada** y los intentos originales se conservan. | Definición provisional aceptada |
| D30 | **Foto y permiso de administradores (O-3):** en la demo, una **bandera por usuario de prueba**. Requisito de producción **pendiente de definir en detalle**: el **consentimiento del trabajador** y quién concede el permiso. | Demo cerrada / Producción pendiente (L) |
| D31 | **Estados de la referencia (O-4):** «Sin registrar», «Salida anticipada» y «Almuerzo prolongado» se incorporan al catálogo de estados visibles (ver HU-01). | Cerrada |
| D32 | **Tema claro y oscuro (O-5)** con cambio de preferencia. Prioridad baja: no retrasa las funcionalidades prioritarias. | Cerrada |
| D33 | **Datos de demo relativos al día actual de Colombia (O-6).** La fecha de la imagen de referencia es solo ilustrativa. | Cerrada |
| D34 | **Excel con ExcelJS (O-7)**, previa comprobación de compatibilidad, aislado en la capa de exportación. | Cerrada (comprobación en `tasks.md`) |
| D35 | **Fotos de demo en IndexedDB (O-8)** con límites de tamaño y tratamiento de errores; se considera almacenamiento local del navegador a efectos de D9. | Cerrada |
| D36 | **Marca DEMO (O-9)** visible tanto en el **nombre** como en el **encabezado** de los archivos exportados, en CSV y en Excel. | Cerrada |
| D37 | **Supuestos provisionales del plan aceptados:** P-01, P-02, P-04, P-06, P-07, P-16 a P-21, P-23 y P-25. Siguen siendo provisionales, no son reglas laborales y no generan sanciones automáticas. P-27 queda confirmado. | Aceptados; los pendientes de negocio siguen abiertos |
| D11 | Ciclo de vida de la incidencia (ver §5 HU-06): detección → justificación opcional del trabajador → revisión del coordinador → resolución (justificada / no justificada / pendiente de información) → historial inmutable de decisiones y correcciones. | Cerrada (flujo) |

### 0.1 Consecuencias de las decisiones para la spec

- **D1 + D3:** "retraso" = cualquier minuto después de la hora programada de entrada. "Ausencia aparente" es otra categoría con su propio umbral; la ausencia nunca se confirma automáticamente.
- **D4:** en la referencia visual, 7:00–16:00 = 8 h programadas + 1 h de almuerzo. Esto es **coherente** con "almuerzo no computa como trabajado", pero esa interpretación **no está aprobada** laboralmente; los datos simulados deben ser configurables y los cálculos provisionales (ver P-03).
- **D5:** un turno puede terminar al día siguiente. El "día de la jornada" debe definirse (ver P-04).
- **D13 reemplaza D8:** ya no existe "marcación con GPS fallido pendiente de revisión"; esa marcación simplemente no se completa. Queda por decidir qué pasa si el GPS es válido pero la ubicación está **fuera del radio** del hospital (P-08): ¿se bloquea, o se registra como incidencia de ubicación no autorizada, que HU-06 ya contempla?
- **D15:** el trabajador ve su horario pero no lo edita; cambios con trazabilidad.
- **D9:** el almacenamiento local es una **ayuda de demo**, no persistencia real. La interfaz debe indicar que es modo demo y ofrecer restablecer los datos. Persistencia local ≠ permitido hacer pasar la demo por sistema real (Constitución, principio 4).

### 0.2 Tensiones de la referencia visual con las reglas del proyecto

1. **Mapa a partir de direcciones (D12, D18):** resuelto con mapa esquemático local, sin geocodificación ni teselas externas. Consecuencia: la dirección es solo texto; el mapa no puede deducir la posición de ella. Queda pendiente P-26 (cómo obtiene el coordinador las coordenadas del hospital).
2. **Foto de perfil para todos (D14):** la foto es un dato personal adicional; debe ser opcional, con consentimiento y límites de tamaño/formato. En Fase 1 se guarda en el almacenamiento local del navegador. → P-13.
3. **GPS real en Fase 1 (D13):** al ser obligatorio y no poder simularse, la demo usa la geolocalización real del navegador. Esto obliga a probarla en un contexto seguro (localhost/HTTPS) y la demo debe indicar "ubicación capturada, no validada contra el hospital" mientras no existan radio y precisión aprobados. Un dispositivo de escritorio sin GPS puede dar una precisión baja y no podrá marcar.
4. **Persistencia local vs. "no simular guardado permanente"**: compatibles solo si la UI deja claro que es modo demo.

## 0.3 Decisiones laborales y operativas aún pendientes

Prioridad: **B** = bloquea la spec o el diseño de Fase 1; **F2** = puede esperar a la Fase 2 pero debe estar definida antes del backend; **L** = requiere validación legal/laboral.

### Reglas de jornada y cálculo
- **P-01 (B)** Tolerancia de salida y de almuerzo (salida anticipada, regreso tardío, almuerzo excedido): valores y si son iguales para todos o configurables por hospital/cargo/trabajador.
- **P-02 (B)** Umbral de "ausencia aparente" (minutos sin entrada) y de "sin registrar salida/regreso" (cuándo pasa de pendiente a incidencia).
- **P-03 (L)** Tratamiento laboral del almuerzo: las tres duraciones están definidas estructuralmente (§6, D16), pero falta validar si el almuerzo es tiempo pagado o descontado, si hay duración mínima y cómo se trata cuando dura más o menos de 60 min. También: pausas adicionales distintas del almuerzo.
- **P-04 (B)** Turnos que cruzan la medianoche: ¿a qué día pertenece la jornada (inicio o fin)? ¿Cómo se agrupa en informes y cómo se calcula el almuerzo?
- **P-05 (L)** Festivos, dominicales, recargos nocturnos y horas extra: ¿dentro del alcance del sistema (solo registrarlos/marcarlos) o fuera (nómina)? ¿Quién mantiene el calendario de festivos?
- **P-06 (B)** Jornada máxima: ¿el sistema advierte cuando se supera el límite legal o el programado? ¿Cómo se trata el tiempo trabajado de más (con o sin autorización previa)?
- **P-07 (B)** Casos de horario: ¿jornada partida, varios turnos por día, rotaciones, plantillas reutilizables, cambios con vigencia futura y quién los aprueba?

### Presencia y registro
- **P-08 (cerrado en lo funcional; valores provisionales)** GPS y marcaciones bloqueadas: ver D13, D19, D23 y HU-05. Pendiente de producción: pruebas y aprobación del radio (100 m) y la precisión (25 m); ¿radio único o por hospital?
- **P-26 (cerrado)** Coordenadas del hospital: ver D22 y HU-03.
- **P-27 (cerrado)** Hospital sin coordenadas confirmadas no admite marcaciones (D25); incidencias agrupadas por trabajador, jornada operativa y hospital (D26). Plazo de conservación de intentos: ver P-15.
- **P-28 (definición provisional aceptada, D28)** Zona = conjunto de hospitales asignados a un coordinador; un coordinador responsable principal por hospital; administrador autorizado modifica asignaciones con historial y vigencia; sin responsable → incidencias pendientes de asignación, visibles al administrador. Queda por confirmar en producción: ¿puede un hospital tener varios responsables? ¿Qué administradores están «autorizados»?
- **P-29 (definición provisional aceptada, D29)** Escalada manual con motivo; intervención directa del administrador sin coordinador o cuando se requiera; resolución auditada; intentos originales intactos. Queda por confirmar: ¿la escalada transfiere la responsabilidad de resolver al administrador o la comparte?
- **P-09 (F2)** QR: ¿se estudia como complemento o alternativa al GPS? (hoy solo GPS).
- **P-10 (F2)** Modo sin conexión y sincronización; origen de la hora oficial del evento (dispositivo vs. servidor) y qué se hace con diferencias.
- **P-11 (B)** Suplantación: ¿cómo se evita que alguien registre por otra persona (dispositivo propio, sesión, otro método)? ¿Se admiten dispositivos compartidos?
- **P-12 (B)** Registros manuales/correcciones: ¿quién puede crear o corregir un evento (coordinador, administrador), con qué justificación obligatoria y cómo se muestra el valor original?

### Datos y privacidad
- **P-13 (L)** Datos personales mínimos: tipo de documento, contacto, cargo. Foto de perfil: comportamiento definido en D24 y HU-02 (provisional); **pendiente de validación legal**: información y autorizaciones al titular, permisos de acceso, retirada y conservación. **Requisito de producción pendiente de definir en detalle (D30):** el consentimiento del trabajador para el tratamiento de su foto, y quién concede a un administrador el permiso explícito de verla. En la demo solo existe una bandera por usuario de prueba. Autorización de tratamiento de datos y consentimiento para ubicación y foto (Ley 1581/2012 y normas relacionadas).
- **P-14 (cerrado)** Mapa esquemático local (D18). Ver P-26.
- **P-15 (L)** Plazos de conservación de registros de asistencia, incidencias y ubicación.

### Incidencias y resolución
- **P-16 (B)** Quién puede justificar: ¿solo el trabajador, o también el coordinador en su nombre? ¿Se adjuntan soportes (incapacidad, permiso)? ¿Plazo para justificar?
- **P-17 (B)** Resolución: ¿solo coordinador, o administrador también? ¿Estados exactos? (propuestos: pendiente, en revisión, pendiente de información, justificada, no justificada). ¿Se puede reabrir?
- **P-18 (B)** Consecuencias de "no justificada": ¿solo queda registrada, o se genera un reporte hacia RR. HH.? (El sistema no sanciona.)
- **P-19 (B)** Alertas: ¿toda alerta genera incidencia? ¿se puede descartar? ¿quién las ve (coordinador siempre, trabajador solo las suyas)?
- **P-20 (B)** Estados de trabajador (activo, vacaciones, incapacidad, licencia…) y cómo suprimen las alertas.

### Roles y operación
- **P-21 (B)** Matriz de permisos por rol (administrador, coordinador, trabajador) sobre cada módulo; ¿el trabajador es usuario con credenciales propias?
- **P-22 (B)** Datos simulados de Fase 1: cantidad y escenarios que deben cubrirse (ver §9). Usuarios de prueba por rol.
- **P-23 (B)** Informes: columnas y formatos oficiales para CSV/Excel; ¿algún informe con formato legal?
- **P-24 (F2)** Gestión de cuentas (alta, recuperación de acceso, doble factor) y registro de auditoría de operaciones administrativas.
- **P-25 (B)** "Tiempo real" del panel: refresco automático o manual y frecuencia.

---

## 0.4 Estado consolidado de pendientes (2026-10-23)

Leyenda: **Cerrado** = decidido; **Provisional aceptado** = hay un supuesto configurable aceptado, pero la regla de negocio **sigue sin validarse**; **Abierto** = sin decisión; **Legal** = requiere validación legal o laboral.

| Pend. | Tema | Estado |
|-------|------|--------|
| P-01 | Tolerancias de salida y almuerzo | Provisional aceptado (0 min); negocio abierto |
| P-02 | Umbrales de ausencia y de registros faltantes | Provisional aceptado; negocio abierto |
| P-03 | Tratamiento laboral del almuerzo | **Abierto (Legal)**; la demo muestra los tiempos separados |
| P-04 | Cruce de medianoche y fecha operativa | Provisional aceptado; negocio abierto |
| P-05 | Festivos, dominicales, recargos y horas extra | **Abierto (Legal)**; fuera de la demo |
| P-06 | Jornada máxima y tiempo de más | Provisional aceptado; negocio abierto |
| P-07 | Jornada partida, turnos, plantillas, cambios | Provisional aceptado; negocio abierto |
| P-08 | GPS: radio, precisión, fuera de radio | Cerrado en lo funcional; valores 100 m / 25 m **provisionales**, pendientes de pruebas para producción |
| P-09 | QR | Abierto (Fase 2) |
| P-10 | Modo sin conexión y origen de la hora | Abierto (Fase 2) |
| P-11 | Suplantación de identidad al marcar | **Abierto**; la demo usa sesión simulada |
| P-12 | Quién crea o corrige marcaciones a mano | **Abierto**; no se implementa la corrección hasta decidirlo (ver `tasks.md`, T-9.7) |
| P-13 | Datos personales y foto | Foto: comportamiento cerrado (D24); consentimiento y permisos de producción **Abierto (Legal)** (D30) |
| P-14 | Mapa | Cerrado (esquemático local) |
| P-15 | Conservación de registros, intentos y ubicación | **Abierto (Legal)** |
| P-16 | Quién justifica y soportes | Provisional aceptado; negocio abierto |
| P-17 | Estados y resolución de incidencias | Provisional aceptado; negocio abierto |
| P-18 | Consecuencias de «no justificada» | Provisional aceptado (solo registro); negocio abierto |
| P-19 | Alertas e incidencias | Provisional aceptado; negocio abierto |
| P-20 | Estados del trabajador | Provisional aceptado; negocio abierto |
| P-21 | Matriz de permisos | Provisional aceptado; **negocio abierto**, la demo es solo visual (D27) |
| P-22 | Escenarios de datos de demo | **Confirmado** el 2026-10-23 (§9). Ajuste: un GPS fallido se representa como intento rechazado por fallo técnico (D23), no como registro pendiente de revisión; se añaden hospital sin coordenadas confirmadas y sin responsable, y un intento fuera de radio |
| P-23 | Columnas de informes | Provisional aceptado; negocio abierto |
| P-24 | Cuentas, recuperación, doble factor, auditoría | Abierto (Fase 2) |
| P-25 | Refresco del panel | Provisional aceptado |
| P-26 | Coordenadas del hospital | Cerrado |
| P-27 | Hospital sin coordenadas confirmadas | Cerrado |
| P-28 | Zona y coordinador responsable | Definición provisional aceptada (D28); detalles de producción abiertos |
| P-29 | Escalada al administrador | Definición provisional aceptada (D29); detalle abierto |

**Los bloqueantes de negocio que siguen abiertos no se consideran cerrados:** P-03, P-05, P-11, P-12, P-15, P-22 y la parte legal de P-13, además de la validación definitiva de todos los supuestos provisionales.

---

## 1. Resumen

LFTime es una aplicación web para controlar las jornadas laborales del personal que una empresa de servicios de salud asigna a hospitales de distintos municipios de Colombia. Permite comparar horarios programados contra registros reales, calcular horas, detectar incidencias y consultar historiales e informes.

Tiene dos interfaces: **panel de coordinación** (escritorio/tableta) y **vista del trabajador** (móvil).

## 2. Problema

La empresa no puede verificar de forma centralizada si el personal: llega a tiempo, registra su entrada, permanece en el hospital, sale y regresa del almuerzo en los tiempos previstos, cumple las horas asignadas y trabaja en el hospital y municipio correctos.

## 3. Objetivos

- O1. Centralizar el control de asistencia.
- O2. Ver el estado actual del personal de todos los hospitales.
- O3. Comparar horario programado vs. registro real.
- O4. Calcular horas trabajadas y duración de descansos.
- O5. Detectar posibles incumplimientos mediante alertas.
- O6. Consultar el historial por trabajador.
- O7. Generar informes por trabajador, hospital, municipio y periodo.
- O8. Ofrecer una interfaz sencilla, moderna y profesional.

## 4. Roles

| Rol | Responsabilidad | Interfaz principal |
|-----|-----------------|--------------------|
| Administrador | Configuración general, usuarios autorizados, permisos | Panel |
| Coordinador | Supervisa personal, hospitales, horarios, registros e incidencias | Panel |
| Trabajador | Ve su horario y hospital, registra eventos, consulta su historial | Móvil |

`[NEEDS CLARIFICATION: matriz definitiva de permisos por rol (qué puede ver/crear/editar/corregir cada uno). Se requiere antes de la Fase 2; en Fase 1 se necesita al menos para decidir qué pantallas ve cada rol.]`
Resuelto (D7, D28): el coordinador **ve** todos los hospitales; su zona (hospitales asignados) determina de cuáles es revisor principal de incidencias.

## 5. Historias de usuario y criterios de aceptación

Prioridad: **P1** = indispensable, **P2** = importante, **P3** = deseable.

### HU-01 Panel de coordinación (P1)
Como coordinador, quiero ver en una sola pantalla el estado actual del personal para identificar rápido lo que requiere atención.

Indicadores: trabajadores activos; en jornada; en almuerzo; sin entrada registrada; con retraso; con incidencias; asistencia por hospital y municipio; horas programadas vs. registradas; duración media de almuerzos; alertas pendientes.

Criterios:
- Cada indicador es visible sin navegar a otra pantalla.
- Desde un indicador se puede llegar al detalle (lista filtrada correspondiente).
- Los estados (jornada activa, almuerzo, retraso, ausencia, incidencia) se distinguen visualmente de forma clara y no solo por color.
- Existen estados de carga, error y vacío.
- La estructura y contenido se toman de la referencia visual (§0, D10): saludo y fecha/hora; tarjetas (total, en jornada, en almuerzo, con incidencias); tabla "Personal en tiempo real" con búsqueda y filtros por municipio y estado; panel de alertas e incidencias; resumen por hospital; ubicación de hospitales; horas trabajadas hoy; estados del personal; promedio de almuerzo.
- Navegación lateral: Inicio, Personal, Hospitales/Municipios, Jornadas, Reportes, Incidencias (con contador), Configuración. Cabecera con notificaciones y menú de usuario.
- Retraso = entrada posterior a la hora programada (tolerancia 0, D1).
- Catálogo de estados visibles, siempre con texto además de color (D31): En jornada, En almuerzo, Retraso, Sin registrar, Ausencia aparente, Salida anticipada, Almuerzo prolongado, Incidencia, Finalizada, y el estado del trabajador cuando no está activo (inactivo, vacaciones, incapacidad, licencia).
- Los datos de demostración se generan relativos al día actual de Colombia (D33).
- Tema claro y oscuro con cambio de preferencia (D32), de prioridad baja.

`[NEEDS CLARIFICATION: P-25 refresco "tiempo real"; P-02 umbral de ausencia.]`

### HU-02 Gestión de personal (P1)
Como coordinador/administrador, quiero consultar y administrar la ficha de cada trabajador.

Datos: nombres y apellidos; identificación; cargo o servicio; contacto necesario; hospital y municipio asignados; horario y jornada; estado; historial de jornadas e incidencias.

Criterios:
- Listado con búsqueda, filtros y paginación.
- Ficha de detalle con historial.
- Formulario de alta/edición con validaciones de interfaz y mensajes comprensibles.
- Solo se solicitan los datos personales estrictamente necesarios.
- **Foto de perfil (D14, D20, D24):** opcional; la funcionalidad de la aplicación no depende de ella. Todo usuario puede subir, cambiar y retirar la suya.
  - Formatos aceptados: JPG, JPEG, PNG y WebP. Tamaño máximo final: 2 MB; si el archivo pesa más, se **comprime automáticamente** hasta cumplir el límite (las fotos de teléfonos suelen ser mayores). Si no es posible cumplir el límite o el formato es inválido, se informa con un mensaje comprensible.
  - Pueden verla: el propietario, los coordinadores autorizados y los administradores con **permiso explícito**.
  - Retirarla elimina la imagen pero **no borra** el historial de asistencia ni incidencias del usuario; se muestra un avatar por defecto.
  - Fase 1: la foto se guarda solo en el almacenamiento local del navegador, en IndexedDB, con límites de tamaño y tratamiento de errores (D35, modo demo).
  - Antes de producción deben documentarse: información y autorizaciones requeridas al titular, permisos de acceso, procedimiento de retirada y plazo de conservación. Estas decisiones son provisionales y **no constituyen validación legal**.

`[NEEDS CLARIFICATION: lista exacta de datos personales permitidos y tipo de identificación (cédula, extranjería, etc.).]`
`[NEEDS CLARIFICATION: estados posibles de un trabajador (activo, inactivo, vacaciones, incapacidad, licencia…) y cómo afectan a las alertas.]`
`[NEEDS CLARIFICATION: ¿un trabajador puede estar asignado a más de un hospital/municipio, simultánea o alternadamente?]`

### HU-03 Gestión de hospitales y municipios (P1)
Como coordinador, quiero registrar hospitales y asociarlos a municipios para saber quién trabaja dónde.

Criterios:
- Alta/edición de hospital con municipio y ubicación geográfica.
- Ver trabajadores asignados, asistencia e incidencias por hospital.
- Filtrado por municipio.

Decidido (D12, D18, D19, D22): el hospital tiene dirección (texto), municipio y un punto geográfico con radio permitido (provisional 100 m). Los hospitales se visualizan en un mapa esquemático local, sin servicios externos de mapas ni geocodificación.

**Coordenadas del hospital (D22):**
- El coordinador puede (a) introducir latitud y longitud manualmente o (b) usar su ubicación GPS actual estando en el hospital.
- En (b) se solicita permiso de ubicación, se comprueba que se obtuvo una posición válida y se **muestra su precisión antes de confirmar**. Si falla el permiso o la posición, se informa y se puede reintentar o usar (a).
- Se validan los rangos: latitud entre −90 y 90, longitud entre −180 y 180, ambas numéricas y obligatorias.
- Un hospital sin coordenadas **válidas y confirmadas** no admite marcaciones (D25). Se indica visiblemente en la ficha del hospital y, a un trabajador asignado, la pantalla de registro le explica que el hospital necesita configuración antes de habilitar el registro y que debe avisar a su coordinador.
- Cada confirmación o cambio de coordenadas queda en el historial (quién, cuándo, valor anterior).
- **Coordinador responsable (D28):** cada hospital tiene un coordinador responsable principal. Un administrador autorizado asigna o cambia esa asignación; cada cambio conserva su historial y su vigencia (desde, hasta, quién, motivo). Un hospital sin responsable se señala y sus incidencias quedan pendientes de asignación, visibles para el administrador.

`[NEEDS CLARIFICATION: ¿existe un catálogo oficial de municipios (p. ej. DIVIPOLA) o se escribe libremente?]`

### HU-04 Gestión de horarios y jornadas (P1)
Como coordinador, quiero configurar el horario de cada trabajador para tener una referencia contra la cual comparar los registros.

Configuración: hora de entrada; hora de salida; duración de la jornada; intervalo permitido de almuerzo; duración autorizada del descanso; días laborables; cambios y asignaciones especiales.

Criterios:
- Se distingue claramente horario **planificado** de registros **reales**.
- Se pueden registrar cambios de horario y asignaciones especiales.
- Validaciones de interfaz (p. ej. salida posterior a entrada, campos obligatorios).

`[NEEDS CLARIFICATION: ¿hay turnos nocturnos o que crucen la medianoche?]`
`[NEEDS CLARIFICATION: ¿jornada partida, múltiples turnos por día, rotaciones, turnos por plantilla reutilizable?]`
`[NEEDS CLARIFICATION: tratamiento de festivos colombianos, dominicales, recargos nocturnos y horas extra: ¿dentro o fuera de alcance?]`
`[NEEDS CLARIFICATION: ¿el almuerzo cuenta como tiempo trabajado o se descuenta de la jornada?]`
`[NEEDS CLARIFICATION: ¿cambios de horario con vigencia futura/histórica? ¿quién los aprueba?]`

### HU-05 Registro de eventos de la jornada (P1)
Como trabajador, desde el móvil, quiero registrar mi entrada, salida a almuerzo, regreso de almuerzo y salida final.

Criterios:
- Solo se ofrece la acción coherente con el estado actual de la jornada.
- Cada evento guarda: fecha y hora, trabajador, tipo de evento, centro de trabajo.
- Confirmación clara tras registrar; mensajes comprensibles ante error.
- Ver mi horario, hospital asignado e historial propio.
- **Fase 1:** el registro es una demostración; no se presenta como guardado permanente ni como ubicación verificada.

**Geolocalización obligatoria (D13):**
- Toda marcación (entrada, salida a almuerzo, regreso, salida final) requiere ubicación válida del dispositivo.
- Si el permiso se deniega, la ubicación no está disponible, la geolocalización falla o no se alcanza la precisión mínima, **la marcación no se completa**.
- En cada reintento se vuelve a comprobar el permiso y se solicita acceso si el navegador lo permite. Si está bloqueado en el navegador, se muestran instrucciones para habilitarlo.
- Nunca se sustituye el GPS por una ubicación simulada ni se marca como verificada una marcación sin coordenadas válidas.
- Cada evento conserva: tipo, fecha y hora, coordenadas y precisión reportada (sujeto a P-13/P-15).
- Los umbrales de precisión y el radio respecto al hospital deben definirse antes de producción (P-08).
- La Fase 1 distingue visiblemente las limitaciones de la demo de la validación real que hará el backend.

**Secuencia de eventos:** Entrada → Salida al almuerzo → Regreso del almuerzo → Salida final. Se impiden secuencias inválidas, eventos duplicados y salida final sin jornada abierta, salvo corrección autorizada y auditada (permisos, motivo y registro de auditoría). Cada marcación se asocia al trabajador autenticado; coordenadas, horas y eventos no se modifican silenciosamente.

**Marcaciones bloqueadas e intentos rechazados (D19, D23):**
- Si la ubicación es válida pero está a más de 100 m (provisional) del hospital asignado, la marcación se **bloquea** y se informa el motivo al trabajador.
- Los intentos rechazados se registran en una colección **separada** de las marcaciones válidas. Se distinguen dos categorías:
  1. **Ubicación fuera del radio** (hay ubicación válida): se conserva trabajador, tipo de evento, fecha y hora, coordenadas, precisión y motivo del rechazo. **Genera una incidencia de ubicación no autorizada.**
  2. **Fallo técnico** (permiso denegado, ubicación no disponible, error GPS, precisión superior a 25 m): se conserva el intento y su motivo técnico, con las coordenadas solo si existen. **No genera incidencia de ubicación no autorizada** ni se presenta como prueba de ubicación indebida.
- Los intentos rechazados **no modifican** tiempos de trabajo, almuerzo, jornada ni la secuencia de eventos.
- Los intentos y sus revisiones tienen trazabilidad (quién los revisó, cuándo, resultado).
- Valores provisionales (radio 100 m, precisión máx. 25 m): configurables, mostrados como provisionales y pendientes de pruebas y validación antes de producción.
- Fase 1: los intentos se guardan en el almacenamiento local (modo demo) y la interfaz indica que la validación real corresponde al backend.

**Agrupación de intentos en incidencias (D26):**
- Cada intento rechazado se conserva de forma individual, con los datos de ubicación disponibles y su motivo.
- La incidencia visible de ubicación no autorizada es **una por trabajador + jornada operativa + hospital**; un nuevo intento en esa combinación se **añade** a la incidencia existente en lugar de crear otra.
- La incidencia agrupada permite consultar todos los intentos asociados (hora, coordenadas, precisión, distancia al hospital, motivo).
- Revisor principal: el coordinador responsable del hospital o zona. El administrador autorizado puede intervenir o **escalar** el caso.
- Resolver la incidencia (justificada / no justificada / pendiente de información) **no elimina ni modifica** los intentos originales.
- Un intento sin ubicación válida se registra como **fallo técnico** y no se afirma que se demostrara una ubicación fuera de zona; no alimenta la incidencia de ubicación no autorizada.

`[NEEDS CLARIFICATION: P-09 QR como complemento (hoy solo GPS); P-28 qué es "zona" y cómo se asigna el coordinador responsable; P-29 detalle de la escalada al administrador.]`
`[NEEDS CLARIFICATION: ¿se debe permitir registro sin conexión y sincronizar después? ¿Cómo se valida la hora (reloj del dispositivo vs. servidor)?]`
`[NEEDS CLARIFICATION: ¿cómo se evita que alguien registre por otra persona (identidad del dispositivo, sesión, biometría)? ¿Se requiere dispositivo personal o compartido?]`
`[NEEDS CLARIFICATION: ¿puede un coordinador registrar o corregir un evento en nombre del trabajador? ¿Con qué justificación y trazabilidad?]`
`[NEEDS CLARIFICATION: ¿se permiten almuerzos múltiples o pausas distintas al almuerzo?]`

### HU-06 Control de asistencia y detección de incidencias (P1)
Como coordinador, quiero que el sistema compare registros con horarios y señale incumplimientos.

Tipos de incidencia: entrada tardía; falta de registro de entrada; ausencia aparente; salida anticipada; falta de registro de salida; almuerzo excedido; regreso tardío; tiempo trabajado inferior al programado; registros incompletos o inconsistentes; **intento de marcación fuera del radio autorizado (ubicación no autorizada)**, generado solo cuando hay evidencia de ubicación válida fuera del radio (D23). Los fallos técnicos de GPS se listan como intentos fallidos, no como incidencia de ubicación indebida.

Criterios:
- Una incidencia **no** es una sanción.
- El coordinador puede revisarla, solicitar justificación y registrar una resolución.
- Cada incidencia tiene estado y trazabilidad de acciones.
- Lista con búsqueda, filtros y paginación.
- Flujo (D11): (1) el sistema detecta y registra la anomalía; (2) el trabajador puede aportar una justificación; (3) el coordinador revisa registros y explicación; (4) el coordinador resuelve: justificada, no justificada o pendiente de información; (5) el sistema conserva el historial de la decisión y de cualquier corrección.
- Un GPS fallido **no** crea marcación (D13) ni incidencia de ubicación indebida; queda como intento rechazado de tipo fallo técnico (D23, D26).
- El historial no se sobrescribe: cada decisión o corrección añade una entrada con quién, cuándo y por qué.
- **Responsable y escalada (D28, D29):** el revisor principal es el coordinador responsable del hospital. El coordinador puede escalar manualmente la incidencia al administrador indicando el motivo. El administrador interviene directamente si no hay coordinador asignado o si se requiere. Sin responsable, la incidencia queda «pendiente de asignación» y visible para el administrador. Toda resolución queda auditada y los intentos originales se conservan.

`[NEEDS CLARIFICATION: tolerancias (minutos de gracia) para entrada, salida y almuerzo; ¿iguales para todos o configurables por hospital/trabajador/cargo?]`
`[NEEDS CLARIFICATION: criterio de "ausencia aparente" (¿cuántos minutos sin entrada?).]`
`[NEEDS CLARIFICATION: flujo de justificación: ¿quién justifica (trabajador, coordinador), con adjuntos?, ¿quién resuelve?, ¿resoluciones posibles (justificada, injustificada, error del sistema…)?]`
`[NEEDS CLARIFICATION: ¿las incidencias resueltas pueden reabrirse?]`

### HU-07 Alertas y notificaciones (P2)
Como coordinador, quiero ver alertas cuando ocurra algo que requiera atención.

Ejemplos: entrada no registrada tras el margen; almuerzo excedido; sin regreso; salida anticipada; eventos incompatibles.

Criterios:
- Alertas visibles en el panel, con estado pendiente/revisada.
- Acceso directo desde la alerta a la incidencia/trabajador.
- Correo, SMS y notificaciones móviles: **fuera de alcance inicial**, se evaluarán después.

`[NEEDS CLARIFICATION: relación alerta ↔ incidencia (¿una alerta genera siempre una incidencia? ¿se pueden descartar alertas?).]`

### HU-08 Informes e historial (P2)
Como coordinador, quiero consultar y exportar informes de cumplimiento.

Contenido: asistencia diaria; horas trabajadas por empleado; duración de descansos; retrasos y salidas anticipadas; incidencias pendientes/resueltas; cumplimiento por hospital y municipio; historial por trabajador.

Criterios:
- Filtros por trabajador, hospital, municipio y periodo.
- Se distinguen horas programadas, horas registradas, tiempo de descanso y tiempo efectivo de trabajo.
- Exportación a Excel (ExcelJS) y CSV. En Fase 1 los archivos se descargan con datos de demostración y llevan la marca **DEMO** en el nombre del archivo y en su encabezado (D9, D34, D36).

`[NEEDS CLARIFICATION: fórmulas aprobadas para horas registradas vs. efectivas y tratamiento de jornadas incompletas.]`
`[NEEDS CLARIFICATION: ¿Excel, CSV o ambos? ¿Formato y columnas requeridas? ¿Algún informe con formato oficial/legal?]`

### HU-09 Administración de usuarios y accesos (P2)
Como administrador, quiero gestionar los usuarios autorizados y sus permisos.

`[NEEDS CLARIFICATION: ¿cómo se crean las cuentas (invitación, alta manual)? ¿Se requiere recuperación de acceso? ¿Autenticación en dos pasos?]`
`[NEEDS CLARIFICATION: ¿el trabajador es también un "usuario" con credenciales propias?]`

## 5.1 Criterios de aceptación transversales (GPS, intentos, coordenadas, foto)

- CA-1: sin ubicación válida no se crea ninguna marcación; el mensaje indica la causa y cómo corregirla (permiso, señal, precisión, acercarse al hospital).
- CA-2: una marcación válida guarda tipo, fecha y hora, coordenadas y precisión reportada.
- CA-3: un intento fuera del radio no cambia los tiempos efectivo, de almuerzo ni total, ni la secuencia de eventos.
- CA-4: un intento fuera del radio con ubicación válida crea un intento rechazado **y** una incidencia de ubicación no autorizada; un fallo técnico crea solo un intento rechazado marcado como fallo técnico.
- CA-5: los intentos rechazados aparecen separados de las marcaciones válidas en la interfaz y en los informes, con su historial de revisión.
- CA-6: un hospital con coordenadas sin confirmar muestra una advertencia y no activa validación de presencia.
- CA-7: coordenadas fuera de rango (lat ∉ [−90, 90], lon ∉ [−180, 180]) o no numéricas se rechazan con mensaje claro; con GPS del coordinador se muestra la precisión antes de confirmar.
- CA-8: una foto mayor de 2 MB se comprime automáticamente; un formato no admitido se rechaza con mensaje; la foto se puede retirar sin perder el historial de asistencia; la aplicación funciona igual sin foto.
- CA-9: el radio (100 m) y la precisión (25 m) aparecen identificados como **provisionales** en la configuración y en las pantallas relevantes.
- CA-10: en Fase 1 no se usa ningún servicio externo (mapas, geocodificación, backend) y la demo declara que la validación real corresponde al backend.

- CA-11: un hospital sin coordenadas válidas y confirmadas no permite marcar y la pantalla explica que necesita configuración (D25).
- CA-12: varios intentos fuera de radio del mismo trabajador, jornada operativa y hospital producen **una sola** incidencia visible, que lista todos sus intentos.
- CA-13: resolver o escalar una incidencia no cambia ni elimina ningún intento original, y queda registrado quién actuó y cuándo.
- CA-14: un intento sin ubicación válida aparece como fallo técnico y nunca como evidencia de ubicación fuera de zona.

## 6. Reglas de negocio

**Duraciones (D16), calculadas siempre a partir de las marcas de tiempo registradas, nunca de contadores del navegador (la interfaz puede mostrar un contador mientras la jornada está abierta):**

- **Tiempo efectivo de trabajo** = (entrada → salida al almuerzo) + (regreso → salida final).
- **Tiempo de almuerzo** = salida al almuerzo → regreso.
- **Tiempo total de jornada** = entrada → salida final. Con un solo almuerzo: total = efectivo + almuerzo.
- Si falta una marcación, el cómputo se marca **incompleto**; no se muestra una duración estimada como definitiva.

Ejemplo ilustrativo (no regla): 07:00 entrada, 12:00 salida almuerzo, 13:00 regreso, 16:00 salida → efectivo 5 h + 3 h = 8 h, almuerzo 1 h, total 9 h.

El horario y la hora de almuerzo se **asignan y editan por el coordinador** (D15).

Siguen **pendientes de definición** por el responsable del negocio y **no deben inventarse**:

- Tolerancias de salida y almuerzo (la de entrada es 0 min, D1).
- Pausas adicionales y su cómputo.
- Tratamiento laboral del almuerzo (pagado o descontado).
- Turnos nocturnos, festivos, dominicales, horas extra y recargos.
- Cuándo un registro es "inconsistente" o "incompleto".
- Reglas de ubicación autorizada.

Se recomienda documentarlas como tabla de ejemplos (entrada → resultado esperado), que servirán de base para pruebas verificables.

## 7. Seguridad y privacidad (requisitos funcionales)

- Acceso según perfil.
- Protección de datos personales, solo los estrictamente necesarios.
- Registro de operaciones administrativas relevantes.
- Protección contra modificación no autorizada de registros de asistencia.
- Trazabilidad de correcciones y justificaciones (quién, cuándo, qué cambió, por qué).
- Tratamiento proporcionado de la ubicación.
- Políticas de conservación y acceso a registros.
- Cumplimiento de normativa colombiana laboral y de protección de datos.

`[NEEDS CLARIFICATION: base legal y autorización para el tratamiento de datos (Ley 1581 de 2012 y normas relacionadas): ¿quién es el responsable del tratamiento y qué consentimiento se recoge, en especial para la ubicación?]`
`[NEEDS CLARIFICATION: plazo de conservación de registros y de datos de ubicación.]`
`[NEEDS CLARIFICATION: ¿los registros corregidos conservan la versión original visible?]`

## 8. Experiencia de usuario

- Interfaz empresarial moderna; predominio de azul oscuro, azul eléctrico y blanco.
- Navegación lateral en el panel de coordinación.
- Tarjetas con indicadores; tablas con búsqueda, filtros y paginación.
- Estados visuales claros: jornada activa, almuerzo, retraso, ausencia, incidencia.
- Adaptable a escritorio, tableta y móvil.
- Formularios sencillos y accesibles; mensajes de error y confirmación comprensibles.
- Estados de carga, error, vacío y confirmación en todas las vistas.

`[NEEDS CLARIFICATION: el spec original menciona un "concepto visual del panel aprobado" que no está en el repositorio. Se requiere esa referencia (imagen, Figma, logo, tipografías) antes de diseñar.]`

## 9. Alcance por fase

### Fase 1: Frontend completo con datos simulados (esta especificación)
Incluye: todas las pantallas de las historias HU-01 a HU-09, navegación, formularios con validación de interfaz, estados de carga/error/vacío/confirmación, diseño responsive, datos simulados organizados en una ubicación diferenciada, capa de servicios/repositorios que aísla el origen de datos, contratos preliminares de datos. Debe ejecutarse localmente.

No incluye: base de datos funcional, backend, autenticación ni autorización reales (el control por rol es solo visual, D27), servicios externos, validación de ubicación por el servidor, QR, envío real de notificaciones, informes con datos reales. La captura de ubicación usa la geolocalización real del navegador (D13); las exportaciones son archivos con datos de demostración marcados DEMO (D36).

Comportamiento de demostración: las acciones (guardar, registrar, resolver) se comportan de forma coherente pero **sin simular persistencia permanente ni verificación de ubicación real**.

Resuelto por D9: los cambios se guardan en el almacenamiento local del navegador (con aviso de modo demo y opción de restablecer); el acceso es un login simulado con usuarios de prueba por rol; CSV y Excel se descargan con datos demo. Pendiente solo: P-22 (escenarios de datos) y P-23 (columnas de informes).

**Escenarios mínimos que debe cubrir el dato simulado** (propuesta, a validar): jornada normal; retraso; sin entrada; ausencia aparente; almuerzo excedido; no regresó del almuerzo; salida anticipada; turno que cruza la medianoche; registro GPS fallido pendiente de revisión; incidencia justificada, no justificada y pendiente de información; trabajador inactivo.

### Fase 2: Backend e integración (fuera de esta entrega)
Base de datos, autenticación y autorización, API, registro persistente, reglas de negocio, cálculo de horas, incidencias, GPS/QR, informes, pruebas, integración progresiva. No se inicia hasta completar y revisar la Fase 1.

## 10. Criterios de éxito

- El coordinador consulta el estado de todo el personal desde un único panel.
- Se representan todos los eventos principales de una jornada.
- Se comparan horarios programados y registros reales.
- Las incidencias son visibles y revisables.
- Los informes permiten analizar cumplimiento por trabajador y hospital.
- El frontend funciona con datos simulados.
- El backend podrá integrarse mediante contratos de API definidos.
- Los cálculos de jornada son verificables con pruebas.
- Los datos reales se protegen con controles de acceso adecuados.

## 11. Observaciones sobre la especificación original

**Contradicciones o tensiones detectadas**

1. *Registro con verificación de ubicación vs. Fase 1 sin backend:* la pantalla de registro (HU-05) no puede verificar ubicación real en Fase 1. Se propone mostrar el flujo con estados simulados explícitamente etiquetados como demostración.
2. *"Terminado" vs. "se ve bien":* el spec exige criterios más allá de lo visual, pero no define cómo se acepta cada módulo. Se propone aceptar cada módulo por sus criterios de aceptación de §5.
3. *Reglas de cálculo "verificables con pruebas" vs. reglas sin definir:* no se pueden escribir pruebas sin las reglas de §6. En Fase 1, la lógica de cálculo debe mantenerse en una capa aislada y provisional.
4. *Lógica de negocio fuera de los componentes vs. necesidad de mostrar datos coherentes:* los indicadores del panel requieren calcular estados; esa lógica debe vivir en la capa de servicios, marcada como provisional.
5. *Modo de uso del trabajador:* se indica interfaz móvil, pero no si es web móvil, aplicación instalable o ambas (decisión técnica, se pospone al plan, pero afecta al requisito de uso sin conexión).

**Preguntas de mayor impacto (resolver primero)**

1. Tolerancias y definición de retraso/ausencia.
2. Almuerzo: ¿computable? ¿ventana y duración fijas o por trabajador?
3. Turnos nocturnos, festivos y horas extra: ¿alcance?
4. Matriz de permisos por rol y alcance del coordinador.
5. Flujo de justificación y resolución de incidencias.
6. Verificación de presencia (GPS/QR) y manejo de excepciones.
7. Referencia visual aprobada.
8. Comportamiento de la demo de Fase 1 (persistencia en sesión, cambio de rol, exportación).

## 12. Fuera de alcance (por ahora)

- Notificaciones por correo, SMS o móviles.
- Nómina, liquidación de salarios y recargos (salvo que se indique lo contrario en la aclaración de §4 HU-04).
- Sanciones automáticas.
- Todo el backend (Fase 2).
