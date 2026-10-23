import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { construirJornadas, type JornadaInforme } from './jornadasDelPeriodo'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de horas por trabajador (P-23). */
export const COLUMNAS_HORAS = [
  'Trabajador', 'Periodo', 'Horas programadas', 'Tiempo efectivo', 'Tiempo de almuerzo', 'Tiempo total', 'Diferencia', 'Cómputo completo',
]

const suma = (jornadas: JornadaInforme[], valor: (j: JornadaInforme) => number | null) => jornadas.reduce((total, j) => total + (valor(j) ?? 0), 0)

function textoDiferencia(minutos: number): string {
  const signo = minutos < 0 ? '−' : minutos > 0 ? '+' : ''
  return `${signo}${formatearDuracion(Math.abs(minutos))}`
}

function textoComputo(incompletas: number): string {
  if (incompletas === 0) return 'Sí'
  return `No (${incompletas} jornada${incompletas === 1 ? '' : 's'} incompleta${incompletas === 1 ? '' : 's'})`
}

/**
 * Informe «Horas por trabajador» (HU-08, D21): por trabajador, las horas programadas del periodo y, **solo
 * de las jornadas completas**, el tiempo efectivo, el de almuerzo y el total, siempre separados. La
 * diferencia compara el efectivo con lo programado de esas mismas jornadas. «Cómputo completo» dice «No» e
 * indica cuántas jornadas con marcas incompletas quedaron fuera: nunca se estima lo que falta (D16). No
 * decide si el almuerzo se paga o se descuenta (P-03 y P-05 abiertos).
 */
export function informeHoras(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const porTrabajador = new Map<string, JornadaInforme[]>()
  for (const jornada of construirJornadas(datos, filtros)) {
    porTrabajador.set(jornada.trabajador.id, [...(porTrabajador.get(jornada.trabajador.id) ?? []), jornada])
  }
  const periodo = textoPeriodo(filtros.desde, filtros.hasta)
  const filas = [...porTrabajador.values()]
    .sort((a, b) => a[0].trabajador.nombreCompleto.localeCompare(b[0].trabajador.nombreCompleto))
    .map((jornadas) => {
      const completas = jornadas.filter((j) => j.duraciones.completa)
      const incompletas = jornadas.filter((j) => j.marcaciones.length > 0 && !j.duraciones.completa).length
      const efectivo = suma(completas, (j) => j.duraciones.efectivoMinutos)
      return [
        jornadas[0].trabajador.nombreCompleto,
        periodo,
        formatearDuracion(suma(jornadas, (j) => j.efectivoProgramadoMinutos)),
        formatearDuracion(efectivo),
        formatearDuracion(suma(completas, (j) => j.duraciones.almuerzoMinutos)),
        formatearDuracion(suma(completas, (j) => j.duraciones.totalMinutos)),
        textoDiferencia(efectivo - suma(completas, (j) => j.efectivoProgramadoMinutos)),
        textoComputo(incompletas),
      ]
    })
  return { tipo: 'HORAS_POR_TRABAJADOR', periodo, columnas: COLUMNAS_HORAS, filas }
}
