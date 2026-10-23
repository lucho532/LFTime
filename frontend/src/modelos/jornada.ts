import type { AsignacionHorarioDto } from '../contratos/horario'
import type { IntentoMarcacionDto, MarcacionDto } from '../contratos/marcacion'
import type { MotivoSecuenciaInvalida } from '../reglas/secuencia'

/**
 * Lo registrado de un trabajador en una jornada: sus marcaciones válidas y, aparte, sus intentos
 * rechazados (CA-5). Es un modelo de interfaz; no contiene duraciones ni estados (los calculan las reglas).
 */
export interface JornadaDelDia {
  fechaOperativa: string
  /** Horario vigente en esa fecha; `null` si el trabajador no tiene ninguno. */
  horario: AsignacionHorarioDto | null
  marcaciones: MarcacionDto[]
  intentos: IntentoMarcacionDto[]
}

/** Historial propio de un trabajador: marcaciones e intentos, los más recientes primero. */
export interface HistorialMarcaciones {
  marcaciones: MarcacionDto[]
  intentos: IntentoMarcacionDto[]
}

/** Qué ocurrió al intentar registrar un evento de la jornada. */
export type ResultadoRegistro =
  | { resultado: 'REGISTRADA'; marcacion: MarcacionDto }
  /** Quedó guardado como intento rechazado; `abrioIncidencia` es verdadero solo si probó ubicación fuera del radio. */
  | { resultado: 'RECHAZADA'; intento: IntentoMarcacionDto; abrioIncidencia: boolean }
  | { resultado: 'SECUENCIA_INVALIDA'; motivo: MotivoSecuenciaInvalida }
  | { resultado: 'HOSPITAL_SIN_COORDENADAS' }
