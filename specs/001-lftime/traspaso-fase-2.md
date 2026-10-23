# Traspaso a la Fase 2 (T-12.6)

Fecha: 2026-10-23. Estado: **borrador para revisión del responsable**. La Fase 2 no se empieza hasta terminar y revisar la Fase 1 (ver `matriz-verificacion.md` para lo que sigue sin verificar).

## 1. Qué entrega la Fase 1

Un frontend (React + TypeScript + Vite) que funciona **solo con datos de demostración** guardados en el navegador (`localStorage` e `IndexedDB` para las fotos). No hay backend, base de datos ni servicios externos. Todo lo que parece «guardado» vive solo en ese navegador, el ingreso es simulado y el control de acceso por rol es solo visual.

## 2. Qué debe hacer el backend (sustituciones)

| En la Fase 1 | En la Fase 2 |
|--------------|--------------|
| `servicios/demo/*` y `repositorios/demo/*` (los elige `servicios/fabrica.ts`) | Llamadas HTTP que respetan `contratos/`. Es el único punto que cambia: páginas, hooks y componentes no se tocan |
| Ingreso simulado con usuarios de prueba (`datos-demo/usuarios.ts`, sin contraseñas) | Autenticación real, cuentas, recuperación de acceso y doble factor (P-24, HU-09) |
| Permisos solo visuales (`reglas/permisosRuta`, `permisosIncidencia`, `permisosPersonal`, `permisosHospital`, `permisoFoto`) | **Autorización en el servidor** con la matriz validada (P-21, P-28). Las reglas de la Fase 1 sirven de especificación ejecutable y de pruebas |
| Validación de la marcación en el navegador (`reglas/evaluarMarcacion`) | El servidor valida la ubicación y el instante (P-10, P-11). **La ubicación del dispositivo solo es «capturada»**, nunca «verificada» |
| Detección de incidencias cuando alguien abre una pantalla (`sincronizarIncidencias`) | Proceso continuo en el servidor |
| Hora del navegador (`utilidades/horaColombia`) | Hora del servidor como origen oficial; los instantes siguen en UTC y la presentación en hora de Colombia (R-9) |
| Auditoría en el almacenamiento local (`registrarAuditoria`) | Auditoría inmutable del servidor (quién, cuándo, por qué). Hoy **no hay pantalla para consultarla** |
| Archivos exportados en el navegador con marca DEMO | Exportación del servidor con formato definitivo (P-23); se retira la marca DEMO |
| `datos-demo/`, `IDatosDemoServicio`, aviso de modo demostración | Se eliminan junto con la demostración |

Los contratos de datos están en `contratos-preliminares.md` y en `frontend/src/contratos/`. Son **preliminares**: la Fase 2 puede ampliarlos. Si se cambia la forma de un contrato guardado en la demo hay que subir la versión del esquema (`repositorios/demo/inicializacionDemo.ts`).

## 3. Reglas provisionales que deben validarse (no son reglas laborales)

Cada una vive en `reglas/` como función pura con sus valores en `configuracion` (editables en `/configuracion`). **Ninguna genera sanciones** y todas se rotulan «provisional».

| Regla (dónde) | Supuesto actual | Pendiente |
|---------------|-----------------|-----------|
| Tolerancias de entrada (D1: 0), salida y almuerzo (`estadoActual`, `detectarIncidencias`) | 0 minutos | P-01 |
| Umbrales de ausencia aparente y de «sin registrar» (`estadoActual`) | 60, 60 y 30 minutos | P-02 |
| Fecha operativa y turnos que cruzan la medianoche (`fechaOperativa`, `turnoProgramado`) | La fecha operativa es la del inicio del turno | P-04 |
| Jornada máxima y tiempo de más | Sin límite aplicado | P-06 |
| Un turno por día, plantillas y cambios (`horarioVigente`) | Gana el horario con vigencia más reciente | P-07 |
| Radio y precisión del GPS (`evaluarMarcacion`) | 100 m y 25 m; se copian al hospital al crearlo y **editar la configuración no cambia los hospitales existentes** (decisión a tomar) | P-08, D19 |
| Estados y resolución de incidencias (`permisosIncidencia`) | Motivo obligatorio en toda resolución; el administrador interviene en cualquiera; otro coordinador ve pero no actúa; una justificación devuelve a «En revisión» | P-16 a P-19, P-29 |
| Alertas | Una por incidencia, se revisan al abrir la incidencia, sin correos ni mensajes | P-19 |
| Estados del trabajador (`calcularEstadoActual`) | Un trabajador no activo no genera incidencias; quien entra tarde no se muestra como «Retraso» sino «En jornada» | P-20 y la definición del hito 7 |
| Indicadores del panel (`indicadoresPanel`) | Definiciones de «con retraso», «sin entrada» y «esperado hoy» (ver registro del hito 10) | P-01, P-02 |
| Informes (`reglas/informes`) | Efectivo, almuerzo y total solo de jornadas completas; programadas de todos los días laborables; estados con la hora actual | P-03, P-05, P-06, P-23 |
| Refresco del panel | 60 s | P-25 |

## 4. Pendientes de negocio que bloquean (siguen abiertos)

- **P-03** tratamiento laboral del almuerzo y **P-05** festivos, dominicales, recargos y horas extra (**legales**): la demo muestra los tiempos separados y no decide nada.
- **P-11** suplantación de identidad al marcar (la demo usa sesión simulada).
- **P-12** quién crea o corrige marcaciones a mano: **T-9.7 está bloqueada** y no hay ninguna corrección implementada.
- **P-15** conservación de registros, intentos y ubicación (**legal**).
- **P-13** consentimiento y permisos de la foto y los datos personales (**legal**; el comportamiento de la foto está cerrado, D24).
- La **validación definitiva** de todos los supuestos de la sección anterior y de la matriz de permisos (P-21).

## 5. Datos personales y consentimientos

- La cédula, el cargo, el teléfono y la foto de perfil son datos personales (P-13). En la demo son ficticios.
- La **ubicación** se captura en cada marcación, con consentimiento del navegador; hay que definir su conservación (P-15) y el aviso de privacidad antes de producción.
- La foto es de cada persona y solo la ven quienes tienen permiso (D24, D30); antes de producción hay que validarlo legalmente.
- No se guardan contraseñas ni datos financieros.

## 6. Deuda técnica y decisiones del responsable

- **`npm audit`**: 2 avisos moderados en `uuid` por `exceljs` 4.4.0. La única corrección propuesta rebaja ExcelJS a una versión incompatible y no se aplicó (`plan.md` §15). Reevaluar antes de la Fase 2.
- ExcelJS pesa ~930 kB (256 kB comprimido) y se descarga solo al exportar a Excel.
- Pequeñas fugas de capa conocidas (sin efecto funcional): `hooks/useFotoPerfil` y `utilidades/mensajesFoto` importan un tipo de error de `repositorios/demo`, y `ProveedorSesion` usa `servicios/fabrica` directamente. Al pasar a HTTP conviene mover ese tipo de error a `contratos/` o `modelos/`.
- Una auditoría de cambios de configuración (`guardarReglas`) no se registra: no recibe el usuario.
- Sin pantalla de auditoría, sin historial de jornadas por trabajador en informes y sin notificaciones externas.

## 7. Cómo verificar antes de arrancar la Fase 2

1. Completar la lista de «Qué falta» de `matriz-verificacion.md` (GPS real, foto real, descarga real, móvil y tableta, pestaña de red).
2. Revisar los registros de ejecución de `tasks.md` (decisiones «a confirmar» de cada hito).
3. Ejecutar las cinco comprobaciones: `npm run build`, `npm test`, `npm run lint`, `npm run verificar:tamano` y `npm run verificar:contraste`.
