import { sumarDias } from '../../utilidades/horaColombia'

/** Días máximos de un informe, para que la pantalla y los archivos sigan siendo manejables (provisional). */
export const DIAS_MAXIMOS_PERIODO = 92

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Cantidad de días entre dos fechas `AAAA-MM-DD`, contando ambas. */
function diasInclusivos(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000) + 1
}

/**
 * Valida el periodo de un informe y devuelve el mensaje de error, o `null` si es válido: fechas completas,
 * `desde` no posterior a `hasta` y no más de `DIAS_MAXIMOS_PERIODO` días. Función pura.
 */
export function validarPeriodo(desde: string, hasta: string): string | null {
  if (!FORMATO_FECHA.test(desde) || !FORMATO_FECHA.test(hasta)) {
    return 'Indica la fecha inicial y la final del periodo.'
  }
  if (desde > hasta) {
    return 'La fecha inicial no puede ser posterior a la final.'
  }
  if (diasInclusivos(desde, hasta) > DIAS_MAXIMOS_PERIODO) {
    return `El periodo no puede superar ${DIAS_MAXIMOS_PERIODO} días.`
  }
  return null
}

/**
 * Fechas operativas del periodo, de `desde` a `hasta` sin pasar de `hoy`: los días futuros no se evalúan
 * (todavía no han ocurrido). Devuelve una lista vacía si todo el periodo es futuro.
 */
export function fechasDelPeriodo(desde: string, hasta: string, hoy: string): string[] {
  const ultima = hasta < hoy ? hasta : hoy
  const fechas: string[] = []
  for (let fecha = desde; fecha <= ultima && fechas.length <= DIAS_MAXIMOS_PERIODO; fecha = sumarDias(fecha, 1)) {
    fechas.push(fecha)
  }
  return fechas
}

/** Periodo como texto para mostrar y exportar: `2026-10-17 a 2026-10-23`. */
export function textoPeriodo(desde: string, hasta: string): string {
  return desde === hasta ? desde : `${desde} a ${hasta}`
}
