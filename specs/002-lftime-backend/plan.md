# Plan técnico de la Fase 2: backend de LFTime

**Estado:** APROBADO por el responsable el 2026-10-27 **con los pendientes anotados** (no se aprobaron las decisiones técnicas marcadas **[DECISIÓN]** salvo la que se indica abajo; siguen abiertas: esquema de tokens, iteraciones de PBKDF2, mecanismo de limitación de intentos y de bloqueo del proceso programado). Antes era BORRADOR v2, puesto al día con las decisiones D-B1 a D-B36 de `spec.md` §6.1 (multiempresa, invitaciones, dispositivo, fotos en PostgreSQL, Railway). Por el flujo SDD, el plan solo se aprueba con la spec aprobada; siguen abiertos detalles de N-12 (disponibilidad, mantenimiento) y la validación legal de N-3, N-4 y N-19, además del conflicto del borrado inmediato con R-10 (D-B35). Este documento recoge la pila que el responsable eligió (**Java con Spring Boot y PostgreSQL**) y la propuesta de diseño; **nada de esto está aprobado todavía** y las versiones concretas se confirman al aprobar el plan (no se fijan de memoria).

Los términos marcados **[DECISIÓN]** son propuestas que el responsable debe confirmar.

## 1. Pila

| Pieza | Propuesta | Por qué |
|-------|-----------|---------|
| Lenguaje y plataforma | Java 21 (LTS); el equipo ya tiene JDK 21 instalado | Elegido por el responsable |
| Marco | **Spring Boot 4.0.9** (decidido el 2026-10-27; Initializr ya no ofrece 3.x) con Spring Web MVC, Validation y Security | Elegido por el responsable |
| Base de datos | PostgreSQL **[confirmar versión]** | Elegida por el responsable; transacciones, restricciones y permisos por tabla (inmutabilidad, §5) |
| Acceso a datos | Spring Data JPA con Hibernate **(confirmado por el responsable, 2026-10-27)** | Es el estándar de Spring; los repositorios solo persisten y consultan (R-4). Alternativa: JDBC con SQL explícito, más verboso pero más predecible |
| Migraciones | Flyway | Esquema versionado y repetible; las tablas de solo añadir se crean con sus permisos desde la migración |
| Construcción | Maven con wrapper (`./mvnw`) **(confirmado por el responsable, 2026-10-27)** | Convención más extendida con Spring; sin instalar nada aparte |
| Contrato | springdoc-openapi 3.2.0 (solo el starter de la API, sin Swagger UI, R-5), generando OpenAPI desde los controladores; desactivado en producción | El contrato verificable que consume el frontend |
| Pruebas | JUnit 5, Spring Security Test, Testcontainers (PostgreSQL 17 real) y ArchUnit 1.5.1. Las clases de prueba se nombran `<Tema>Prueba.java` y Surefire está configurado para ese sufijo | Pruebas de integración contra la base real; ArchUnit vigila las capas como `reglasDeCodigo.prueba.ts` en el frontend |
| Contraseñas | `Pbkdf2PasswordEncoder` de Spring Security (PBKDF2 con HMAC-SHA256), como en LFMova y LFClub (decidido por el responsable, 2026-10-27; reemplaza a BCrypt) | Nunca en claro; sin inventar criptografía; sin dependencias nuevas. Política de D-B29: mínimo 8, admite 64 o más (tope de 128 en el contrato), sin reglas de composición. Hash con sal propia por contraseña. El número de iteraciones **[DECISIÓN: fijar al aprobar el plan según la recomendación vigente de OWASP, que es mayor que las 100 000 de LFMova; medir el tiempo en Railway]**. PBKDF2 no tiene el límite de 72 bytes de BCrypt |
| Correo transaccional | Brevo (D-B7), detrás de la interfaz `IEnvioCorreoServicio` | Invitaciones y recuperación de acceso; el remitente y la clave de API son secretos de entorno (pendiente: dominio remitente verificado) |
| Alojamiento | Railway, backend y PostgreSQL administrado (D-B33) | Elegido por el responsable. Región actual: EE. UU. oeste; **los respaldos exigen el plan Pro** |

Cada dependencia se justifica aquí (R-5). No se agregan otras sin una necesidad concreta y su justificación escrita.

## 2. Estructura

Carpeta `backend/` (hermana de `frontend/`), un solo módulo Maven. **Nombres en español** (R-1; la excepción son los términos técnicos del ecosistema: `Controller`-como-anotación, `Repository`, paquetes de Spring, etc.). Paquete raíz `com.lftime.servidor` **(confirmado por el responsable, 2026-10-27)**:

```
backend/src/main/java/com/lftime/servidor/
  controladores/   Reciben HTTP, validan forma y llaman a un servicio. Sin reglas de negocio ni acceso a datos.
  servicios/       Interfaces I<Nombre>Servicio e implementaciones. Orquestan y aplican permisos.
  reglas/          Funciones puras (sin Spring ni reloj): duraciones, secuencia, distancia, estado, incidencias.
  permisos/        La matriz de autorización (puras): quién puede qué. Se prueba con la matriz completa.
  repositorios/    Persisten y consultan; no deciden reglas ni permisos.
  dominio/         Entidades de persistencia (no se exponen como contrato).
  dto/             Contratos públicos (los DTO de contratos-preliminares.md). Distintos de las entidades (R-4).
  mapeadores/      Entidad <-> DTO. Sin reglas.
  errores/         Códigos de error en español y la excepción de negocio.
  seguridad/       Autenticación, tokens, filtros y contexto de empresa (`empresa_id` de la sesión).
  configuracion/   Beans y propiedades (incluye el reloj).
  utilidades/      RelojColombia y utilidades pequeñas.
backend/src/main/resources/db/migracion/   Flyway V1__..., V2__...
backend/src/test/java/...                  Espejo de la estructura.
```

Flujo (el mismo de R-4 en el servidor): **Controlador → Servicio (interfaz) → Repositorio → base de datos**; las reglas y los permisos son funciones puras que los servicios invocan. Un controlador nunca llama a un repositorio.

**Reglas de código adaptadas a Java (propuesta, la constitución pide que todo cambio sea explícito):**
- R-1 y R-2: español en nombres y en JavaDoc; cada clase importante indica qué representa, su responsabilidad y qué **no** debe hacer.
- R-3: ningún archivo escrito a mano supera 250 líneas; `verificar-tamano` para `backend/` con el mismo criterio que el del frontend.
- R-6 no aplica. R-9 se adapta (§6). R-10 se refuerza en la base de datos (§5).

## 3. Modelo de datos (propuesta)

Tablas en español, claves `uuid` (confirmado por el responsable, 2026-10-27) (la Fase 1 usa ids de texto como `trab-001`). **Multiempresa (D-B2):** toda tabla de negocio lleva `empresa_id` (obligatorio) y está protegida con seguridad a nivel de fila (RLS); `empresas`, `cuentas` y las tablas de plataforma son las únicas sin él. Resumen:

| Tabla | Contenido | Escritura |
|-------|-----------|-----------|
| `empresas` | Empresa cliente, estado (activa, suspendida), aceptación de los términos de encargo | Plataforma (desarrollador) |
| `cuentas`, `credenciales` | Persona con correo único y hash de contraseña, **sin** `empresa_id` (una cuenta, varias empresas, D-B3); separadas para limitar el acceso al hash | Normal |
| `membresias` | Cuenta ↔ empresa con rol (administrador, coordinador, trabajador) y vínculo a la ficha; único por empresa. Siempre queda al menos un administrador (D-B18) | Normal, con auditoría |
| `invitaciones` | Correo, rol fijado, empresa, caducidad a 72 horas, estado (pendiente, aceptada, revocada, reemplazada); el reenvío invalida la anterior | Normal; el historial no se borra |
| `dispositivos` | Un teléfono por persona y empresa (D-B28, D-B31); solo el administrador lo elimina | Normal, con auditoría |
| `aceptaciones_privacidad` | Versión del aviso aceptada, cuenta, empresa, fecha (D-B26) | Solo añadir |
| `usuarios` | Ficha de la persona dentro de la empresa (datos personales) | Normal |
| `trabajadores`, `municipios`, `hospitales` | Maestros; el radio y la precisión son **por empresa** (D-B19), en `configuracion_reglas` | Normal, con auditoría |
| `historial_coordenadas`, `asignaciones_coordinador` | Cambios de coordenadas y vigencias de responsables; **varios por hospital** (D-B14) | **Solo añadir** (cierre de vigencia es una fila nueva) |
| `horarios` | Asignaciones de horario por vigencia | Solo añadir |
| `marcaciones` | Marcaciones válidas, con `instante` UTC del servidor, ubicación y `clave_repeticion` única | **Solo añadir** |
| `intentos_marcacion` | Intentos rechazados | **Solo añadir** |
| `incidencias`, `justificaciones`, `historial_incidencia`, `alertas` | Incidencias; el estado actual en `incidencias`, todo cambio en el historial | Estado: actualiza; historial y justificaciones: **solo añadir** |
| `configuracion_reglas` | Reglas provisionales con versión y autor | Solo añadir versiones |
| `fotos`, `fotos_archivo` | Metadatos y, en tabla aparte, el archivo (máx. 2 MB) (D-B34) | Normal |
| `auditoria` | Quién, cuándo, qué, por qué | **Solo añadir** |
| `sesiones`, `recuperaciones_acceso` | Tokens de refresco (con la empresa elegida, el dispositivo y el sello de seguridad) y códigos de un solo uso con caducidad | Normal |
| `auditoria_plataforma` | Acciones del desarrollador y bajas de empresas y cuentas, sin datos personales; **no pertenece a la empresa borrada** (D-B10, D-B35) | Solo añadir |

El modelo se confirma al aprobar la spec; los tipos exactos salen de `contratos-preliminares.md`.

## 4. Seguridad

- **Tokens [DECISIÓN]:** token de acceso de corta vida (JWT firmado) y token de refresco rotatorio guardado (hash) en `sesiones`; así sirven la web y la app Android (Capacitor), donde las cookies entre orígenes complican la sesión. Alternativa: sesión de servidor con cookie `HttpOnly`, más simple para la web pero menos cómoda en la app.
- **Autorización:** anotaciones de método más una clase de permisos pura por dominio, **portadas de `reglas/permisos*` del frontend** y probadas con la **matriz completa de roles y pertenencia** (CB-1). Un trabajador solo toca lo suyo; un coordinador, lo de sus hospitales.
- **Actor:** siempre el del token. Ningún cuerpo ni parámetro puede suplantarlo.
- **Contenido del token (D-B2):** el JWT lleva solo el identificador de la cuenta, la empresa activa, el rol, el sello de seguridad y la caducidad. **No lleva datos personales** (ni documento, ni nombre, ni correo): un JWT está firmado, no cifrado, y cualquiera que lo tenga puede leerlo. Inspirado en `GeneradorTokenJwt` de LFMova, que hoy incluye cédula y nombre y no se repite aquí.
- **Sello de seguridad (de `ValidadorSesion` de LFClub):** cada cuenta y membresía guarda un sello; el token lo lleva y **cada petición** lo compara con la base. Si no coincide o la cuenta ya no existe, la petición se rechaza (`NO_AUTENTICADO`). Cambiar la contraseña, suspender una empresa (D-B10), eliminar el dispositivo (D-B28), cambiar el rol o eliminar la cuenta cambia el sello y cierra las sesiones afectadas **al instante**, sin esperar a que caduque el token. Coste: una consulta por petición, que se acepta por la seguridad (se puede optimizar con caché de segundos si hiciera falta, midiéndolo antes).
- **Autorización por defecto:** todo endpoint exige sesión salvo los marcados explícitamente como anónimos (ingreso, recuperación, invitaciones); en Spring, `anyRequest().authenticated()`.
- **Emisor y audiencia:** hay un solo emisor; se valida firma y caducidad y se documenta que emisor y audiencia no se validan, como en LFClub, o se validan si se añade otro consumidor.
- **Ingreso:** límite de intentos **por cuenta y por IP** (el límite solo por IP, como en LFClub, no frena un ataque repartido contra una cuenta), y auditoría de fallos. Detrás del proxy de Railway la IP que ve la aplicación puede ser la del proxy: se configura el reenvío de cabeceras de confianza y se verifica con una prueba que el límite distingue orígenes reales. Sin doble factor en esta fase (D-B29). Contraseña según D-B29 (mínimo 8, sin reglas de composición). La limitación de intentos y las medidas contra ataques automatizados cubren **tanto el ingreso como la solicitud y el uso de la recuperación**; el código de recuperación es de un solo uso, caduca y las solicitudes se limitan por cuenta y por origen, con respuesta uniforme que no revela si el correo existe. El mecanismo concreto (por ejemplo, Bucket4j o un contador en la base) **[DECISIÓN: se justifica aquí antes de añadir cualquier dependencia, R-5]**.
- **Empresa y RLS (D-B2):** el token de acceso lleva `empresaId` (la elegida al ingresar, D-B30). Cada transacción fija `app.empresa_id` y las políticas RLS filtran por él; el rol con el que corre la aplicación **no** es dueño de las tablas ni tiene `BYPASSRLS`. La empresa nunca viene del cuerpo ni de parámetros. Se prueba que ninguna consulta cruza empresas.
- **Desarrollador (D-B6):** rol de plataforma con sus propios endpoints (`/plataforma/**`); las políticas RLS no le dan lectura de tablas de jornada, y se prueba.
- **Dispositivo (D-B28, D-B31, D-B36):** el cliente envía un `dispositivoId` y su tipo (`MOVIL` o `ESCRITORIO`). Solo `MOVIL` se registra y puede marcar; el primero queda vinculado a la persona y empresa. El tipo lo informa el cliente, así que **es un control contra descuido, no contra un ataque deliberado**; se documenta así.
- **Transporte y secretos:** solo HTTPS; secretos y claves por variables de entorno, nunca en el repositorio. CORS limitado a los orígenes de la web y de la app.
- **Entradas:** validación de forma en el controlador y de reglas en el servicio; consultas parametrizadas; límite de tamaño en cargas (fotos 2 MB).
- **Datos personales:** no se escriben cédula, ubicación ni tokens en los registros de diagnóstico.

## 5. Inmutabilidad (R-10, CB-5)

Las tablas de «solo añadir» se protegen **en la base de datos**: el rol con el que corre la aplicación solo tiene `INSERT` y `SELECT` sobre ellas (sin `UPDATE` ni `DELETE`), y un disparador rechaza cualquier modificación como segunda barrera. Una prueba de integración intenta modificar y borrar cada tabla y espera el rechazo. No habrá corrección manual de marcaciones (D-B23). **Excepción pendiente (D-B35):** el borrado inmediato de una cuenta o empresa no puede hacerlo el rol de la aplicación; sería una rutina de plataforma con un rol aparte y su propia auditoría. La constitución ya lo admite como **anonimización** (R-10, enmienda del 2026-10-27, opción B): una rutina de plataforma con un rol de base de datos aparte suprime los datos personales y desvincula los registros de jornada. Pendiente la validación legal antes de producción.

## 6. Hora (R-9 adaptada)

Una sola clase `RelojColombia` envuelve un `java.time.Clock` inyectable: es la **única** fuente de «ahora» y la única que conoce el desfase de Colombia (UTC−5 fijo, sin horario de verano). Las pruebas la sustituyen por un reloj fijo, como `establecerRelojParaPruebas` en el frontend. Nadie llama a `Instant.now()` ni `LocalDate.now()` fuera de ella (ArchUnit lo vigila). Los instantes se guardan en UTC (`timestamptz`); las fechas y horas programadas se guardan como las escribe el coordinador, en hora de Colombia, sin convertir.

## 7. Reglas de negocio en el servidor

- Se **portan** `duraciones`, `secuencia`, `distanciaGeografica`, `evaluarMarcacion`, `fechaOperativa`, `turnoProgramado`, `horarioVigente`, `estadoActual`, `agruparIntentos`, `detectarIncidencias` y los permisos como funciones puras. Siguen siendo **provisionales** y sus valores salen de `configuracion_reglas`.
- **Paridad (CB-6):** los casos de prueba de la Fase 1 (`frontend/src/pruebas/reglas/`, con valores calculados a mano o fijados) se exportan a archivos JSON de casos compartidos que corren **tanto en Vitest como en JUnit**. Así servidor y cliente no pueden divergir sin que una prueba falle.
- **Marcación:** transacción única que valida secuencia, hospital habilitado, precisión y distancia, asigna el instante del servidor, guarda marcación o intento y, si corresponde, abre o agrega a la incidencia (agrupada por trabajador, fecha operativa y hospital, D26; la puede resolver cualquiera de los coordinadores responsables del hospital, D-B16). La `claveRepeticion` es única: un reintento devuelve el resultado original.
- **Incidencias:** un proceso programado recorre periódicamente las jornadas y crea las que corresponden, con bloqueo para que dos instancias no dupliquen trabajo **[DECISIÓN: ShedLock o una restricción única en la base; se decide con N-12]**.
- **Informes:** primero `GET /informes/datos` entrega los datos y el cliente sigue calculando; después se portan los informes al servidor para exportar (RF-5.3). Así se puede integrar antes sin esperar el port completo.

## 8. Integración con el frontend

- Se añade `frontend/src/servicios/http/` con una implementación por cada interfaz `I*Servicio`, y `servicios/fabrica.ts` elige entre `demo` y `http` con una variable de entorno de compilación **[DECISIÓN]**. Páginas, hooks y componentes **no cambian** (CB-8).
- El cliente HTTP vive en un solo archivo, agrega el token, renueva con el refresco y traduce `problem+json` a los errores que ya entiende la interfaz. Las pruebas de arquitectura del frontend se actualizan: hoy prohíben `fetch` (CA-10); la excepción será ese cliente HTTP, y solo en modo `http`.
- La misma suite de pruebas de servicios de la Fase 1 se ejecuta contra la API (pruebas de contrato) para comprobar que ambos modos se comportan igual.
- Se retiran al final: `datos-demo/`, `repositorios/demo/`, `servicios/demo/`, `IDatosDemoServicio`, el aviso de modo demostración y las claves `lftime.demo.*` (CB-10). Mientras tanto la demostración sigue funcionando.
- La app Android (Capacitor) apunta a la URL del servidor configurada; la verificación en el Huawei forma parte del cierre. En iPhone se marca desde el navegador (D-B36).
- **Adaptación multiempresa del frontend (D-B8):** pantalla del desarrollador, registro por invitación con aviso de privacidad, selector de empresa, retirada de `puedeVerFotos`, varios responsables por hospital y gestión de dispositivo en la ficha. Cambia contratos guardados: sube la versión del esquema de la demo.

## 9. Pruebas y verificación

Comprobaciones que deben pasar antes de dar un hito por terminado (R-12):

```bash
./mvnw verify          # compila, pruebas unitarias y de integración (Testcontainers) y ArchUnit
verificar-tamano       # ningún archivo de backend/ supera 250 líneas
```

Además, las cinco del frontend siguen siendo obligatorias. Pruebas obligatorias: matriz de autorización, inmutabilidad, paridad de reglas, idempotencia y marcación contra la base real.

## 10. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Empezar con la Fase 1 sin cerrar (12 tareas `[~]`, traspaso en borrador) | Verificar en el teléfono lo pendiente en paralelo; el código del backend no avanza más allá de lo que desbloquean las clarificaciones |
| Que las reglas provisionales parezcan definitivas al estar «en producción» | Se mantienen rotuladas y configurables; se documenta en cada pantalla e informe; el responsable las aprueba una a una |
| Divergencia entre reglas del cliente y del servidor | Casos compartidos (§7) |
| Datos personales y ubicación sin base legal definida (N-3, N-4) | No pasar a producción sin esas decisiones; entornos de desarrollo con datos ficticios |
| Sin respaldos (D-B39, decisión del responsable) | Riesgo aceptado: sin datos reales de personal mientras no exista un respaldo restaurable |
| Datos en EE. UU. (región de Railway) | Validar con el asesor legal (Ley 1581, N-4) |
| Dispositivo en navegador de iPhone pierde su marca | Instalar como aplicación; el administrador puede reiniciar el registro (D-B28, D-B36) |
| Borrado inmediato frente a histórico inmutable | Anonimización en lugar de borrado (R-10 enmendada); validación legal antes de producción |
| `npm audit` (uuid en ExcelJS) | Con la exportación en el servidor, el cliente puede dejar de usar ExcelJS y el aviso desaparece **[decisión del responsable]** |
