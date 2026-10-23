import { fechaColombiaDe, formatearHora12 } from './horaColombia'

/** Muestra un instante UTC como fecha y hora de Colombia: `2026-10-23 08:30 a. m.`. */
export function formatearFechaHoraColombia(instante: Date): string {
  return `${fechaColombiaDe(instante)} ${formatearHora12(instante)}`
}
