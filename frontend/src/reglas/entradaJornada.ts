import type { ReglasProvisionalesDto } from '../contratos/configuracion'
import type { AsignacionHorarioDto } from '../contratos/horario'
import type { EstadoTrabajador } from '../contratos/trabajador'
import type { MarcacionBasica } from './duraciones'

const MILISEGUNDOS_POR_MINUTO = 60_000

/**
 * Todo lo que las reglas `estadoActual` y `detectarIncidencias` necesitan saber de una jornada.
 * Quien las llama (el servicio) reúne estos datos; las reglas no leen datos ni el reloj.
 */
export interface EntradaJornada {
  estadoTrabajador: EstadoTrabajador
  /** Horario vigente en la fecha operativa; `null` si el trabajador no tiene ninguno. */
  horario: AsignacionHorarioDto | null
  fechaOperativa: string
  /** Solo las marcaciones de esta jornada (mismo trabajador y fecha operativa). */
  marcaciones: MarcacionBasica[]
  /** Instante de evaluación (UTC), normalmente `obtenerAhoraUtc()`. */
  ahora: Date
  /** Tolerancias y umbrales provisionales vigentes (D37). */
  reglas: ReglasProvisionalesDto
  /** Falso si el hospital no tiene coordenadas confirmadas: nadie puede marcar y no se evalúa (D25). */
  hospitalAdmiteMarcacion: boolean
}

/** Suma minutos a un instante sin modificarlo. */
export function sumarMinutosA(instante: Date, minutos: number): Date {
  return new Date(instante.getTime() + minutos * MILISEGUNDOS_POR_MINUTO)
}

/** Minutos (con decimales) entre dos instantes; negativo si `hasta` es anterior a `desde`. */
export function minutosEntreInstantes(desde: Date, hasta: Date): number {
  return (hasta.getTime() - desde.getTime()) / MILISEGUNDOS_POR_MINUTO
}
