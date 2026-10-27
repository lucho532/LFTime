# Especificación de la Fase 2: backend de LFTime

**Estado:** APROBADA por el responsable el 2026-10-27, **con los pendientes legales y operativos abiertos** (§6): validación legal de N-3 y N-4, remitente de Brevo y disponibilidad (N-12). Se aprobó solo este documento; `contrato-api.md` y `plan.md` siguen en borrador. **NO está libre de bloqueantes:** quedan decisiones de negocio, legales y operativas abiertas (§6). Esta especificación dice **qué** debe hacer el backend y **por qué**; no fija decisiones técnicas (esas viven en `plan.md`, que sigue en borrador hasta que esta spec se apruebe y las clarificaciones se resuelvan, constitución, flujo SDD).

**Antecedentes:** la Fase 1 (frontend con datos de demostración) está en `specs/001-lftime/`. Su revisión **no está cerrada**: ver `traspaso-fase-2.md` §7 y las tareas en `[~]` de `tasks.md`. El responsable autorizó el 2026-10-27 redactar esta especificación; **el código del backend no empieza** hasta que el responsable apruebe esta spec y se resuelvan las clarificaciones que bloquean cada hito (`tasks.md` de esta carpeta).

Prioridad ante conflicto (constitución R-13): requisitos aprobados > constitución > esta spec > plan > tasks > decisiones de implementación. Las decisiones de la Fase 1 (D1 a D42) siguen vigentes salvo que esta spec diga otra cosa.

---

## 1. Propósito y alcance

LFTime controla las jornadas laborales del personal de salud que una empresa asigna a hospitales de distintos municipios de Colombia. La Fase 1 demostró la experiencia completa con datos ficticios guardados en el navegador. **La Fase 2 hace que sea real:** datos compartidos y permanentes, cuentas reales, permisos que de verdad se hacen cumplir y registros que el servidor valida y conserva.

**Entra en la Fase 2**

1. Persistencia permanente y compartida de todos los datos que hoy viven en `localStorage` e `IndexedDB`.
2. Autenticación real (ingreso, cierre de sesión, recuperación de acceso) y autorización **en el servidor** con la matriz de permisos validada.
3. Validación de cada marcación en el servidor: secuencia, hospital habilitado, radio y precisión, y el instante tomado de la hora del servidor.
4. Detección de incidencias continua en el servidor, con alertas.
5. Auditoría inmutable de las acciones que la constitución exige (quién, cuándo, qué, por qué) y una forma de consultarla.
6. Informes y exportación definitivos (sin marca DEMO).
7. Fotos de perfil con control de acceso (D24, D30) y el consentimiento que se defina (P-13).
8. Integración: el frontend usa la API sin cambiar sus páginas, componentes ni hooks (constitución R-4, plan 001 §17).

**No cambia**

- Los contratos de datos (`contratos-preliminares.md`, `frontend/src/contratos/`): se amplían solo si hace falta y con versión.
- Las reglas provisionales y sus valores configurables (plan 001 §13): **siguen siendo provisionales**, no son reglas laborales y **nunca generan sanciones**. Pasar a producción no las convierte en definitivas: eso lo decide el responsable.
- La interfaz, el vocabulario del dominio y el principio «una incidencia no es una sanción».

**Fuera de alcance de la Fase 2 (por ahora):** QR (P-09), cálculo de nómina, recargos, horas extra, festivos y dominicales (P-05), cualquier descuento o pago del almuerzo (P-03), notificaciones por correo o mensajería (P-19), modo sin conexión (P-10) y migración de datos reales previos (no se migra nada de la demostración).

---

## 2. Roles y principio de seguridad

Los tres roles de la Fase 1 (**administrador**, **coordinador** y **trabajador**), ahora dentro de una empresa, más el rol de plataforma **desarrollador** (D-B1, D-B6).

**El servidor es la única autoridad.** Ninguna pantalla oculta es seguridad. Toda operación comprueba en el servidor quién la pide y si puede hacerla, con la identidad que sale de la sesión; **nunca** con un identificador enviado por el cliente (hoy muchos servicios reciben `usuarioId` como parámetro: en la API eso desaparece y el actor es el usuario autenticado). Las reglas de `reglas/permisos*` de la Fase 1 son la **especificación ejecutable** de la matriz provisional (P-21) y la fuente de las pruebas de autorización.

---

## 3. Requisitos funcionales

Cada requisito indica la historia de la Fase 1 que lo origina (`spec.md` 001 §5).

### RF-1 Cuentas y acceso (HU-09, P-24)
- RF-1.1 Una persona ingresa con sus credenciales reales. Se acabó el ingreso por lista de usuarios de prueba.
- RF-1.2 Cada trabajador, coordinador y administrador tiene una cuenta vinculada a su ficha; el vínculo cuenta ↔ trabajador es único.
- RF-1.3 Cerrar sesión invalida la sesión en el servidor.
- RF-1.4 Recuperación de acceso por un medio verificado (hoy la pantalla existe pero no envía nada).
- RF-1.5 Los intentos fallidos de ingreso se limitan y se auditan. No se guardan contraseñas en claro.
- RF-1.6 Doble factor: **fuera del alcance de esta fase** (D-B29).

### RF-2 Personal, hospitales y horarios (HU-02, HU-03, HU-04)
- RF-2.1 Alta, edición y consulta de trabajadores, hospitales, municipios y fichas de usuarios con las mismas reglas de la Fase 1 (documento único, rango de coordenadas, estados).
- RF-2.2 Las coordenadas de un hospital se confirman por los dos mecanismos de D22; un hospital sin coordenadas confirmadas **no admite marcaciones** (D25, CA-6, CA-11). Cada cambio añade una entrada al historial; nunca se sobrescribe (R-10).
- RF-2.3 La asignación del coordinador responsable conserva su historial de vigencias (D28).
- RF-2.4 Los horarios se asignan por vigencia y se conservan todos (D15). Las horas programadas se guardan como las escribe el coordinador, en hora de Colombia (R-9).

### RF-3 Registro de la jornada (HU-05, CA-1 a CA-5, CA-14)
- RF-3.1 Una marcación solo se acepta con ubicación del dispositivo; sin coordenadas válidas no hay marcación (D13, R-11).
- RF-3.2 El servidor valida la secuencia (entrada, salida a almuerzo, regreso, salida final), el hospital habilitado, la precisión y la distancia al hospital con los valores configurados (hoy 100 m y 25 m, provisionales).
- RF-3.3 **El instante lo fija el servidor.** La hora que envíe el dispositivo no se usa como instante de la marcación (P-10). Los instantes se guardan en UTC.
- RF-3.4 Un intento rechazado se guarda **aparte** de las marcaciones válidas, con su motivo; un fallo técnico nunca se presenta como ubicación indebida (D23, CA-14). Un intento fuera de radio con ubicación válida abre o agrega a una incidencia (D26, CA-4, CA-12).
- RF-3.5 Reintentar un registro (por ejemplo, por una conexión lenta) no duplica la marcación.
- RF-3.6 La ubicación solo es **«capturada»**, nunca «verificada» (P-11): la aplicación no afirma más de lo que el servidor puede comprobar.
- RF-3.7 Marcaciones, intentos y correcciones son **inmutables** (R-10). La corrección manual (T-9.7) **está bloqueada por P-12** y no se implementa hasta decidirlo.

### RF-4 Incidencias y alertas (HU-06, HU-07)
- RF-4.1 El servidor detecta las incidencias de la matriz provisional (plan 001 §13) en forma continua, sin depender de que alguien abra una pantalla.
- RF-4.2 Una incidencia asigna su revisor según el coordinador responsable vigente; sin responsable queda pendiente de asignación y visible al administrador (D28). Escalar al administrador exige motivo (D29).
- RF-4.3 Justificar, revisar, resolver, reabrir, escalar y reasignar agregan entradas al historial con quién, cuándo y por qué; resolver o escalar no toca los intentos originales (CA-13).
- RF-4.4 Una alerta por incidencia; se marca revisada cuando quien revisa abre la incidencia. Las alertas no se descartan (P-19).
- RF-4.5 **Una incidencia no es una sanción:** ninguna acción tiene efecto sobre pagos ni contratos (P-18).

### RF-5 Panel, informes y exportación (HU-01, HU-08)
- RF-5.1 El panel de coordinación muestra la situación actual del personal con las definiciones provisionales de la Fase 1, limitada a lo que cada rol puede ver.
- RF-5.2 Los cinco informes provisionales (asistencia diaria, horas por trabajador, incidencias, intentos rechazados, cumplimiento por hospital) más el acumulado mensual y el tiempo por reponer, con las columnas de P-23 hasta que se definan las definitivas.
- RF-5.3 Exportación a CSV y Excel generada por el servidor, **sin la marca DEMO**, con el mismo contenido que la pantalla. Cada exportación se audita (quién y qué).
- RF-5.4 El cómputo de tiempos sigue siendo provisional (P-03, P-05): efectivo, almuerzo y total separados, solo de jornadas completas, sin estimar lo que falta (D16, D21).

### RF-6 Configuración (HU-09)
- RF-6.1 Solo el administrador cambia las reglas provisionales. **Cada cambio se audita con su autor** (hoy no se registra, `traspaso-fase-2.md` §6).
- RF-6.2 Qué ocurre con los hospitales existentes cuando cambia el radio o la precisión **es una decisión pendiente** (N-10, D19).

### RF-7 Fotos (D14, D24, D30, P-13)
- RF-7.1 Cada persona sube, cambia y retira solo su propia foto; JPG, JPEG, PNG o WebP, hasta 2 MB. Retirarla no borra el historial de asistencia.
- RF-7.2 Quién puede ver la foto de otra persona sigue la regla de D24 y D30. **Nada de esto sale a producción sin la validación legal de P-13** (N-4).

### RF-8 Auditoría (constitución, principio 9)
- RF-8.1 Se auditan: cambios de horario, de coordenadas y de asignaciones, resoluciones y escaladas, exportaciones, cambios de configuración, altas y cambios de cuentas, ingresos fallidos y cualquier corrección de marcación (cuando exista).
- RF-8.2 La auditoría es de solo añadir y tiene una consulta para el administrador (hoy no hay pantalla, `traspaso-fase-2.md` §6).

---

## 4. Requisitos no funcionales

- **Seguridad:** autorización en el servidor (§2); comunicación cifrada; secretos fuera del código; límite de intentos en el ingreso; validación de toda entrada; sin datos personales en registros de diagnóstico.
- **Privacidad por diseño (principio 9):** solo los datos personales estrictamente necesarios; la ubicación se trata de forma proporcionada; conservación y consentimiento según lo que decida el responsable (N-3, N-4). Sin contraseñas en claro ni datos financieros.
- **Trazabilidad:** requisito → spec → plan → tarea → código → prueba (R-13).
- **Hora:** todo se expresa en hora de Colombia (UTC−5 fijo); instantes reales en UTC; el servidor es el origen oficial de «ahora» (R-9, P-10).
- **Cálculos verificables (principio 10):** toda regla portada se prueba con los **mismos casos** que ya existen en la Fase 1, para que servidor y cliente den el mismo resultado.
- **Disponibilidad y respaldo:** definidos con el responsable (N-12) antes de producción.
- **Accesibilidad:** sin cambios; es del frontend.

---

## 5. Criterios de aceptación de la Fase 2

- **CB-1** Ninguna operación se completa sin sesión válida, y un trabajador no puede leer ni cambiar datos de otro por ningún medio (probado con la matriz completa de roles).
- **CB-2** Una marcación fuera de secuencia, de un hospital sin coordenadas confirmadas, fuera de radio o con precisión insuficiente se rechaza en el servidor, aunque el cliente no la haya validado. Las pruebas de CA-1 a CA-5 y CA-11 a CA-14 de la Fase 1 pasan contra el servidor.
- **CB-3** El instante de una marcación es el del servidor; una hora enviada por el cliente no la altera.
- **CB-4** Repetir el mismo registro (misma clave de repetición) no crea una segunda marcación.
- **CB-5** Marcaciones, intentos, historiales y auditoría no se pueden modificar ni borrar, ni siquiera desde la base de datos con la cuenta de la aplicación.
- **CB-6** Los resultados de duraciones, estado, detección de incidencias e informes del servidor coinciden con los de la Fase 1 para los mismos datos (casos compartidos).
- **CB-7** Un cambio de configuración, de horario, de coordenadas o de asignación queda auditado con su autor.
- **CB-8** El frontend funciona contra la API sin cambios en páginas, componentes ni hooks; la prueba de integración recorre el ingreso, el registro, una incidencia y un informe.
- **CB-9** Las exportaciones del servidor coinciden con lo que muestra la pantalla y no llevan la marca DEMO.
- **CB-10** Sin datos de demostración en producción: se retiran `datos-demo/`, el aviso de modo demostración y las claves `lftime.demo.*`.

---

## 6. Clarificaciones pendientes `[NEEDS CLARIFICATION]`

Cada una indica qué bloquea. Mientras no se resuelvan, esa parte no se implementa o se implementa con un supuesto **provisional y configurable** documentado (R-8).

| N | Tema (pendiente de la Fase 1) | Pregunta para el responsable | Bloquea |
|---|-------------------------------|------------------------------|---------|
| N-1 | Suplantación al marcar (P-11) | **Resuelta (2026-10-27, D-B24 y D-B28)** | — |
| N-2 | Correcciones manuales (P-12) | **Resuelta (2026-10-27, D-B23):** no habrá corrección manual de marcaciones | — |
| N-3 | Conservación (P-15, legal) | **Resuelta como supuesto provisional (2026-10-27, D-B25); validación legal pendiente.** Falta: mecanismo de borrado al vencer y qué se conserva de la auditoría | TB-11.2 |
| N-4 | Datos personales y foto (P-13, legal) | **Resuelta como supuesto provisional (2026-10-27, D-B26); el texto del aviso y el contrato de encargo los redacta y valida el asesor legal** | RF-7 en producción |
| N-5 | Matriz de permisos (P-21, P-28, P-29) | **Resuelta (2026-10-27, D-B12 a D-B18). Pendiente solo la parte legal de las fotos (N-4)** | — |
| N-6 | Cuentas (P-24) | **Resuelta (2026-10-27, D-B1 a D-B4, D-B29):** alta por invitación; contraseña de mínimo 8 caracteres (D-B29); recuperación por correo; sin doble factor en esta fase | — |
| N-7 | Hora y conexión (P-10) | **Resuelta (2026-10-27, D-B4):** no se marca sin conexión; la hora es la del servidor | — |
| N-8 | QR (P-09) | ¿Se agrega QR como segundo factor de presencia? | Fuera de alcance hasta decidir |
| N-9 | Almuerzo y recargos (P-03, P-05, legales) | **Resuelta (2026-10-27, D-B27)** | — |
| N-10 | Radio y precisión (D19, P-08) | **Resuelta (2026-10-27, D-B19)** | — |
| N-11 | Alta de personal | **Resuelta (2026-10-27, D-B1, D-B5):** el administrador de cada empresa invita por correo y registra al personal con el formulario de la aplicación; sin importación masiva ni otro sistema | — |
| N-12 | Entorno y operación | **Resuelta (2026-10-27, D-B22, D-B33, D-B38, D-B39, D-B40):** Railway en Virginia, mantenimiento de madrugada y sin respaldos por ahora (riesgo aceptado, sin datos reales hasta tener respaldo) | Despliegue (último hito) |
| N-13 | Notificaciones externas (P-19) | ¿Habrá correo o mensajes de alerta? ¿A quién y con qué contenido? | Fuera de alcance hasta decidir |
| N-14 | Datos previos | **Resuelta (2026-10-27, D-B21)** | — |
| N-15 | Fotos | **Resuelta (2026-10-27, D-B34):** las fotos van en PostgreSQL | — |
| N-16 | Correo transaccional | **Resuelta (2026-10-27, D-B7):** se usa Brevo. **Falta:** remitente y dominio verificado, y clave de API como secreto (N-13, correo de alertas, sigue fuera de alcance) | TB-3.1, TB-3.4 |
| N-17 | Multiempresa en la Fase 1 | **Resuelta (2026-10-27, D-B8):** el frontend se adapta dentro de la Fase 2 (pantalla del desarrollador, selector de empresa, registro por invitación) | — |
| N-18 | Invitaciones | **Resuelta (2026-10-27, D-B9 y D-B30)** | — |
| N-19 | Suspensión de empresa | **Resuelta (2026-10-27, D-B10, D-B11, D-B35, D-B37).** Pendiente solo la validación legal del plazo de conservación (N-3) | TB-3.5 |

**Siguen abiertos de la Fase 1 y se heredan:** P-01, P-02, P-04, P-06, P-07, P-16 a P-21, P-23 y P-25 se mantienen como supuestos provisionales aceptados (D37); la validación definitiva sigue siendo del responsable.

---

## 6.1 Decisiones del responsable (2026-10-27)

- **D-B1 Multiempresa.** La aplicación pasa a ser multiempresa. Un **desarrollador** (rol de plataforma, fuera de toda empresa) crea la empresa e invita por correo a su primer administrador. Ese administrador se registra por el enlace, queda con rol administrador de la empresa e invita por correo a coordinadores y trabajadores, que se registran y quedan vinculados a la empresa. El rol va fijado en la invitación.
- **D-B2 Aislamiento.** Una sola base de datos; toda tabla de negocio lleva `empresa_id` y el servidor filtra siempre por la empresa de la sesión, reforzado con seguridad a nivel de fila de PostgreSQL. La empresa sale de la sesión, **nunca** de un dato enviado por el cliente.
- **D-B3 Pertenencia.** Una misma persona puede pertenecer a más de una empresa: la cuenta tiene una membresía por empresa y elige la empresa al ingresar. El vínculo cuenta ↔ ficha es único **por empresa**.
- **D-B4 Acceso.** Contraseña con recuperación por código de un solo uso enviado por correo. Sin conexión no se marca; la hora es la del servidor.
- **D-B5 Alta de personal.** Por formulario de la aplicación, hecha por el administrador de la empresa. Solo el administrador invita.
- **D-B6 Rol desarrollador.** Solo gestiona empresas e invitaciones (crear, suspender, reactivar). **No** ve marcaciones, ubicaciones ni fotos. Sus acciones se auditan.
- **D-B7 Correo.** Se usa Brevo para el correo transaccional (invitaciones y recuperación de acceso).
- **D-B8 Frontend multiempresa.** La adaptación del frontend se hace dentro de la Fase 2, no en una Fase 1.5.
- **D-B9 Invitaciones.** Caducan a las 72 horas, son de un solo uso y se pueden reenviar (el reenvío invalida el enlace anterior y reinicia las 72 horas) y revocar (una invitación revocada deja de funcionar de inmediato; la revocación queda en el historial, no se borra).
- **D-B10 Baja de empresa.** Suspender una empresa cierra de inmediato todas sus sesiones activas y no borra nada: los datos se conservan hasta que el desarrollador los elimine manualmente con un botón de su pantalla, que exige escribir el nombre de la empresa para confirmar. Esa eliminación es irreversible y debe auditarse en un registro que no pertenezca a la empresa borrada. **Tensión con la constitución (histórico inmutable, R-10):** el borrado solo es válido como operación de plataforma, y queda sujeto a N-3 (retención legal).
- **D-B11 Cuenta del desarrollador.** La cuenta del desarrollador queda registrada en la base de datos con el correo `luisrak8@gmail.com`, creada por una migración o carga inicial. La contraseña **no** se guarda en el código ni en la migración: la establece la persona por el flujo de recuperación de acceso por correo.
- **D-B12 Matriz base.** Se aprueba la matriz provisional de la Fase 1 (`reglas/permisos*`) sin cambios de reparto entre administrador, coordinador y trabajador, aplicada **dentro de la empresa de la sesión** (D-B2). El administrador añade invitar y gestionar cuentas. El desarrollador queda fuera de la matriz de jornada (D-B6).
- **D-B13 Administradores iguales.** *(Reemplaza la figura del «administrador principal»; decidido 2026-10-27.)* Todos los administradores de una empresa tienen los mismos permisos, incluido asignar coordinadores a hospitales. El primero lo invita el desarrollador; los demás, un administrador (D-B5). Se elimina el permiso `puedeVerFotos` (ver D-B17).
- **D-B14 Varios responsables (P-28).** Un hospital puede tener **varios coordinadores responsables**, cada uno con su historial de vigencias (D28). Esto sustituye el «responsable principal único» de la Fase 1: el contrato de asignación y `revisorPrincipalId` de la incidencia cambian y requieren versión nueva de los contratos y de las reglas de permiso.
- **D-B15 Escalada (P-29).** La escalada **comparte** la responsabilidad: coordinador y administrador pueden resolver; la escalada queda auditada con motivo y los intentos originales no se tocan.
- **D-B16 Varios responsables y resolución.** Cualquiera de los coordinadores responsables de un hospital puede revisar y resolver sus incidencias. Quien actúa queda registrado en el historial de la incidencia.
- **D-B17 Fotos como en una red social.** Solo el propietario cambia o retira su foto de perfil. Coordinador y administrador **siempre** la ven (se elimina el permiso `puedeVerFotos` de la Fase 1; la base legal de esa visibilidad sigue en N-4); nadie más la modifica (coincide con la regla de la Fase 1, `puedeCambiarFoto`).
- **D-B18 Cambio de roles y último administrador.** El administrador puede cambiar el rol de otros empleados de la empresa entre trabajador, coordinador y administrador (incluido ascender a otro a administrador o quitarle ese rol a otro administrador). Una empresa siempre conserva al menos un administrador: si solo queda uno, no se le puede eliminar ni quitarle el rol (el servidor lo rechaza). Todo cambio de rol se audita.
- **D-B19 Radio y precisión.** Son una configuración **por empresa** que aplica a todos sus hospitales. Al cambiarla se actualizan los hospitales existentes; el cambio se audita (quién, cuándo, valor anterior y nuevo) y las marcaciones ya evaluadas conservan el resultado que tuvieron entonces (histórico inmutable). El valor por defecto de una empresa nueva es el de la Fase 1 y sigue siendo provisional.
- **D-B20 Fotos.** *(Reemplazada por D-B34.)*
- **D-B21 Datos previos.** No hay migración: cada empresa empieza vacía (la demostración tampoco se migra).
- **D-B22 Alojamiento.** Nube administrada con PostgreSQL gestionado y respaldos automáticos, operada por el responsable.
- **D-B23 Sin corrección manual.** Nadie crea, edita ni borra marcaciones a mano, ni siquiera el administrador. Lo registrado por el trabajador con GPS es lo que queda. Un error se explica con una incidencia justificada o con una nota, nunca cambiando la marcación (refuerza el histórico inmutable, R-10). Se retiran TB-6.5 y la tarea T-9.7 de la Fase 1.
- **D-B24 Suplantación.** Cada cuenta se vincula a un dispositivo al primer ingreso; marcar desde un dispositivo no vinculado se rechaza hasta que se apruebe. Sin biometría ni foto en el acto. Provisional: no impide el registro básico con ubicación capturada.
- **D-B25 Conservación (provisional, pendiente de validación legal).** Marcaciones, intentos rechazados y ubicaciones se conservan **1 año**; las fotos, mientras el trabajador esté activo (se borran al desactivarlo). El borrado al vencer es una operación de plataforma y no puede ser un `DELETE` de la aplicación (R-10, TB-2.2). **Aviso:** un año puede ser menor que el plazo que la ley laboral exige conservar los soportes de jornada; el asesor legal debe confirmarlo antes de producción.
- **D-B26 Datos personales (provisional).** Cada empresa cliente es la **responsable** del tratamiento de los datos de su personal y LFTime es **encargado**; al crear la empresa se aceptan los términos de encargo. Al aceptar una invitación se muestra el aviso de privacidad (control de jornada, GPS y foto) y se exige aceptarlo; se guarda la versión y la fecha aceptadas. El texto lo redacta el asesor legal.
- **D-B27 Almuerzo y recargos.** El almuerzo se muestra aparte, como dato informativo, sin descontar ni sancionar. Festivos, dominicales, recargos y horas extra quedan **fuera de alcance**: el sistema registra día y horas sin clasificarlos. Los informes no se usan para nómina.
- **D-B28 Un solo dispositivo.** Cada persona tiene **un único dispositivo** registrado en su ficha. Solo el **administrador** puede eliminarlo (cambio de equipo o pérdida: mismo procedimiento). Al eliminarlo se cierran las sesiones de ese dispositivo y la persona queda sin dispositivo; el siguiente ingreso desde un equipo nuevo lo registra como el suyo. La eliminación se audita (quién, cuándo, a quién). Para un administrador, ver D-B32.
- **D-B29 Política de contraseñas y recuperación (actualizada 2026-10-27; sustituye el mínimo de 6 caracteres).**
  1. Longitud mínima de **8 caracteres**; se admiten contraseñas largas de **al menos 64 caracteres**.
  2. **No** se exige combinación obligatoria de mayúsculas, minúsculas, números y símbolos.
  3. *(El texto recibido no incluía el punto 3; la numeración salta de 2 a 4. Queda sin contenido hasta que el responsable diga si faltaba una regla.)*
  4. Las contraseñas se guardan **solo** con un mecanismo seguro de hash de contraseñas, con sal y parámetros adecuados. Nunca en texto plano ni con cifrado reversible.
  5. La recuperación es por correo electrónico a través de Brevo, con un mecanismo de **un solo uso, con caducidad y con protección contra solicitudes abusivas**.
  6. El inicio de sesión y la recuperación tienen **limitación de intentos y medidas contra ataques automatizados**.
  7. El doble factor sigue **fuera del alcance** de esta fase.
- **D-B30 Correo ya registrado.** Si el correo invitado ya tiene cuenta, la invitación suma una **membresía** a esa cuenta; al ingresar, la persona elige la empresa en un **selector desplegable** en su pantalla (D-B3) y puede cambiar de empresa sin cerrar sesión.
- **D-B31 Dispositivo solo móvil.** Se registra únicamente un **teléfono móvil**, nunca un computador. Si la persona ingresa desde un computador, puede entrar, pero ese equipo **no se registra** y **no puede marcar**. En el primer ingreso desde un teléfono se muestra una advertencia: ese será el único teléfono desde el que podrá hacer sus marcaciones, y solo se cambia si el administrador elimina el registro (D-B28).
- **D-B32 Recuperación del administrador.** Si el dispositivo que se pierde es el de un administrador, lo recupera él mismo con el correo de recuperación (código de un solo uso), sin depender de otro administrador.
- **D-B33 Alojamiento en Railway.** El backend y PostgreSQL se alojan en Railway, operados por el responsable (D-B22). **Verificado en el panel del responsable (2026-10-27):** la región actual es **EE. UU. oeste (California)** y el plan actual **no permite crear respaldos** (crear respaldos, programarlos y la recuperación a un punto en el tiempo exigen el plan Pro). **Producción requiere el plan Pro, o un respaldo propio equivalente.** La región y la transferencia internacional de datos (Ley 1581) quedan sujetas al asesor legal (N-4).
- **D-B34 Fotos en PostgreSQL.** Las fotos (máx. 2 MB) se guardan en una tabla aparte de PostgreSQL con `empresa_id`; la API las entrega solo tras validar sesión, empresa y permiso (D-B17). Se accede a través de una interfaz para poder mover el almacenamiento más adelante sin tocar el frontend.
- **D-B35 Eliminación de cuenta y datos (actualizada 2026-10-27).** Existe un endpoint para **eliminar la cuenta**, exigido por Google Play. Lo puede ejecutar la propia persona o el administrador de su empresa. Al ejecutarse, de inmediato se suprimen la identidad, el correo, el teléfono, la foto y el dispositivo, y se cierran las sesiones; los registros de jornada se conservan **anonimizados**, desvinculados de toda persona identificable (opción B de la enmienda, ya en la constitución, R-10). El último administrador no puede eliminarse (D-B18). Queda una auditoría de plataforma sin datos personales. **Pendiente:** el asesor legal debe confirmar que la ubicación y la hora no permiten reidentificar a la persona, y el plazo de conservación (N-3). Google Play también pide una dirección web para solicitar la eliminación.
- **D-B36 Marcar desde la app y el navegador.** Se marca desde la app Android (Google Play) y desde el navegador de un teléfono, porque no habrá app para iOS. Ambos cuentan como «teléfono móvil» (D-B31). En el navegador, el dispositivo se identifica con una marca guardada en el navegador; si la persona borra los datos del sitio, el administrador debe eliminar el registro para que vuelva a registrar el teléfono (D-B28).
- **D-B37 Borrar una empresa entera.** El botón del desarrollador hace un **borrado total** de la empresa, incluidos sus registros de jornada (a diferencia de eliminar una cuenta, que anonimiza, D-B35). Exige escribir el nombre de la empresa, se hace con la operación de plataforma de R-10 y deja una auditoría de plataforma sin datos personales. No se borra lo que la norma obligue a conservar: el asesor legal debe confirmar el plazo antes de producción (N-3). La constitución (R-10) se amplió para esto.
- **D-B38 Región.** El responsable cambiará la región de Railway a **EE. UU. este (Virginia)** antes de crear los servicios. Sigue sujeta a la validación legal de la transferencia de datos (N-4).
- **D-B39 Respaldos (decisión del responsable, 2026-10-27).** Por ahora **no habrá respaldos** de la base de datos hasta que la aplicación se consolide y se sostenga por sí sola. **Riesgo aceptado por el responsable:** sin respaldo, una falla del volumen o un error pueden perder todos los datos de jornada, que son soporte laboral. Condición recomendada que queda escrita: **no cargar datos reales de personal mientras no exista un respaldo restaurable**; mientras tanto, solo datos ficticios o de prueba. Si se incumple, se estaría incumpliendo la propia obligación de conservar los registros (N-3).
- **D-B40 Mantenimiento.** Las actualizaciones y el mantenimiento se hacen de **madrugada, hora de Colombia**. No se compromete disponibilidad por ahora.
- **Efectos:** el «mismo documento» deja de ser único global y pasa a ser único por empresa; el rol «desarrollador» es un cuarto rol que amplía la matriz (N-5); los informes, el panel y la auditoría se limitan a la empresa de la sesión; los contratos de sesión e invitación son nuevos (`contrato-api.md` se actualiza al aprobar esta spec).

---

## 7. Trazabilidad

| Requisito | Origen en la Fase 1 | Servicio de la Fase 1 que sustituye |
|-----------|---------------------|--------------------------------------|
| RF-1 | HU-09, P-24 | `ISesionServicio`, `IRecuperacionAccesoServicio`, `IUsuarioServicio` |
| RF-2 | HU-02, HU-03, HU-04 | `ITrabajadorServicio`, `IHospitalServicio`, `IHorarioServicio` |
| RF-3 | HU-05, CA-1 a CA-5, CA-14 | `IMarcacionServicio` |
| RF-4 | HU-06, HU-07 | `IIncidenciaServicio`, `IAlertaServicio` |
| RF-5 | HU-01, HU-08 | `IPanelServicio`, `IInformeServicio` |
| RF-6 | HU-09 | `IConfiguracionServicio` |
| RF-7 | D14, D24, D30 | `IFotoServicio` |
| RF-8 | principio 9 | (nuevo: no existía consulta de auditoría) |

El contrato de la API está en `contrato-api.md`.
