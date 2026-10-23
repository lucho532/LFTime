/**
 * Nombres y resumen de los días de la semana (1 = lunes … 7 = domingo) para mostrar horarios.
 * No decide qué días se trabaja.
 */

export const NOMBRES_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const ABREVIATURAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Resume una lista de días: «Todos los días», un rango como «Lun a Vie» si son consecutivos (más de
 * dos), o la lista separada por comas. Sin días devuelve «Sin días».
 */
export function resumirDias(dias: number[]): string {
  const ordenados = [...new Set(dias)].filter((d) => d >= 1 && d <= 7).sort((a, b) => a - b)
  if (ordenados.length === 0) return 'Sin días'
  if (ordenados.length === 7) return 'Todos los días'
  const consecutivos = ordenados.every((dia, i) => i === 0 || dia === ordenados[i - 1] + 1)
  if (consecutivos && ordenados.length > 2) {
    return `${ABREVIATURAS[ordenados[0] - 1]} a ${ABREVIATURAS[ordenados[ordenados.length - 1] - 1]}`
  }
  return ordenados.map((dia) => ABREVIATURAS[dia - 1]).join(', ')
}
