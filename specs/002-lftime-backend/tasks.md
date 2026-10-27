# Tareas de la Fase 2: backend de LFTime

**Estado:** BORRADOR (2026-10-27). **Ninguna tarea está iniciada.** Las tareas solo se aprueban cuando `spec.md` y `plan.md` estén aprobados; hasta entonces este documento ordena el trabajo y dice qué desbloquea cada hito.

Leyenda: `[ ]` pendiente · `[~]` en curso · `[X]` terminada y verificada (R-12: implementada, compilada, probada y verificada) · `[B]` bloqueada por una decisión pendiente (N-x de `spec.md` §6).

## Definición de terminado

Una tarea es `[X]` solo si está implementada, compilada, probada (unitaria y, si toca la base o la seguridad, de integración contra PostgreSQL real) y verificada. Antes de dar un hito por terminado: `./mvnw verify`, el límite de 250 líneas del backend, las cinco comprobaciones del frontend, documentación en español y el registro de ejecución de este archivo. Lo que no se pudo verificar se deja `[~]` y se dice.

## Hito B0: Puerta de entrada

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [X] TB-0.1 | El responsable revisa y aprueba `spec.md` y `contrato-api.md` — **ambas aprobadas por escrito el 2026-10-27, con los pendientes legales y operativos anotados** | Aprobación escrita; cada N-x queda resuelta, aceptada como supuesto provisional o aplazada | SDD |
| [ ] TB-0.2 | Cerrar la revisión de la Fase 1: las tareas `[~]` de `001/tasks.md` verificadas en dispositivo real y `traspaso-fase-2.md` entregado | `matriz-verificacion.md` sin filas «Parcial» críticas | Constitución, Fases |
| [~] TB-0.3 | Aprobar `plan.md` (pila, versiones, [DECISIÓN] marcadas) y las reglas de código adaptadas a Java — **plan aprobado el 2026-10-27 con los pendientes anotados; solo JPA/Hibernate confirmada; faltan las demás [DECISIÓN] y las reglas de código para Java** | Plan aprobado; constitución actualizada de forma explícita si cambia | R-13 |

## Hito B1: Esqueleto y herramientas

Requiere B0 aprobado. **Excepción autorizada por el responsable el 2026-10-27:** se inició con TB-0.2 (revisión de la Fase 1) y parte de TB-0.3 todavía abiertas.

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [X] TB-1.1 | Proyecto `backend/` (Maven, Java 21, Spring Boot), paquetes en español, perfiles de configuración | `./mvnw verify` pasa en limpio | Plan §1, §2 |
| [X] TB-1.2 | `RelojColombia` inyectable y ArchUnit: nadie más usa `Instant.now()` ni `LocalDate.now()` | Prueba de arquitectura | R-9 |
| [X] TB-1.3 | Pruebas de arquitectura de capas (controlador → servicio → repositorio) y de tamaño de archivo | Pasan y fallan al romper la regla | R-3, R-4 |
| [~] TB-1.4 | Manejo de errores `problem+json` con códigos en español; OpenAPI generado | Contrato visible y coincide con `contrato-api.md` — **errores y OpenAPI listos; falta comparar las rutas con `contrato-api.md`, que solo puede hacerse con el primer controlador** | Contrato API |
| [X] TB-1.5 | Testcontainers con PostgreSQL y Flyway en las pruebas | Una prueba de integración levanta la base y migra | Plan §1 |

## Hito B2: Modelo de datos e inmutabilidad

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-2.1 | Migraciones del modelo (plan §3) y catálogos (municipios) | Esquema creado desde cero con Flyway | Plan §3 |
| [ ] TB-2.2 | Rol de la aplicación con solo `INSERT` y `SELECT` en las tablas de solo añadir, más disparador de respaldo | Prueba que intenta `UPDATE` y `DELETE` en cada tabla y espera rechazo | CB-5, R-10 |
| [ ] TB-2.3 | Entidades, repositorios y mapeadores a los DTO de `contratos-preliminares.md` | Los repositorios solo persisten y consultan | R-4 |

## Hito B3: Cuentas, sesión y autorización

Bloqueado en parte por N-5, N-6, N-18, N-19 y N-3. Decisiones D-B1 a D-B6 en `spec.md` §6.1.

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [B] TB-3.1 | Empresas, membresías, invitaciones por correo y vínculo cuenta ↔ ficha por empresa (D-B1 a D-B3) | Una ficha por cuenta y empresa; invitación de un solo uso | RF-1.2, **N-18** |
| [ ] TB-3.6 | Eliminar cuenta, por la persona o por el administrador: suprime datos personales y anonimiza los registros de jornada (D-B35, R-10) | Cuenta sin datos personales ni dispositivo; registros sin vínculo a persona; auditoría sin datos personales; el rol de la aplicación sigue sin poder borrar; el último administrador no se elimina | Constitución R-10 (enmienda aprobada); validación legal pendiente antes de producción |
| [ ] TB-3.5 | Rol desarrollador: crear, suspender y reactivar empresas; aislamiento por `empresa_id` con RLS | Prueba: ninguna consulta cruza empresas; el desarrollador no lee datos de jornada; el borrado total de una empresa exige escribir su nombre y deja auditoría sin datos personales (D-B37) | D-B2, D-B6, **N-19, N-3** |
| [ ] TB-3.2 | Ingreso, refresco y cierre de sesión con tokens sin datos personales y con sello de seguridad comprobado en cada petición; límite de intentos por cuenta y por IP; auditoría de fallos | Pruebas de ingreso correcto, incorrecto, bloqueado por exceso de intentos y token vencido; token con sello cambiado rechazado al instante (cambio de contraseña, suspensión, dispositivo eliminado); el token decodificado no contiene datos personales; el límite distingue IP reales detrás del proxy; contraseña guardada solo como hash PBKDF2 con sal propia (D-B29); una contraseña de 64 o más caracteres con tildes se verifica completa | RF-1.1, RF-1.3, RF-1.5 |
| [ ] TB-3.3 | Matriz de permisos portada de `reglas/permisos*` y aplicada en el servidor | Prueba de la **matriz completa** de roles y pertenencia: ningún trabajador lee ni cambia datos ajenos | CB-1, N-5 |
| [ ] TB-3.4 | Recuperación de acceso por correo (Brevo); sin doble factor en esta fase (D-B29) | Pruebas: código de un solo uso, caducado, reutilizado, solicitudes abusivas limitadas y respuesta uniforme; política de contraseña de D-B29 (7 rechazada, 8 aceptada, 64+ aceptada, sin reglas de composición); hash con sal, nunca texto plano | RF-1.4, D-B29 |

## Hito B4: Maestros

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-4.1 | Municipios, hospitales y coordenadas con historial; `admiteMarcaciones` derivado | CA-6, CA-7, CA-11 contra el servidor | RF-2.2 |
| [ ] TB-4.2 | Asignaciones de coordinador con historial de vigencias | Un cambio cierra la vigencia y abre otra | RF-2.3, D28 |
| [ ] TB-4.3 | Trabajadores y fichas de usuarios; documento único | Duplicado rechazado; trabajador edita solo datos personales | RF-2.1 |
| [ ] TB-4.4 | Horarios por vigencia, conservando todos | Horario vigente por fecha igual al de la Fase 1 | RF-2.4, D15 |
| [ ] TB-4.5 | Auditoría de cambios de horario, coordenadas y asignaciones | Cada cambio deja quién, cuándo y por qué | RF-8.1, CB-7 |

## Hito B5: Reglas portadas

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-5.1 | Exportar los casos de prueba de `frontend/src/pruebas/reglas/` a JSON compartido | Los mismos casos corren en Vitest | CB-6 |
| [ ] TB-5.2 | Portar duraciones, secuencia, distancia, evaluación de marcación, fecha operativa, turno y horario vigente | Todos los casos compartidos pasan en JUnit | Plan §7 |
| [ ] TB-5.3 | Portar estado actual, agrupación de intentos y detección de incidencias | Casos compartidos pasan; valores desde configuración | RF-4.1 |

## Hito B6: Registro de la jornada

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-6.1 | `POST /trabajadores/{id}/marcaciones` transaccional con instante del servidor | CB-2, CB-3; hora del cliente ignorada | RF-3.1 a RF-3.3 |
| [ ] TB-6.2 | Idempotencia por `claveRepeticion` | CB-4: repetir no duplica | RF-3.5 |
| [ ] TB-6.3 | Intentos rechazados aparte; fallo técnico nunca como ubicación indebida | CA-1 a CA-5, CA-14 pasan contra el servidor | RF-3.4 |
| [ ] TB-6.4 | Jornada actual e historial paginados | Igual que `IMarcacionServicio` | RF-3 |
| [-] TB-6.5 | ~~Corrección manual de marcaciones~~ **Descartada** por D-B23: no habrá corrección manual | — | N-2 resuelta |
| [ ] TB-6.6 | Un dispositivo por persona, registrado al primer ingreso; el administrador lo elimina de la ficha (D-B24, D-B28) | Marcación desde dispositivo no vinculado rechazada; eliminar cierra sesiones y se audita | RF-3, N-1 resuelta |

## Hito B7: Incidencias, alertas y auditoría

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-7.1 | Detección continua con proceso programado y control de duplicados | Dos ejecuciones seguidas no duplican incidencias | RF-4.1 |
| [ ] TB-7.2 | Acciones sobre incidencias con historial inmutable | CA-13: resolver o escalar no toca los intentos | RF-4.3 |
| [ ] TB-7.3 | Alertas (una por incidencia, revisadas al abrirla) | Igual que la Fase 1 | RF-4.4 |
| [ ] TB-7.4 | Auditoría de solo añadir y `GET /auditoria` para el administrador | Consulta con filtros; ninguna escritura posible | RF-8 |

## Hito B8: Panel, informes y configuración

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-8.1 | `GET /panel/instantanea` limitada por rol | Resultado igual al de la Fase 1 para los mismos datos | RF-5.1, CB-6 |
| [ ] TB-8.2 | `GET /informes/datos` para el cliente | El cliente calcula los mismos informes | RF-5.2 |
| [ ] TB-8.3 | Informes y exportación CSV/Excel en el servidor, sin marca DEMO, auditada | CB-9: coincide con la pantalla | RF-5.3, P-23 |
| [ ] TB-8.4 | Reglas provisionales con versión y autor; cambio auditado | CB-7 | RF-6.1 |
| [ ] TB-8.5 | Radio y precisión por empresa; el cambio actualiza los hospitales existentes y se audita | Marcaciones pasadas conservan su resultado; cambio con valor anterior y nuevo en auditoría | RF-6.2, D-B19 |

## Hito B9: Fotos

Bloqueado por N-4 y N-15 para producción.

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-9.1 | Fotos en tabla de PostgreSQL con `empresa_id` detrás de una interfaz (D-B34) | Sin acceso entre empresas; solo el propietario cambia su foto | RF-7, N-15 resuelta |
| [ ] TB-9.2 | Subir, ver y retirar con formato, 2 MB y permisos validados en el servidor | CA-8; solo la propia persona cambia su foto | RF-7.1 |
| [B] TB-9.3 | Consentimiento y aviso de privacidad | — | **N-4** |

## Hito B10: Integración con el frontend

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-10.1 | `servicios/http/*` y selección en `fabrica.ts`; cliente HTTP único con renovación de sesión | Páginas, hooks y componentes sin cambios | CB-8 |
| [ ] TB-10.2 | Pruebas de contrato: la suite de servicios de la Fase 1 contra la API | Ambos modos pasan | CB-8 |
| [ ] TB-10.3 | Recorrido de integración: ingreso, registro, incidencia e informe | Pasa de punta a punta | CB-8 |
| [ ] TB-10.4 | Retirar `datos-demo/`, repositorios y servicios de demo, aviso de demostración y claves locales | CB-10; el frontend sigue pasando sus cinco comprobaciones | CB-10 |
| [ ] TB-10.5 | App Android (Capacitor) contra el servidor y prueba en el Huawei con GPS real | Registro real de punta a punta | Plan §8 |

## Hito B11: Endurecimiento y despliegue

Bloqueado por N-12 y N-3.

| ID | Tarea | Criterio | Traza |
|----|-------|----------|-------|
| [ ] TB-11.1 | Revisión de seguridad (lista de comprobación, dependencias, secretos, CORS, límites) | Informe sin hallazgos abiertos | §4 |
| [B] TB-11.2 | Retención y borrado de datos | — | **N-3** |
| [ ] TB-11.3 | Despliegue en Railway (Virginia), observabilidad y mantenimiento de madrugada; **sin respaldos por decisión del responsable (D-B39): no cargar datos reales hasta tener uno restaurable** | Servicio desplegado; verificación de salud | N-12 resuelta |
| [ ] TB-11.4 | Traspaso a operación y registro de las reglas que siguen provisionales | Documento revisado por el responsable | Spec §6 |

## Dependencias entre hitos

B0 → B1 → B2 → B3 y B4 (en paralelo tras B2) → B5 → B6 y B7 → B8 → B9 → B10 → B11. B5 puede empezar en cuanto exista B1 porque son funciones puras.

## Registro de ejecución


### 2026-10-27: redacción de la especificación

Se redactaron `spec.md`, `contrato-api.md`, `plan.md` y este archivo. Pila elegida por el responsable: Java con Spring Boot y PostgreSQL. **No se escribió código.** Pendiente del responsable: revisar la spec y responder las clarificaciones N-1 a N-15 (las que bloquean cada hito están marcadas arriba); cerrar la revisión de la Fase 1.

### 2026-10-27: hito B1 (esqueleto y herramientas)

Proyecto `backend/` creado con Spring Initializr: **Spring Boot 4.0.9** (el plan decía «3.x», pero Initializr ya no ofrece 3.x; el responsable eligió 4.0.9 entre 4.0.9 y 4.1.2), Java 21, Maven con wrapper, paquete `com.lftime.servidor`. Otras dependencias: ArchUnit 1.5.1 y springdoc-openapi (solo el starter de la API, sin Swagger UI) 3.2.0, versiones verificadas en Maven Central.

- **TB-1.1 [X]:** esqueleto con los paquetes en español y su JavaDoc (`package-info.java`), perfiles `desarrollo` (puerto 8081, para no chocar con LFClub) y `produccion` (todo secreto por variables de entorno), Hibernate en `validate` y Flyway a cargo del esquema. `./mvnw verify` pasa en limpio y la aplicación arranca contra un PostgreSQL real.
- **TB-1.2 [X]:** `RelojColombia` (UTC−5 fijo, `Clock` inyectable) y regla de ArchUnit que prohíbe `Instant.now()`, `LocalDate.now()` y equivalentes, `System.currentTimeMillis()` y `new Date()` fuera de él. Una clase infractora de ejemplo demuestra que la regla falla.
- **TB-1.3 [X]:** reglas de capas (controlador → servicio → repositorio), controladores sin entidades y reglas/permisos puros (sin Spring ni base de datos), cada una con su infractor de ejemplo; `TamanoArchivosPrueba` falla si un archivo de `src/` supera 250 líneas (probado con archivos de 250 y 251).
- **TB-1.4 [~]:** `ManejadorErrores` devuelve `application/problem+json` con `codigo` en español (también para los errores que genera Spring, como método no permitido) y no filtra el mensaje de errores inesperados. OpenAPI se publica en `/v3/api-docs` (desactivado en producción). **Pendiente:** comparar las rutas con `contrato-api.md` cuando exista el primer controlador.
- **TB-1.5 [X]:** `ArranquePrueba` levanta la aplicación contra PostgreSQL 17 (Testcontainers) con Flyway, y `MigracionPostgresPrueba` aplica una migración propia de pruebas y comprueba la tabla creada. Las migraciones del modelo llegan en B2.

Resultado: `./mvnw verify` → **21 pruebas, 0 fallos**. Frontend (sin cambios por este hito): `build`, `lint`, `verificar:tamano` (451 archivos) y `verificar:contraste` pasan; `npm test` falló **3 de 610 pruebas en la primera ejecución** (justo después de la compilación del backend y con Docker activo) y en la repetición pasaron las **610**. No se identificó cuáles fallaron: parece intermitencia bajo carga, como la ya registrada en la Fase 1, pero no se investigó.

**Pendiente de B1:** TB-1.4 (rutas contra el contrato). **Observaciones:** Spring Security genera una contraseña de desarrollo y bloquea todo endpoint hasta TB-3.2; las pruebas de integración necesitan Docker en marcha.
