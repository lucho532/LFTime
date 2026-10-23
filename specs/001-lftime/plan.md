# Plan técnico: LFTime, Fase 1 (frontend con datos de demostración)

**Estado:** BORRADOR para revisión. Depende de `spec.md` v3 y `constitution.md`.
**Aviso:** la spec **no está libre de bloqueantes**. Este plan cubre los pendientes de negocio únicamente con **supuestos provisionales y configurables** (§13). Ninguno es una regla laboral definitiva y ninguno implementa sanciones automáticas. **El responsable aceptó estos supuestos el 2026-10-23 (D37) con esa condición**; los pendientes de negocio siguen abiertos (`spec.md` §0.4).
**Alcance:** exclusivamente frontend. Sin backend, base de datos ni servicios externos (mapas, geocodificación, correo, etc.).

Trazabilidad: requisito → `spec.md` → este plan → `tasks.md` (aún no existe) → código → prueba (constitución R-13).

---

## 1. Principios de diseño del plan

1. Separar interfaz, datos de demostración y contratos para que el backend los sustituya sin rehacer pantallas (constitución R-4).
2. Toda regla de negocio no aprobada vive en `reglas/` y en `configuracion`, marcada como provisional y editable; las pantallas nunca la tienen incrustada.
3. Componentes reutilizables y pequeños; tablas, tarjetas, formularios, insignias de estado y estados vacío/carga/error se construyen una vez.
4. La demo declara en pantalla que es una demo (§9) y no aparenta verificación real.
5. Solo se agrega una dependencia cuando hay una necesidad concreta (§3).

## 2. Reglas aplicables

Todo el código sigue las reglas R-1 a R-15 de `constitution.md` (español, JSDoc, 250 líneas, capas, CSS separado, hora de Colombia, histórico inmutable, GPS obligatorio, definición de terminado).

## 3. Pila tecnológica y justificación

| Elemento | Decisión | Justificación |
|----------|----------|---------------|
| Marco | React + TypeScript (Vite) | Igual que LFMova y LFClub; permite reutilizar disciplina y contratos tipados |
| Enrutado | `react-router-dom` | Navegación entre módulos y rutas protegidas por rol; no se puede resolver bien sin enrutador |
| Estado | `useState` / `useContext` / hooks propios | Suficiente; sin librerías de estado (R-5) |
| Estilos | CSS plano por componente/página + tokens en `index.css` | R-6; sin librerías de UI ni CSS-in-JS |
| Pruebas | Vitest + Testing Library | Cálculos y detección verificables (spec §10); es el estándar de Vite |
| Excel | **ExcelJS** (`exceljs`), cargado con `import()` dinámico solo al exportar | D9, D34. Comprobado en el registro de npm (2026-10-23): versión 4.4.0, sin restricción de Node (`>=8.3.0`), con campo `browser` (`dist/exceljs.min.js`). Pesa mucho (≈22 MB sin comprimir), por eso se carga bajo demanda. Su funcionamiento con Vite se comprueba con una prueba de humo en la tarea T-1.5 antes de depender de él. CSV se genera sin librería |
| Compresión de foto | API `canvas` del navegador (`createImageBitmap`) | Sin dependencia (D24). El motor es inyectable para poder probar el algoritmo sin navegador |
| Pruebas de IndexedDB | `fake-indexeddb` 6.2.5 (solo desarrollo) | Necesaria para probar de verdad el almacén de fotos (D35), que no existe en jsdom. Sin dependencias propias; se fijó la 6.2.5 (nov. 2025) y no la 6.2.6, publicada una semana antes, por prudencia. `npm audit` no añade hallazgos |
| Mapa | SVG propio en el proyecto | D18: sin servicios externos de mapas |
| Geolocalización | `navigator.geolocation` | D13: real, no simulada; requiere `localhost` o HTTPS |
| Iconos | SVG propios en `componentes/iconos` | Sin librería de iconos hasta que haya necesidad |

Versiones candidatas consultadas en el registro de npm el 2026-10-23 (Node local: 22.14.0, npm 10.9.2): `vite` 8.3.5 (requiere Node `^20.19 || >=22.12`), `vitest` 5.0.5 (admite `vite` `^6.4 || ^7 || ^8`; requiere Node `^22.12`), `react` 19.3.1, `react-router-dom` 7.18.4, `typescript` 7.0.2, `@vitejs/plugin-react` 6.1.2 (requiere `vite` `^8`), `exceljs` 4.4.0. **Son candidatas, no verificadas con una instalación real**: las versiones definitivas se fijan y prueban en la tarea T-1.1 y se registran en `package.json`.

## 4. Estructura de carpetas

```text
frontend/
├── index.html
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx                       # enrutado y proveedores
    ├── componentes/
    │   ├── base/                     # Boton, Campo, Tabla, Paginacion, Insignia, Tarjeta, Modal, Aviso...
    │   ├── estados/                  # EstadoCarga, EstadoError, EstadoVacio, Confirmacion
    │   ├── disposicion/              # BarraLateral, BarraSuperior, MenuPerfil, AvisoModoDemo
    │   ├── panel/                    # TarjetaIndicador, TablaPersonalEnVivo, ListaAlertas, ResumenHospital...
    │   ├── personal/  hospitales/  jornadas/  marcacion/  incidencias/  reportes/  configuracion/
    │   ├── mapa/                     # MapaEsquematico, MarcadorHospital
    │   └── iconos/
    ├── paginas/                      # una página por ruta; solo componen componentes y hooks
    ├── hooks/                        # useSesion, useTablaPaginada, useUbicacion, usePersonalEnVivo...
    ├── servicios/                    # interfaces (I...Servicio) y fábrica que entrega la implementación
    │   └── demo/                     # implementaciones de demostración (almacenamiento local)
    ├── repositorios/
    │   └── demo/                     # persistencia local: lectura/escritura versionada
    ├── reglas/                       # funciones puras, provisionales: duraciones, estados, detección, distancia
    ├── validadores/                  # latitud/longitud, horarios, foto, cédula, formularios
    ├── mapeadores/                   # modelo interno ↔ contrato (DTO)
    ├── contratos/                    # tipos de intercambio (ver contratos-preliminares.md)
    ├── modelos/                      # tipos internos de interfaz
    ├── configuracion/                # valores provisionales y editables (§13)
    ├── datos-demo/                   # semillas separadas por entidad (<= 250 líneas cada una)
    ├── utilidades/                   # horaColombia, formato, exportación, compresión de foto
    └── estilos/
        ├── index.css                 # reinicio, tokens, elementos raíz
        ├── App.css
        ├── componentes/              # un CSS por componente
        └── paginas/                  # un CSS por página
    └── pruebas/                      # espejo de reglas/, validadores/, servicios/
```

Los nombres en español se mantienen (R-1). `frontend/` no contiene nada de backend.

## 5. Capas y flujo de datos

```text
Página → Componentes → Hook → I...Servicio → ...ServicioDemo → ...RepositorioDemo → almacenamiento local
                                   │
                                   └── reglas/ (funciones puras) y validadores/
```

- Un **servicio** expone operaciones en lenguaje del dominio (`obtenerPersonalEnVivo`, `registrarMarcacion`, `resolverIncidencia`). La implementación de demo se intercambia en un único punto (`servicios/fabrica.ts`) por una implementación HTTP en la Fase 2, sin tocar páginas.
- Los **repositorios de demo** solo leen y escriben el almacenamiento local; no deciden reglas.
- Las **reglas** (cómputo de duraciones, estado actual del trabajador, detección de incidencias, distancia al hospital) reciben datos y configuración, y devuelven resultados; no acceden a almacenamiento ni a la interfaz.
- Los **mapeadores** convierten entre el modelo interno y los contratos para que el cambio a HTTP no afecte a los componentes.

## 6. Datos de demostración y almacenamiento local (D9)

- Semillas en `datos-demo/`, una por entidad (trabajadores, hospitales, horarios, marcaciones, intentos, incidencias, usuarios de prueba). Generadas **relativas al día actual de Colombia** al inicializar, para que el panel tenga vida; ver escenarios en `spec.md` §9.
- Almacenamiento: `localStorage` con prefijo `lftime.demo.` y **versión de esquema**. Si la versión cambia, se ofrece restablecer. Acceso solo desde `repositorios/demo`, siempre dentro de `try/catch` (puede estar bloqueado o lleno).
- **Fotos (D35):** se guardan en `IndexedDB` detrás de la interfaz `IAlmacenFotos`; el resto de la demo, en `localStorage`. Límites: 2 MB por foto tras comprimir y un máximo total de fotos configurable (valor a fijar en la tarea correspondiente). Se tratan los errores: base no disponible o bloqueada, cuota excedida, escritura fallida; ante cualquiera la app funciona con el avatar por defecto y muestra un mensaje comprensible. «Restablecer datos de demostración» borra también las fotos.
- **Aviso de modo demo** permanente (`AvisoModoDemo`) con botón «Restablecer datos de demostración». Nunca se presenta como guardado real.

## 7. Autenticación simulada y roles (D9)

- `useSesion` + `SesionContexto`. La pantalla de ingreso lista los usuarios de prueba (uno por rol, más un administrador con y sin permiso de fotos). No hay contraseñas reales ni se almacena nada sensible.
- `RutaProtegida` oculta pantallas y acciones por rol según la matriz provisional (§13, P-21). **Esto es solo visual y no representa seguridad real (D27)**: la autorización real corresponde al backend (reglas LFMova §13). La interfaz muestra un aviso fijo («Control de acceso solo visual en la demo») y el traspaso a la Fase 2 lo repite. La bandera de permiso de fotos de los administradores (D30) es una propiedad del usuario de prueba, sin gestión de consentimientos.
- Cada usuario de prueba tiene: id, rol, trabajador asociado (si aplica), hospitales/zona de responsabilidad (coordinadores) y banderas de permiso explícito (ver fotos).

## 8. Geolocalización y marcación (D13, D19, D23, D25, D26)

Flujo de la pantalla de registro del trabajador (móvil):

1. Carga la jornada del día y calcula el **evento siguiente permitido** (reglas de secuencia). Solo se ofrece la acción coherente.
2. Comprueba que el **hospital asignado tiene coordenadas confirmadas**. Si no: pantalla explicativa y no se ofrece marcar (D25).
3. Al pulsar «Marcar»: `useUbicacion` consulta permiso, solicita la posición con `navigator.geolocation` (con tiempo límite) y entrega `{ latitud, longitud, precision }` o un **motivo técnico** tipificado (`PERMISO_DENEGADO`, `PERMISO_BLOQUEADO`, `UBICACION_NO_DISPONIBLE`, `TIEMPO_AGOTADO`, `PRECISION_INSUFICIENTE`, `CONTEXTO_NO_SEGURO`).
4. `reglas/evaluarMarcacion` decide: precisión ≤ 25 m y distancia ≤ 100 m (valores provisionales de `configuracion`).
   - **Válida** → se registra la `Marcacion`.
   - **Ubicación válida fuera del radio** → `IntentoMarcacion` (tipo `FUERA_DE_RADIO`) + alta o ampliación de la incidencia agrupada.
   - **Fallo técnico** → `IntentoMarcacion` (tipo `FALLO_TECNICO`) sin incidencia de ubicación indebida.
5. Los intentos **no tocan** las duraciones ni la secuencia (CA-3). Con permiso bloqueado se muestran instrucciones para habilitarlo (D13).
6. Aviso visible: *«Ubicación capturada en el dispositivo. La validación real la realizará el servidor en la versión definitiva»* (D13, CA-10).

Distancia: fórmula de Haversine en `reglas/distanciaGeografica`, con pruebas. Un equipo sin GPS puede dar precisión baja y no poder marcar (se informa).

## 9. Mapa esquemático (D18, D22)

`MapaEsquematico` dibuja en SVG un mapa estilizado de Colombia/región con un marcador por hospital proyectado de latitud/longitud a coordenadas del lienzo (proyección lineal simple sobre la caja de límites de los hospitales). Es **ilustrativo**: no es cartografía ni se obtiene de ningún servicio. Muestra nombre y municipio, estado de coordenadas (confirmadas / pendientes) y enlace a la ficha. Los hospitales sin coordenadas aparecen en una lista lateral, no en el mapa.

Formulario de coordenadas (`FormularioCoordenadas`): modo manual (validación de rangos) y modo «Usar mi ubicación actual» (permiso → posición → muestra precisión → botón «Confirmar»). Se guarda además quién confirmó y cuándo, con historial.

## 10. Foto de perfil (D14, D20, D24)

`useFotoPerfil` + `utilidades/comprimirFoto`: acepta JPG/JPEG/PNG/WebP, si supera 2 MB reduce dimensiones y calidad con `canvas` hasta cumplir; si no lo logra o el formato es inválido, muestra un mensaje. `Avatar` muestra la foto o un avatar por defecto según el permiso del observador (propietario, coordinador autorizado, administrador con permiso explícito). Retirar la foto elimina solo la imagen. La app funciona igual sin foto.

## 11. Exportación (D9)

`utilidades/exportacion`: CSV sin dependencias; Excel con **ExcelJS**, aislada en esta capa detrás de una interfaz (`IExportadorExcel`) y cargada bajo demanda. Ningún otro módulo importa `exceljs`. Los archivos se generan en el navegador con datos de demostración y llevan la marca **DEMO en el nombre del archivo y en su encabezado**, tanto en CSV como en Excel (D36): nombre `DEMO_<informe>_<AAAAMMDD>.csv|xlsx`; primera fila con el texto «DEMO — datos de demostración, sin validez» y debajo las columnas (en Excel, esa fila va combinada sobre el ancho de la tabla). Columnas: ver `contratos-preliminares.md` §7 (provisionales, P-23).

## 12. Módulos y pantallas (trazabilidad a la spec)

| Módulo / ruta | Pantalla | HU | Roles (provisional) |
|---------------|----------|----|----------------------|
| `/inicio` | Panel de coordinación (según referencia) | HU-01 | Coordinador, Administrador |
| `/personal`, `/personal/:id` | Lista, ficha, alta/edición, foto | HU-02 | Coordinador, Administrador |
| `/hospitales`, `/hospitales/:id` | Lista, ficha, coordenadas, mapa | HU-03 | Coordinador, Administrador |
| `/jornadas` | Horarios y asignaciones | HU-04 | Coordinador (edita), Administrador (consulta) |
| `/registro` | Registro de jornada (móvil) y su historial | HU-05 | Trabajador |
| `/incidencias`, `/incidencias/:id` | Lista, detalle, intentos, justificación, resolución | HU-06 | Coordinador, Administrador; Trabajador solo las propias |
| `/alertas` (panel + campana) | Alertas | HU-07 | Coordinador, Administrador |
| `/reportes` | Informes con filtros y exportación | HU-08 | Coordinador, Administrador |
| `/configuracion` | Reglas provisionales, usuarios de prueba, restablecer demo | HU-09 | Administrador |
| `/ingreso` | Selección de usuario de prueba | D9 | Todos |

Catálogo de estados visibles (con texto, confirmado en D31): En jornada, En almuerzo, Retraso, Sin registrar, Ausencia aparente, Salida anticipada, Almuerzo prolongado, Incidencia, Finalizada, Inactivo/Licencia (según estado del trabajador).

**Tema (D32):** claro y oscuro, con preferencia guardada en el navegador y cambio desde el menú del perfil (y botón visible en pantallas sin menú). Se implementa **al final** (hito 12): desde el hito 1 todos los colores se declaran como variables de tema para no rehacer estilos, pero no se pule el tema oscuro antes de terminar las funcionalidades prioritarias.

## 13. Supuestos provisionales para los pendientes de negocio

**Todos son supuestos de demo, editables en `/configuracion`, almacenados en `configuracion/reglasProvisionales`, etiquetados «provisional» en la interfaz, sin valor laboral ni legal y sin efecto sancionatorio.** Se listan para que el responsable los confirme o reemplace.

| Pend. | Supuesto provisional | Dónde es configurable | Dependencias | Impacto en pantallas si cambia |
|-------|----------------------|------------------------|--------------|--------------------------------|
| P-01 | Tolerancia de **salida** = 0 min; tolerancia de **almuerzo** (sobre los 60 min autorizados) = 0 min. Valor global con soporte de sustitución por hospital. | `configuracion` global; el modelo admite valor por hospital | D1, D4 | Textos y umbrales en alertas, panel, incidencias; mínima si solo cambia el valor |
| P-02 | **Ausencia aparente**: 60 min sin entrada. **Salida sin registrar**: 60 min tras la hora de salida. **Regreso sin registrar**: 30 min tras el fin del almuerzo autorizado. | `configuracion` | P-01, D3 | Estados «Sin registrar»/«Ausencia» del panel y sus alertas |
| P-04 | **Fecha operativa** = fecha del inicio programado del turno. Un turno que cruza medianoche pertenece a la fecha en la que empieza. Los informes agrupan por fecha operativa. | `reglas/fechaOperativa` | D5, P-07 | Agrupación en informes, historial y agrupación de incidencias (D26) |
| P-06 | **Sin límite legal** de jornada en la demo; solo se compara con lo programado. El tiempo trabajado de más se muestra como diferencia positiva, **sin clasificarlo como hora extra** ni recargo. | `reglas/duraciones` | P-05 (L) | Tarjeta «Horas trabajadas hoy» e informes |
| P-07 | **Un turno por día y trabajador**; horario por día de la semana; cambios con fecha de vigencia y historial; sin plantillas ni aprobación (edita el coordinador, D15). **Un horario nuevo rige desde hoy o una fecha futura (el pasado no se reescribe), no repite la fecha de otro y el almuerzo debe caber en la jornada.** El modelo permite varios turnos sin cambiar pantallas. | `contratos` (`AsignacionHorario`) | P-04 | Pantalla de jornadas: sería necesario añadir turnos múltiples |
| P-16 | **Justifican** el trabajador (solo sobre sus incidencias) y el coordinador (en nombre del trabajador, con motivo). **Texto libre, sin adjuntos, sin plazo.** | `configuracion` (plazo desactivado) | D11 | Formulario de justificación; soportes añadirían carga de archivos |
| P-17 | Estados: **Pendiente, En revisión, Pendiente de información, Justificada, No justificada**. Resuelve el coordinador responsable (D26) o el administrador autorizado. **Reabrir**: lo permite el coordinador responsable o el administrador con motivo, dejando historial. | `contratos` (`EstadoIncidencia`) | P-28, P-29 | Filtros y acciones de la lista y del detalle |
| P-18 | **No justificada** solo queda registrada y visible en informes. **Sin sanción, sin reporte automático** a nadie, sin efecto sobre pagos o contratos. | `reglas/incidencias` | Constitución principio 8 | Ninguno; es el comportamiento por defecto |
| P-19 | **Toda incidencia detectada genera una alerta** en el panel. Las alertas **no se descartan**: se marcan «revisada» al abrir la incidencia. El trabajador ve solo sus incidencias, no las alertas. | `reglas/alertas` | D26 | Panel de alertas y campana |
| P-20 | Estados del trabajador: **Activo, Inactivo, Vacaciones, Incapacidad, Licencia**. Todos salvo «Activo» **suprimen** la detección y las alertas de ese trabajador. | `configuracion` | P-21 | Ficha, filtros del panel, informes (columna de estado) |
| P-21 | Matriz provisional de permisos (ver tabla siguiente). Solo oculta pantallas/acciones en la demo. | `configuracion/permisos` | D7, D15, D20, D24, D26 | Menús, acciones por pantalla |
| P-23 | Columnas provisionales por informe (`contratos-preliminares.md` §7), encabezado «DEMO», una hoja por informe. | `utilidades/exportacion` | P-03 (L), P-06 | Solo el contenido de los archivos |
| P-25 | El panel **recalcula con el reloj cada 60 s** y tiene botón «Actualizar». No hay datos en vivo reales. | `configuracion` (intervalo) | D9 | Botón y etiqueta «Última actualización» |
| P-28 | **Zona = conjunto de hospitales asignados a un coordinador** (D28). Un coordinador responsable principal por hospital. Solo un administrador autorizado cambia asignaciones, con **historial y vigencia**. **Sin responsable → incidencias «pendientes de asignación»**, visibles para el administrador. Todos los coordinadores **ven** todo (D7). | `contratos` (`Hospital.asignacionesCoordinador`) | D7, D26 | Ficha de hospital con historial de asignaciones, filtro «mis hospitales», bandeja «pendientes de asignación» del administrador |
| P-29 | **Escalar** = acción manual del coordinador con **motivo** (D29). El administrador interviene directamente si no hay coordinador asignado o si se requiere. **Toda resolución se audita** y los intentos originales se conservan. | `contratos` (`HistorialIncidencia`, `EntradaAuditoria`) | P-28 | Botón «Escalar» con motivo, vista de administrador, registro de auditoría |

Matriz provisional (P-21):

| Módulo / acción | Administrador | Coordinador | Trabajador |
|-----------------|:-:|:-:|:-:|
| Panel, alertas | ver | ver | no |
| Personal (alta, edición) | ver y editar | ver y editar | solo su ficha |
| Fotos de otros | solo con permiso explícito | ver (autorizado) | solo la propia |
| Hospitales y coordenadas | ver y **asignar coordinador responsable** (autorizado) | editar coordenadas | no |
| Horarios y almuerzo (D15) | ver | **editar** | ver el propio |
| Registro de marcaciones | no | no | **sí** |
| Incidencias: revisar y resolver | interviene; recibe las escaladas y las pendientes de asignación | **revisor principal** de sus hospitales; escala con motivo | ver y justificar las propias |
| Informes y exportaciones | ver | ver | no |
| Configuración y usuarios de prueba | **editar** | no | no |

## 14. Estrategia de pruebas

- **Unitarias (Vitest):** `reglas/duraciones` (efectivo, almuerzo, total, cómputo incompleto, cruce de medianoche), `reglas/secuencia` (secuencias inválidas y duplicados), `reglas/distanciaGeografica`, `reglas/evaluarMarcacion` (precisión, radio, fallo técnico), `reglas/detectarIncidencias`, `reglas/agruparIntentos`, `validadores/coordenadas`, `utilidades/horaColombia`, `utilidades/comprimirFoto` (límites).
- **De componentes:** estados de carga/error/vacío/confirmación, formulario de coordenadas (ambos modos), pantalla de registro con hospital sin coordenadas, lista de incidencias con intentos.
- **Criterios:** cada CA-1…CA-14 de la spec tiene al menos una prueba o una verificación manual documentada en `tasks.md`.
- **Verificación manual de GPS:** documentada, porque depende del dispositivo.

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Cuota de `localStorage` agotada por fotos | `IAlmacenFotos` sobre `IndexedDB`; compresión; mensaje claro si falla |
| `navigator.geolocation` exige contexto seguro | Documentar `localhost`/HTTPS; mensaje `CONTEXTO_NO_SEGURO` |
| Equipo de escritorio sin GPS: precisión > 25 m | Mensaje explicativo; documentado como limitación de la demo |
| Supuestos provisionales se confundan con reglas | Etiqueta «provisional» en UI y en informes; pantalla de configuración que los lista |
| Cambio de reglas obliga a rehacer pantallas | Reglas aisladas en `reglas/` y `configuracion`; modelo de datos con extensión (turnos, override por hospital) |
| Archivos > 250 líneas | Semillas y estilos divididos; revisión en cada tarea (R-3, R-12) |
| Dependencia de Excel | Aislada en `utilidades/exportacion` detrás de una interfaz |
| `npm audit`: 2 vulnerabilidades moderadas en `uuid` (<11.1.1) transitiva de `exceljs` 4.4.0; la única corrección propuesta baja a `exceljs` 3.4.0 | No se aplica. Riesgo bajo en la demo (solo navegador, datos ficticios, sin entrada externa). Reevaluar antes de la Fase 2 o si sale una versión corregida; decisión del responsable |

## 16. Hitos propuestos (para `tasks.md`)

1. **Andamiaje:** proyecto, estructura, tokens de tema, enrutado, utilidades de hora de Colombia, aviso de demo.
2. **Contratos, repositorios de demo, semillas y servicios** de personal, hospitales, horarios.
3. **Componentes base y estados** (tabla, paginación, insignias, formularios, vacío/carga/error).
4. **Ingreso simulado, disposición y navegación** (barra lateral, superior, rutas por rol).
5. **Hospitales, coordenadas y mapa esquemático.**
6. **Personal, horarios y fotos.**
7. **Reglas de jornada** (duraciones, secuencia, estados) con sus pruebas.
8. **Registro del trabajador y geolocalización** (marcaciones e intentos).
9. **Incidencias, justificación, resolución, escalada y alertas.**
10. **Panel de coordinación** (indicadores, tabla en vivo, resumen, horas, almuerzo).
11. **Informes y exportación CSV/Excel.**
12. **Configuración, pulido responsivo, accesibilidad, tema claro/oscuro (D32) y revisión de criterios CA-1…CA-14.**

No se empieza el hito 1 hasta que este plan y `analisis-coherencia.md` estén revisados.

## 17. Traspaso a la Fase 2

- El backend sustituye `servicios/demo` y `repositorios/demo` por llamadas HTTP respetando `contratos/`.
- La autorización, el cálculo definitivo, la validación de geolocalización y la auditoría pasan al servidor. Las reglas de `reglas/` sirven como especificación ejecutable y base de pruebas.
- Los supuestos provisionales (§13) se convierten en reglas definitivas o se descartan antes de arrancar la Fase 2.
