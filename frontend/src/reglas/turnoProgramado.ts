import type { AsignacionHorarioDto } from '../contratos/horario'
import { aInstanteUtc, descomponerEnColombia } from '../utilidades/horaColombia'
import { minutosEntre } from '../utilidades/horas'

const MILISEGUNDOS_POR_MINUTO = 60_000

/** Turno programado de un trabajador en una fecha operativa, con sus instantes reales (UTC). */
export interface TurnoProgramado {
  inicio: Date
  /** Si la salida es menor que la entrada, cae en el día siguiente (D5). */
  fin: Date
  /** Duración del almuerzo autorizado, en minutos. */
  almuerzoAutorizadoMinutos: number
  /** Minutos programados de trabajo efectivo: duración del turno menos el almuerzo autorizado. */
  efectivoProgramadoMinutos: number
}

/**
 * Convierte el horario vigente y una fecha operativa (`AAAA-MM-DD`) en los instantes del turno.
 * Una entrada y una salida iguales se interpretan como un turno de 24 horas.
 *
 * Regla provisional (P-04, P-07): la fecha operativa es la fecha en que empieza el turno.
 * No decide si el día es laborable (ver `esDiaLaborable`) ni lee marcaciones.
 */
export function resolverTurno(horario: AsignacionHorarioDto, fechaOperativa: string): TurnoProgramado {
  const inicio = aInstanteUtc(fechaOperativa, horario.horaEntrada)
  const duracion = minutosEntre(horario.horaEntrada, horario.horaSalida) || 1440
  return {
    inicio,
    fin: new Date(inicio.getTime() + duracion * MILISEGUNDOS_POR_MINUTO),
    almuerzoAutorizadoMinutos: horario.duracionAlmuerzoMinutos,
    efectivoProgramadoMinutos: Math.max(0, duracion - horario.duracionAlmuerzoMinutos),
  }
}

/** Indica si el día de la semana de una fecha `AAAA-MM-DD` está entre los laborables del horario (1 lunes … 7 domingo). */
export function esDiaLaborable(horario: AsignacionHorarioDto, fechaOperativa: string): boolean {
  const { diaSemana } = descomponerEnColombia(aInstanteUtc(fechaOperativa, '12:00'))
  return horario.diasLaborables.includes(diaSemana === 0 ? 7 : diaSemana)
}
