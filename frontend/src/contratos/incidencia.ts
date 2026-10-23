/** Tipos de incidencia (spec HU-06). */
export type TipoIncidencia =
  | 'ENTRADA_TARDIA'
  | 'SIN_ENTRADA'
  | 'AUSENCIA_APARENTE'
  | 'SALIDA_ANTICIPADA'
  | 'SIN_SALIDA'
  | 'ALMUERZO_EXCEDIDO'
  | 'REGRESO_TARDIO'
  | 'TIEMPO_INFERIOR'
  | 'REGISTRO_INCOMPLETO'
  | 'UBICACION_NO_AUTORIZADA'

/** Estados de una incidencia (P-17, provisional). Ninguno implica una sanción. */
export type EstadoIncidencia =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'PENDIENTE_INFORMACION'
  | 'JUSTIFICADA'
  | 'NO_JUSTIFICADA'

/** Explicación aportada sobre una incidencia (P-16, provisional: texto sin adjuntos). */
export interface JustificacionDto {
  id: string
  autorId: string
  texto: string
  creadaEn: string
}

/** Acciones que quedan en el historial inmutable de una incidencia. */
export type AccionHistorialIncidencia =
  | 'DETECTADA'
  | 'INTENTO_ANADIDO'
  | 'JUSTIFICADA'
  | 'REVISADA'
  | 'RESUELTA'
  | 'ESCALADA'
  | 'ASIGNADA'
  | 'REABIERTA'
  | 'CORREGIDA'

/** Entrada del historial de una incidencia: quién, cuándo, qué y por qué. Solo se añade, nunca se edita. */
export interface HistorialIncidenciaDto {
  id: string
  accion: AccionHistorialIncidencia
  usuarioId: string
  instante: string
  motivo?: string
  estadoAnterior?: EstadoIncidencia
  estadoNuevo?: EstadoIncidencia
}

/**
 * Contrato de una incidencia detectada.
 *
 * Una anomalía sujeta a revisión humana; nunca una sanción. La de ubicación no autorizada se
 * agrupa por trabajador + fecha operativa + hospital (D26) y lista todos sus intentos.
 */
export interface IncidenciaDto {
  id: string
  tipo: TipoIncidencia
  estado: EstadoIncidencia
  trabajadorId: string
  hospitalId: string
  fechaOperativa: string
  detectadaEn: string
  /** Coordinador responsable vigente (D26, D28). */
  revisorPrincipalId?: string
  /** Sin responsable queda pendiente de asignación y visible para el administrador (D28). */
  asignacion: 'ASIGNADA' | 'PENDIENTE_ASIGNACION'
  escalada?: { motivo: string; escaladaPorId: string; escaladaEn: string }
  /** Solo para UBICACION_NO_AUTORIZADA. */
  intentosIds?: string[]
  justificaciones: JustificacionDto[]
  historial: HistorialIncidenciaDto[]
}
