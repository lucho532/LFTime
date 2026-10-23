/**
 * Cálculos con horas del día en formato `HH:mm` (hora de Colombia, ver R-9).
 *
 * Responsabilidad: convertir horas a minutos y medir el tiempo entre dos horas, entendiendo que si la
 * segunda es menor, el turno cruza la medianoche. No conoce jornadas ni reglas de negocio.
 */

const MINUTOS_POR_DIA = 1440
const FORMATO_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Indica si el texto es una hora válida `HH:mm` de 24 horas. */
export function esHoraValida(hora: string): boolean {
  return FORMATO_HORA.test(hora)
}

/** Minutos desde la medianoche de una hora `HH:mm` ya validada. */
export function minutosDelDia(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * 60 + minutos
}

/** Minutos entre dos horas `HH:mm`; si la segunda es menor, se asume el día siguiente. */
export function minutosEntre(desde: string, hasta: string): number {
  return (minutosDelDia(hasta) - minutosDelDia(desde) + MINUTOS_POR_DIA) % MINUTOS_POR_DIA
}
