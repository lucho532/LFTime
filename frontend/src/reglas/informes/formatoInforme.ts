import { formatearFechaHoraColombia } from '../../utilidades/formatoFechaHora'
import { formatearHora12 } from '../../utilidades/horaColombia'

/** Texto de una celda cuando no hay dato. */
export const SIN_DATO = '—'

/** Hora de un instante a 12 horas en Colombia, o «—» si no existe. */
export function textoHora(instante: Date | null): string {
  return instante ? formatearHora12(instante) : SIN_DATO
}

/** Fecha y hora de un instante ISO en Colombia (`2026-10-23 08:30 a. m.`). */
export function textoFechaHora(instanteIso: string): string {
  return formatearFechaHoraColombia(new Date(instanteIso))
}
