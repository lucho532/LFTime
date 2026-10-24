import { formatearFechaHoraColombia } from '../../utilidades/formatoFechaHora'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
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

/** Signo con el que empieza un tiempo por debajo de lo programado; la pantalla lo muestra en rojo, pero el signo va siempre en el texto (R-7). */
export const SIGNO_EN_CONTRA = '−'

/** Diferencia entre lo registrado y lo programado como texto con signo: `−1 h 00 min`, `+15 min` o `0 min`. */
export function textoDiferencia(minutos: number): string {
  const signo = minutos < 0 ? SIGNO_EN_CONTRA : minutos > 0 ? '+' : ''
  return `${signo}${formatearDuracion(Math.abs(minutos))}`
}

/** Diferencia de una jornada: «—» si no se esperaba, «Incompleto» si faltan marcas (no se estima, D16) o el tiempo con signo. */
export function textoDiferenciaDeJornada(esperada: boolean, diferenciaMinutos: number | null): string {
  if (!esperada) return SIN_DATO
  return diferenciaMinutos === null ? 'Incompleto' : textoDiferencia(diferenciaMinutos)
}

/** Indica si una celda es un tiempo por debajo de lo programado (empieza por el signo menos). */
export function esTiempoEnContra(valor: string | number): boolean {
  return typeof valor === 'string' && valor.startsWith(SIGNO_EN_CONTRA)
}
