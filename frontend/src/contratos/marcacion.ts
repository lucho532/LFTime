/** Eventos de la jornada, en orden obligatorio. */
export type TipoMarcacion = 'ENTRADA' | 'SALIDA_ALMUERZO' | 'REGRESO_ALMUERZO' | 'SALIDA_FINAL'

/** Ubicación capturada del dispositivo. */
export interface UbicacionDto {
  latitud: number
  longitud: number
  precisionMetros: number
}

/**
 * Contrato de una marcación válida (D13).
 *
 * Solo existen marcaciones con ubicación válida: sin coordenadas no hay marcación.
 * Es inmutable (R-10); una corrección se registra como otra marcación con motivo.
 */
export interface MarcacionDto {
  id: string
  trabajadorId: string
  hospitalId: string
  tipo: TipoMarcacion
  /** Instante real en ISO 8601 UTC. */
  instante: string
  /** Fecha operativa `AAAA-MM-DD` en hora de Colombia. */
  fechaOperativa: string
  ubicacion: UbicacionDto
  distanciaAlHospitalMetros: number
  origen: 'TRABAJADOR' | 'CORRECCION'
  motivoCorreccion?: string
}

/** Motivo por el que se rechazó un intento de marcación. */
export type MotivoRechazo =
  | 'FUERA_DE_RADIO'
  | 'PERMISO_DENEGADO'
  | 'PERMISO_BLOQUEADO'
  | 'UBICACION_NO_DISPONIBLE'
  | 'TIEMPO_AGOTADO'
  | 'PRECISION_INSUFICIENTE'
  | 'CONTEXTO_NO_SEGURO'

/**
 * Contrato de un intento de marcación rechazado (D23, D26).
 *
 * Se guarda aparte de las marcaciones válidas y nunca modifica tiempos ni secuencia.
 * Un fallo técnico jamás se presenta como prueba de ubicación indebida.
 */
export interface IntentoMarcacionDto {
  id: string
  trabajadorId: string
  hospitalId: string
  tipo: TipoMarcacion
  instante: string
  fechaOperativa: string
  motivo: MotivoRechazo
  /** Verdadero para todos los motivos distintos de FUERA_DE_RADIO. */
  esFalloTecnico: boolean
  /** Solo si existe una ubicación obtenida. */
  ubicacion?: UbicacionDto
  distanciaAlHospitalMetros?: number
  /** Incidencia agrupada a la que pertenece; solo si el motivo es FUERA_DE_RADIO. */
  incidenciaId?: string
}
