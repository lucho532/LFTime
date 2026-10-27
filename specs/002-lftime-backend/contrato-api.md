# Contrato de la API (borrador): LFTime Fase 2

**Estado:** APROBADO por el responsable el 2026-10-27 **con los pendientes anotados** (el borrado total de empresa y la eliminación de cuenta dependen de la validación legal, N-3). Antes era BORRADOR v2, al día con D-B1 a D-B36 de `spec.md` §6.1 (multiempresa, invitaciones, dispositivo, borrado de cuenta). Deriva de las interfaces `servicios/I*.ts` de la Fase 1: cada operación del frontend tiene su equivalente HTTP, de modo que `servicios/http/*` pueda sustituir a `servicios/demo/*` sin tocar páginas, hooks ni componentes (constitución R-4). No define la base de datos. Todo marcado *(provisional)* depende de un pendiente de negocio.

## Convenciones

- Prefijo `/api/v1`, JSON en UTF-8. Los cuerpos y respuestas siguen los DTO de `contratos-preliminares.md` (mismos nombres, en español).
- **Autenticación:** `Authorization: Bearer <token de acceso>`. El actor **y la empresa** de cada operación **salen del token** (nunca de un parámetro ni del cuerpo; D-B2); los parámetros `usuarioId` / `actorId` de los servicios de la Fase 1 **desaparecen** de la API.
- **Fechas y horas:** `fechaOperativa` `AAAA-MM-DD` y horas programadas `HH:mm` en hora de Colombia; instantes en ISO 8601 UTC (R-9). **El instante de una marcación no lo envía el cliente.**
- **Errores:** `application/problem+json` (RFC 9457) con `codigo` en mayúsculas y español (`NO_AUTENTICADO`, `SIN_PERMISO`, `NO_ENCONTRADO`, `VALIDACION`, `CONFLICTO`, `SECUENCIA_INVALIDA`, …) y un `detalle` legible. Un rechazo de marcación **no es un error HTTP**: se devuelve `200` con el resultado, como `ResultadoRegistro` (ver §4).
- **Listas:** paginadas (`pagina`, `tamano`, `orden`) cuando puedan crecer; la interfaz de la Fase 1 hoy lee todo y el adaptador HTTP puede encadenar páginas.
- **Idempotencia:** el registro de una marcación lleva `claveRepeticion` (UUID generado por el cliente por intento) para que un reintento no duplique.
- **Inmutabilidad (R-10):** no existe `PUT`/`DELETE` sobre marcaciones, intentos, historiales ni auditoría.
- **Quién (provisional):** la columna se lee como «roles que pueden llamar, además de las comprobaciones de pertenencia» (un trabajador solo lo suyo; un coordinador lo de sus hospitales). La matriz se aprobó en D-B12 a D-B18: todos los administradores tienen los mismos permisos; el desarrollador solo opera `/plataforma/**`. Todo se limita a la empresa del token.

## 1. Sesión y cuentas (`ISesionServicio`, `IRecuperacionAccesoServicio`)

| Método y ruta | Equivale a | Quién | Notas |
|---------------|-----------|-------|-------|
| `POST /auth/ingreso` | `iniciarSesion` | pública | `{identificador, contrasena, dispositivoId, tipoDispositivo}` → `{tokenAcceso, tokenRefresco, usuario, empresas[]}`. Con una sola empresa entra directo; con varias, la persona elige (siguiente fila). Límite de intentos. Sin doble factor (D-B29). Tras demasiados intentos: `429 DEMASIADAS_SOLICITUDES` con `Retry-After`. Un `MOVIL` sin dispositivo registrado devuelve `requiereAdvertenciaDispositivo` y no registra hasta que `confirmarDispositivo` sea `true` (D-B31) |
| `POST /auth/empresa` | (nuevo) | sesión | `{empresaId}`; cambia la empresa activa y emite tokens nuevos (D-B30) |
| `POST /auth/refresco` | (nuevo) | sesión | Rota el token de refresco |
| `POST /auth/salida` | `cerrarSesion` | sesión | Invalida la sesión en el servidor |
| `GET /auth/yo` | `obtenerUsuarioActual` | sesión | `UsuarioDto` |
| `POST /auth/recuperacion` | `solicitarEnlace` | pública | `{correo}`; respuesta siempre igual (no revela si existe). Limitada por cuenta y origen: `429 DEMASIADAS_SOLICITUDES` (D-B29) |
| `POST /auth/recuperacion/restablecer` | `restablecerContrasena` | pública | `{codigo, nuevaContrasena}`; el código caduca y es de un solo uso; contraseña de 8 a 128 caracteres como mínimo y máximo permitidos, sin reglas de composición (D-B29). Limitada por intentos; `429 DEMASIADAS_SOLICITUDES` con `Retry-After` |
| `GET /auth/invitaciones/{token}` | (nuevo) | pública | Empresa, rol y estado; `410` si caducó (72 h) o fue revocada |
| `POST /auth/invitaciones/{token}/aceptar` | (nuevo) | pública | `{nombre, contrasena?, aceptaAvisoPrivacidad: true, versionAviso}`; crea la cuenta o suma una membresía si el correo ya existe (D-B30); guarda la aceptación (D-B26) |

## 1.1 Plataforma (rol desarrollador, D-B1, D-B6)

Solo el desarrollador. **No** da acceso a marcaciones, ubicaciones ni fotos. Todo se audita en `auditoria_plataforma`.

| Método y ruta | Notas |
|---------------|-------|
| `GET /plataforma/empresas`, `POST /plataforma/empresas` | `{nombre, correoAdministrador}`: crea la empresa e invita al primer administrador |
| `POST /plataforma/empresas/{id}/suspension` | Suspende y **cierra todas sus sesiones de inmediato** (D-B10) |
| `POST /plataforma/empresas/{id}/reactivacion` | Reactiva |
| `DELETE /plataforma/empresas/{id}` | Borrado manual. Exige `{confirmacionNombre}` igual al nombre de la empresa. **Borrado total** de la empresa y sus registros de jornada (D-B37); auditoría de plataforma sin datos personales. Pendiente la validación legal del plazo (N-3) antes de producción |

## 1.2 Invitaciones, roles y dispositivo (administrador)

| Método y ruta | Notas |
|---------------|-------|
| `POST /invitaciones` | `{correo, rol}` (trabajador, coordinador o administrador); caduca en 72 h; envía correo por Brevo |
| `GET /invitaciones` | Estado de cada una |
| `POST /invitaciones/{id}/reenvio` | Invalida el enlace anterior y reinicia las 72 h |
| `POST /invitaciones/{id}/revocacion` | Deja de funcionar de inmediato; queda en el historial |
| `PATCH /membresias/{id}/rol` | `{rol, motivo?}`; auditado. `CONFLICTO` si deja a la empresa sin administrador (D-B18) |
| `DELETE /membresias/{id}/dispositivo` | Elimina el dispositivo registrado y cierra sus sesiones; auditado (D-B28). Un administrador sin dispositivo lo recupera por su correo (D-B32) |
| `DELETE /cuentas/yo/membresia`, `DELETE /membresias/{id}` | Eliminar cuenta y datos, por la persona o por el administrador, para Google Play (D-B35). Suprime los datos personales y anonimiza los registros de jornada (D-B35). El último administrador no puede |

## 2. Maestros

| Método y ruta | Equivale a | Quién | Notas |
|---------------|-----------|-------|-------|
| `GET /usuarios`, `GET /usuarios/{id}` | `listar`, `obtenerPorId` | administrador; cada persona el suyo | |
| `PATCH /usuarios/{id}/datos-personales` | `actualizarDatosPersonales` | la propia persona; administrador | Documento único; auditado |
| `POST /usuarios` | (nuevo) | administrador | **Reemplazado por las invitaciones (§1.2)**: nadie crea cuentas con contraseña ajena |
| `GET /trabajadores`, `GET /trabajadores/{id}` | `listar`, `obtenerPorId` | admin y coordinador; el trabajador, la suya | |
| `POST /trabajadores`, `PUT /trabajadores/{id}` | `crear`, `actualizar` | admin y coordinador; el trabajador solo datos personales | Hospital y estado: solo quien gestiona personal |
| `GET /municipios` | `listarMunicipios` | sesión | |
| `GET /hospitales`, `GET /hospitales/{id}` | `listar`, `obtenerPorId` | admin y coordinador | `admiteMarcaciones` derivado (D25) |
| `POST /hospitales`, `PUT /hospitales/{id}` | `crear`, `actualizar` | coordinador y admin | |
| `PUT /hospitales/{id}/coordenadas` | `confirmarCoordenadas` | coordinador y admin | Dos orígenes (D22); añade al historial |
| `POST /hospitales/{id}/asignaciones-coordinador` | `asignarCoordinador` | administrador | Un hospital admite **varios** coordinadores responsables, cada uno con su vigencia (D-B14). Retirar a uno cierra solo su vigencia |
| `GET /horarios?trabajadorId=` | `listarTodos`, `listarPorTrabajador` | admin y coordinador; el trabajador, el suyo | |
| `GET /trabajadores/{id}/horario-vigente?fecha=` | `obtenerVigente` | idem | |
| `POST /trabajadores/{id}/horarios` | `asignar` | coordinador | Todos se conservan (D15); auditado |

## 3. Fotos (`IFotoServicio`)

Las fotos se guardan en PostgreSQL (D-B34). Coordinador y administrador **siempre** las ven; solo el propietario las cambia (D-B17).

| Método y ruta | Equivale a | Quién | Notas |
|---------------|-----------|-------|-------|
| `PUT /usuarios/{id}/foto`, `PUT /trabajadores/{id}/foto` | `guardar` | solo la propia persona | `multipart`; formato y 2 MB validados en el servidor |
| `GET /usuarios/{id}/foto`, `GET /trabajadores/{id}/foto` | `obtenerUrl` | la propia persona; coordinador y administrador de la empresa | Devuelve el archivo con autorización en cada petición; sin URL pública |
| `DELETE /usuarios/{id}/foto`, `DELETE /trabajadores/{id}/foto` | `retirar` | solo la propia persona | No borra el historial de asistencia |

## 4. Jornada y marcaciones (`IMarcacionServicio`)

| Método y ruta | Equivale a | Quién | Notas |
|---------------|-----------|-------|-------|
| `GET /trabajadores/{id}/jornada-actual` | `obtenerJornadaActual` | el trabajador, la suya; admin y coordinador | Fecha operativa de «ahora» según el servidor |
| `GET /trabajadores/{id}/marcaciones?pagina=` | `listarHistorial` (marcaciones) | idem | Más recientes primero |
| `GET /trabajadores/{id}/intentos?pagina=` | `listarHistorial` (intentos) | idem | Aparte de las marcaciones (CA-5) |
| `POST /trabajadores/{id}/marcaciones` | `registrar` | **solo el propio trabajador, desde su dispositivo móvil registrado** | Cuerpo abajo. Desde un computador o un dispositivo no registrado: `SIN_PERMISO` con `codigo` `DISPOSITIVO_NO_REGISTRADO` (D-B28, D-B31) |

**`POST /trabajadores/{id}/marcaciones`**

```json
{
  "tipo": "ENTRADA",
  "claveRepeticion": "7f1c…",
  "ubicacion": { "latitud": 5.0678, "longitud": -75.4902, "precisionMetros": 9 },
  "falloTecnico": null
}
```

Se envía `ubicacion` **o** `falloTecnico` (`PERMISO_DENEGADO`, `PERMISO_BLOQUEADO`, `UBICACION_NO_DISPONIBLE`, `TIEMPO_AGOTADO`, `CONTEXTO_NO_SEGURO`); nunca ninguno ni ambos. Respuesta `200` con el mismo `ResultadoRegistro` de `modelos/jornada.ts`:

- `REGISTRADA` con la `MarcacionDto`;
- `RECHAZADA` con el `IntentoMarcacionDto` y `abrioIncidencia`;
- `SECUENCIA_INVALIDA` con el motivo;
- `HOSPITAL_SIN_COORDENADAS`.

Repetir la misma `claveRepeticion` devuelve el resultado original sin crear otra marcación. El servidor ignora cualquier hora del cliente.

## 5. Incidencias y alertas (`IIncidenciaServicio`, `IAlertaServicio`)

`sincronizar()` **desaparece**: la detección es un proceso continuo del servidor (RF-4.1).

| Método y ruta | Equivale a | Quién | Notas |
|---------------|-----------|-------|-------|
| `GET /incidencias` | `listar` | admin; coordinador de sus hospitales; el trabajador, las suyas | Filtros por estado, hospital, fecha |
| `GET /incidencias/{id}` | `obtenerPorId` | idem | |
| `GET /incidencias/{id}/intentos` | `listarIntentos` | idem | |
| `POST /incidencias/{id}/justificaciones` | `justificar` | trabajador, revisor y admin | `{texto, motivo?}`; devuelve a «En revisión» *(provisional)* |
| `POST /incidencias/{id}/revision` | `iniciarRevision` | revisor y admin | |
| `POST /incidencias/{id}/resolucion` | `resolver` | revisor y admin | `{resolucion, motivo}`; motivo obligatorio *(provisional)* |
| `POST /incidencias/{id}/reapertura` | `reabrir` | revisor y admin | `{motivo}` |
| `POST /incidencias/{id}/escalada` | `escalar` | revisor | `{motivo}` obligatorio (D29) |
| `POST /incidencias/{id}/revisor` | `asignarRevisor` | administrador | `{coordinadorId, motivo?}`. Con varios responsables por hospital (D-B14), cualquiera de ellos revisa y resuelve (D-B16); quien actúa queda en el historial |
| `GET /alertas` | `listar` | admin y coordinador | El trabajador no ve alertas (P-19) |
| `POST /incidencias/{id}/alerta/revisada` | `marcarRevisadaDeIncidencia` | revisor y admin | Al abrir la incidencia |

Cada acción **añade** una entrada de historial con quién, cuándo y por qué; las respuestas devuelven la `IncidenciaDto` actualizada.

## 6. Panel, informes y configuración (`IPanelServicio`, `IInformeServicio`, `IConfiguracionServicio`)

| Método y ruta | Equivale a | Quién | Notas |
|---------------|-----------|-------|-------|
| `GET /panel/instantanea` | `obtenerInstantanea` | admin y coordinador | Limitada a sus hospitales (coordinador) |
| `GET /informes/datos?desde=&hasta=&…` | `obtenerDatos` | admin y coordinador | Datos en bruto del periodo (hasta 92 días, *provisional*), para que el cliente los calcule con `reglas/informes` mientras no se porten |
| `GET /informes/{tipo}?desde=&hasta=&formato=json\|csv\|xlsx` | (nuevo) | admin y coordinador | Informe calculado por el servidor y exportación sin marca DEMO (P-23); **auditada** |
| `GET /configuracion/reglas` | `obtenerReglas` | sesión | Lectura para calcular estados en pantalla |
| `PUT /configuracion/reglas` | `guardarReglas` | administrador | **Por empresa**; incluye radio y precisión, que actualizan los hospitales existentes sin tocar marcaciones ya evaluadas (D-B19). **Auditado con su autor** (RF-6.1) |
| `POST /configuracion/reglas/restablecer` | `restablecerReglas` | administrador | Auditado |

`tipo`: `ASISTENCIA_DIARIA`, `HORAS_POR_TRABAJADOR`, `INCIDENCIAS`, `INTENTOS_RECHAZADOS`, `CUMPLIMIENTO_POR_HOSPITAL`, `ACUMULADO_MENSUAL`, `TIEMPO_DEBIDO`.

## 7. Auditoría (nuevo)

| Método y ruta | Quién | Notas |
|---------------|-------|-------|
| `GET /auditoria?entidad=&usuarioId=&desde=&hasta=&pagina=` | administrador | Solo lectura, de su empresa. `EntradaAuditoriaDto` |

## 8. Lo que ya no existe en la API

`IDatosDemoServicio` (estado y restablecer datos de demostración), la creación directa de cuentas (`POST /usuarios`) y el permiso `puedeVerFotos`, la sincronización de incidencias iniciada por la interfaz y cualquier `usuarioId` / `actorId` enviado por el cliente.
