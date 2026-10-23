import type { AsignacionCoordinadorDto, CambioCoordenadasDto, CoordenadasHospitalDto } from '../contratos/hospital'

/**
 * Modelo interno de un hospital para la interfaz.
 *
 * Añade al contrato datos derivados: si las coordenadas están confirmadas, si admite
 * marcaciones (D25) y quién es su coordinador responsable vigente (D28).
 * No se envía a la API: para eso existe `HospitalDto`.
 */
export interface Hospital {
  id: string
  nombre: string
  municipioId: string
  direccion: string
  coordenadas: CoordenadasHospitalDto | null
  historialCoordenadas: CambioCoordenadasDto[]
  coordenadasConfirmadas: boolean
  /** Falso si las coordenadas no están válidas y confirmadas (D25). */
  admiteMarcaciones: boolean
  radioPermitidoMetros: number
  precisionMaximaMetros: number
  asignacionesCoordinador: AsignacionCoordinadorDto[]
  /** Coordinador con asignación vigente en la fecha de referencia; nulo si no tiene (D28). */
  coordinadorResponsableId: string | null
}

/** Datos editables de un hospital en el formulario de alta y edición. */
export interface DatosHospital {
  nombre: string
  municipioId: string
  /** Dirección escrita; no se convierte en coordenadas (D18). */
  direccion: string
}

/** Coordenadas que entrega el formulario antes de confirmarlas (D22). */
export interface EntradaCoordenadas {
  latitud: number
  longitud: number
  origen: 'MANUAL' | 'GPS_COORDINADOR'
  /** Precisión reportada; solo si el origen es GPS. */
  precisionMetros?: number
}
