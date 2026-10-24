import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { textoDiferencia } from './formatoInforme'
import { construirJornadas, type JornadaInforme } from './jornadasDelPeriodo'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de acumulado mensual (P-23). */
export const COLUMNAS_ACUMULADO = [
  'Mes', 'Trabajador', 'Diferencia acumulada', 'Situación', 'Hospital', 'Jornadas completas', 'Jornadas incompletas', 'Tiempo programado', 'Tiempo efectivo', 'Documento',
]

const suma = (jornadas: JornadaInforme[], valor: (j: JornadaInforme) => number) => jornadas.reduce((total, j) => total + valor(j), 0)

function situacion(completas: number, diferenciaMinutos: number): string {
  if (completas === 0) return 'Sin jornadas completas'
  return diferenciaMinutos < 0 ? 'Debe tiempo' : diferenciaMinutos > 0 ? 'A favor' : 'Al día'
}

/**
 * Informe «Acumulado mensual»: por trabajador y mes del periodo, la suma de la diferencia entre el tiempo
 * efectivo registrado y el programado, **solo de las jornadas completas** (las incompletas se cuentan aparte y
 * nunca se estiman, D16). Las columnas que más se consultan (diferencia y situación) van al principio. Ordena primero a quien más tiempo debe del mes más reciente. «Debe tiempo» solo dice que
 * lo registrado quedó por debajo de lo programado: es un cálculo provisional (P-03 y P-05 abiertos), no una
 * sanción ni un descuento, y no decide si el almuerzo se paga.
 */
export function informeAcumuladoMensual(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const grupos = new Map<string, JornadaInforme[]>()
  for (const jornada of construirJornadas(datos, filtros)) {
    const clave = `${jornada.fecha.slice(0, 7)}|${jornada.trabajador.id}`
    grupos.set(clave, [...(grupos.get(clave) ?? []), jornada])
  }
  const resumenes = [...grupos.entries()].map(([clave, jornadas]) => {
    const completas = jornadas.filter((j) => j.programada && j.duraciones.completa)
    const efectivo = suma(completas, (j) => j.duraciones.efectivoMinutos ?? 0)
    const programado = suma(completas, (j) => j.efectivoProgramadoMinutos)
    return { mes: clave.split('|')[0], jornadas, completas: completas.length, incompletas: jornadas.filter((j) => j.marcaciones.length > 0 && !j.duraciones.completa).length, efectivo, programado, diferencia: efectivo - programado }
  })
  resumenes.sort((a, b) => b.mes.localeCompare(a.mes) || a.diferencia - b.diferencia || a.jornadas[0].trabajador.nombreCompleto.localeCompare(b.jornadas[0].trabajador.nombreCompleto))
  const filas = resumenes.map(({ mes, jornadas, completas, incompletas, efectivo, programado, diferencia }) => {
    const { trabajador, hospital } = jornadas[0]
    return [
      mes, trabajador.nombreCompleto, completas === 0 ? '—' : textoDiferencia(diferencia), situacion(completas, diferencia), hospital.nombre, completas, incompletas,
      formatearDuracion(programado), formatearDuracion(efectivo), trabajador.numeroDocumento,
    ]
  })
  const enlaces = resumenes.map(({ jornadas }) => ({ trabajadorId: jornadas[0].trabajador.id }))
  return { tipo: 'ACUMULADO_MENSUAL', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_ACUMULADO, filas, enlaces }
}
