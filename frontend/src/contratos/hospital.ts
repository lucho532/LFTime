/** Municipio de Colombia donde está un hospital. */
export interface MunicipioDto {
  id: string
  nombre: string
  departamento: string
}

/** Coordenadas de un hospital y su estado de confirmación (D22, D25). */
export interface CoordenadasHospitalDto {
  /** Entre -90 y 90. */
  latitud: number
  /** Entre -180 y 180. */
  longitud: number
  /** Si es falso, el hospital no admite marcaciones (D25). */
  confirmadas: boolean
  origen: 'MANUAL' | 'GPS_COORDINADOR'
  /** Precisión reportada, solo si el origen es GPS. */
  precisionMetros?: number
  confirmadoPorUsuarioId?: string
  confirmadoEn?: string
}

/**
 * Cambio de las coordenadas de un hospital: quién, cuándo y el valor anterior (D22). Solo se añade, nunca se edita.
 */
export interface CambioCoordenadasDto {
  id: string
  usuarioId: string
  /** Instante real en ISO 8601 UTC. */
  instante: string
  /** Coordenadas que había antes; `null` si es la primera vez que se confirman. */
  anterior: CoordenadasHospitalDto | null
  nueva: CoordenadasHospitalDto
}

/**
 * Coordinador responsable principal de un hospital durante un periodo (D28).
 * Nunca se sobrescribe: un cambio cierra la vigencia anterior y abre otra.
 */
export interface AsignacionCoordinadorDto {
  id: string
  hospitalId: string
  coordinadorId: string
  /** Fecha `AAAA-MM-DD` desde la que rige. */
  vigenteDesde: string
  /** Fecha `AAAA-MM-DD` hasta la que rigió; vacío si sigue vigente. */
  vigenteHasta?: string
  /** Administrador autorizado que hizo la asignación. */
  asignadoPorUsuarioId: string
  motivo?: string
}

/**
 * Contrato de intercambio de un hospital (centro de trabajo).
 *
 * Un hospital sin asignación vigente deja sus incidencias pendientes de asignación (D28).
 * No contiene personal ni marcaciones.
 */
export interface HospitalDto {
  id: string
  nombre: string
  municipioId: string
  /** Dirección escrita; no se convierte en coordenadas (D18). */
  direccion: string
  coordenadas: CoordenadasHospitalDto | null
  /** Historial inmutable de confirmaciones y cambios de coordenadas, del más antiguo al más reciente. */
  historialCoordenadas: CambioCoordenadasDto[]
  /** Provisional (D19): 100 m. */
  radioPermitidoMetros: number
  /** Provisional (D19): 25 m. */
  precisionMaximaMetros: number
  asignacionesCoordinador: AsignacionCoordinadorDto[]
}
