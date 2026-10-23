# Contratos preliminares de datos: LFTime

**Estado:** PRELIMINAR. Son contratos de intercambio entre la interfaz y la fuente de datos (hoy de demostración, mañana la API). No definen base de datos ni endpoints. Los nombres siguen el vocabulario de la constitución. Todo valor marcado *(provisional)* depende de un pendiente de negocio.

Convenciones: ids como `string`; fechas programadas `FechaOperativa` como `AAAA-MM-DD` y horas programadas como `HH:mm` en **hora de Colombia**; instantes reales en ISO 8601 UTC (constitución R-9).

## 1. Usuario y sesión

```ts
type Rol = 'ADMINISTRADOR' | 'COORDINADOR' | 'TRABAJADOR';

interface UsuarioDto {
  id: string;
  nombres: string; apellidos: string;
  rol: Rol;
  trabajadorId?: string;                 // si el rol es TRABAJADOR
  hospitalesResponsable?: string[];      // coordinadores (P-28)
  puedeVerFotos?: boolean;               // administrador con permiso explícito (D24)
  urlFoto?: string | null;               // referencia, nunca un blob en el contrato
}
```

## 2. Trabajador

```ts
type EstadoTrabajador = 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'INCAPACIDAD' | 'LICENCIA'; // (provisional, P-20)

interface TrabajadorDto {
  id: string;
  nombres: string; apellidos: string;
  tipoDocumento: string; numeroDocumento: string;   // P-13: lista exacta pendiente
  cargo: string;
  telefono?: string;                                // solo si es estrictamente necesario
  hospitalId: string;
  estado: EstadoTrabajador;
  urlFoto?: string | null;
}
```

## 3. Hospital y municipio

```ts
interface HospitalDto {
  id: string;
  nombre: string;
  municipioId: string;
  direccion: string;                                // texto, D12/D18
  coordenadas: CoordenadasHospitalDto | null;
  radioPermitidoMetros: number;                     // 100 (provisional, D19)
  precisionMaximaMetros: number;                    // 25 (provisional, D19)
  asignacionesCoordinador: AsignacionCoordinadorDto[]; // historial de responsables (D28, provisional)
}

/** Coordinador responsable principal de un hospital durante un periodo. Nunca se sobrescribe: un cambio cierra la vigencia anterior y abre otra. */
interface AsignacionCoordinadorDto {
  id: string; hospitalId: string; coordinadorId: string;
  vigenteDesde: string;                             // AAAA-MM-DD
  vigenteHasta?: string;                            // vacío => vigente
  asignadoPorUsuarioId: string;                     // administrador autorizado
  motivo?: string;
}
// Un hospital sin asignación vigente => sus incidencias quedan PENDIENTE_ASIGNACION (D28)

interface CoordenadasHospitalDto {
  latitud: number;                                  // [-90, 90]
  longitud: number;                                 // [-180, 180]
  confirmadas: boolean;                             // D25: false => no admite marcaciones
  origen: 'MANUAL' | 'GPS_COORDINADOR';
  precisionMetros?: number;                         // solo si origen GPS
  confirmadoPorUsuarioId?: string; confirmadoEn?: string;
}

interface MunicipioDto { id: string; nombre: string; departamento: string; }
```

## 4. Horario (D15, P-07 provisional)

```ts
interface AsignacionHorarioDto {
  id: string; trabajadorId: string;
  vigenteDesde: string;                             // AAAA-MM-DD
  diasLaborables: number[];                         // 1..7
  horaEntrada: string; horaSalida: string;          // HH:mm; salida < entrada => cruza medianoche
  ventanaAlmuerzoDesde: string; ventanaAlmuerzoHasta: string;
  duracionAlmuerzoMinutos: number;                  // 60 (D4), configurable
  asignadoPorUsuarioId: string;
}
```

## 5. Marcación e intento

```ts
type TipoMarcacion = 'ENTRADA' | 'SALIDA_ALMUERZO' | 'REGRESO_ALMUERZO' | 'SALIDA_FINAL';

interface UbicacionDto { latitud: number; longitud: number; precisionMetros: number; }

interface MarcacionDto {                            // solo marcaciones válidas (D13)
  id: string; trabajadorId: string; hospitalId: string;
  tipo: TipoMarcacion;
  instante: string;                                 // ISO UTC
  fechaOperativa: string;
  ubicacion: UbicacionDto;                          // obligatoria
  distanciaAlHospitalMetros: number;
  origen: 'TRABAJADOR' | 'CORRECCION';              // corrección: requiere motivo y auditoría
  motivoCorreccion?: string;
}

type MotivoRechazo =
  | 'FUERA_DE_RADIO'                                // ubicación válida (D23, D26)
  | 'PERMISO_DENEGADO' | 'PERMISO_BLOQUEADO' | 'UBICACION_NO_DISPONIBLE'
  | 'TIEMPO_AGOTADO' | 'PRECISION_INSUFICIENTE' | 'CONTEXTO_NO_SEGURO'; // fallos técnicos

interface IntentoMarcacionDto {                     // colección separada (D23)
  id: string; trabajadorId: string; hospitalId: string;
  tipo: TipoMarcacion; instante: string; fechaOperativa: string;
  motivo: MotivoRechazo;
  esFalloTecnico: boolean;                          // true => nunca prueba de ubicación indebida
  ubicacion?: UbicacionDto;                         // solo si existe
  distanciaAlHospitalMetros?: number;
  incidenciaId?: string;                            // solo si motivo = FUERA_DE_RADIO
}
```

Los intentos no modifican duraciones ni secuencia (CA-3) y son inmutables (R-10).

## 6. Incidencia

```ts
type TipoIncidencia =
  | 'ENTRADA_TARDIA' | 'SIN_ENTRADA' | 'AUSENCIA_APARENTE' | 'SALIDA_ANTICIPADA'
  | 'SIN_SALIDA' | 'ALMUERZO_EXCEDIDO' | 'REGRESO_TARDIO' | 'TIEMPO_INFERIOR'
  | 'REGISTRO_INCOMPLETO' | 'UBICACION_NO_AUTORIZADA';

type EstadoIncidencia =                            // (provisional, P-17)
  'PENDIENTE' | 'EN_REVISION' | 'PENDIENTE_INFORMACION' | 'JUSTIFICADA' | 'NO_JUSTIFICADA';

interface IncidenciaDto {
  id: string; tipo: TipoIncidencia; estado: EstadoIncidencia;
  trabajadorId: string; hospitalId: string; fechaOperativa: string;
  detectadaEn: string;
  revisorPrincipalId?: string;                      // coordinador responsable vigente (D26, D28)
  asignacion: 'ASIGNADA' | 'PENDIENTE_ASIGNACION';  // sin responsable => visible al administrador (D28)
  escalada?: { motivo: string; escaladaPorId: string; escaladaEn: string }; // D29
  intentosIds?: string[];                           // solo UBICACION_NO_AUTORIZADA; agrupada (D26)
  justificaciones: JustificacionDto[];
  historial: HistorialIncidenciaDto[];              // inmutable
}

// Clave de agrupación de UBICACION_NO_AUTORIZADA: trabajadorId + fechaOperativa + hospitalId (D26)

interface JustificacionDto { id: string; autorId: string; texto: string; creadaEn: string; }

interface HistorialIncidenciaDto {
  id: string; accion: 'DETECTADA' | 'INTENTO_ANADIDO' | 'JUSTIFICADA' | 'REVISADA' | 'RESUELTA'
    | 'ESCALADA' | 'ASIGNADA' | 'REABIERTA' | 'CORREGIDA';
  usuarioId: string; instante: string; motivo?: string;
  estadoAnterior?: EstadoIncidencia; estadoNuevo?: EstadoIncidencia;
}
```

## 7. Alerta, jornada calculada, informes

```ts
interface AlertaDto { id: string; incidenciaId: string; creadaEn: string; revisada: boolean; }

interface JornadaCalculadaDto {                    // resultado de reglas/, no dato almacenado
  trabajadorId: string; fechaOperativa: string;
  programadaMinutos: number;
  efectivoMinutos: number | null;                   // null => incompleto (no se estima)
  almuerzoMinutos: number | null;
  totalMinutos: number | null;
  completa: boolean;
  estadoActual: string;                              // texto del catálogo de estados
}
```

**Columnas provisionales de exportación (P-23):**

| Informe | Columnas |
|---------|----------|
| Asistencia diaria | Fecha operativa, Trabajador, Documento, Hospital, Municipio, Entrada, Salida almuerzo, Regreso almuerzo, Salida final, Estado |
| Horas por trabajador | Trabajador, Periodo, Horas programadas, Tiempo efectivo, Tiempo de almuerzo, Tiempo total, Diferencia, Cómputo completo (Sí/No) |
| Incidencias | Id, Tipo, Estado, Trabajador, Hospital, Fecha operativa, Detectada, Revisor, Resolución, Nº de intentos |
| Intentos rechazados | Fecha y hora, Trabajador, Hospital, Tipo de evento, Motivo, Fallo técnico (Sí/No), Distancia, Precisión, Incidencia |
| Cumplimiento por hospital | Hospital, Municipio, Periodo, Jornadas programadas, Jornadas con entrada, Retrasos, Salidas anticipadas, Incidencias pendientes, Incidencias resueltas *(las dos últimas se separaron en el hito 11)* |

Todos los archivos de la demo, **CSV y Excel**, llevan la marca **DEMO en el nombre y en el encabezado** (D36): nombre `DEMO_<informe>_<AAAAMMDD>.csv|xlsx`; primera fila «DEMO — datos de demostración, sin validez» y debajo los nombres de columna. En CSV esa primera fila es una línea de texto; las herramientas que esperen cabecera en la primera línea deben saltarla (decisión de formato provisional).

## 8. Configuración provisional

```ts
interface ReglasProvisionalesDto {
  toleranciaEntradaMinutos: number;     // 0   (D1, cerrada)
  toleranciaSalidaMinutos: number;      // 0   (P-01 provisional)
  toleranciaAlmuerzoMinutos: number;    // 0   (P-01 provisional)
  umbralAusenciaMinutos: number;        // 60  (P-02 provisional)
  umbralSalidaSinRegistrarMinutos: number;   // 60 (P-02)
  umbralRegresoSinRegistrarMinutos: number;  // 30 (P-02)
  radioPermitidoMetros: number;         // 100 (D19 provisional)
  precisionMaximaMetros: number;        // 25  (D19 provisional)
  intervaloActualizacionSegundos: number;    // 60 (P-25)
}
```

## 9. Auditoría

```ts
interface EntradaAuditoriaDto {
  id: string; usuarioId: string; instante: string;
  accion: string; entidad: string; entidadId: string; motivo?: string;
}
```
Se registran: cambios de horario, de coordenadas, correcciones de marcación, resoluciones y escaladas.
