import type { DetalleDiferencia } from '../../modelos/informe'
import { formatearDuracion } from '../../utilidades/formatoDuracion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import type { JornadaInforme } from './jornadasDelPeriodo'

const MINUTO = 60_000
const minutosEntre = (desde: Date, hasta: Date) => (hasta.getTime() - desde.getTime()) / MINUTO

function frase(minutos: number, sujeto: { resta: string; suma: string; igual: string }): string {
  const valor = formatearDuracion(Math.abs(minutos))
  return minutos === 0 ? sujeto.igual : minutos < 0 ? `${sujeto.resta.replace('{t}', valor)}` : `${sujeto.suma.replace('{t}', valor)}`
}

/**
 * Explica de dónde viene la diferencia con lo programado de una jornada completa. Como efectivo = (salida −
 * entrada) − almuerzo, la diferencia es la suma de tres aportes: la llegada (tarde resta, antes suma), el
 * almuerzo (de más resta, de menos suma) y la salida (antes resta, después suma). Los instantes se truncan al
 * minuto, igual que las duraciones oficiales, así que los aportes suman exactamente la diferencia. Devuelve `null`
 * si la jornada no se esperaba o está incompleta (no se estima, D16). Provisional (P-03, P-05): no es una sanción.
 */
export function detalleDeDiferencia(jornada: JornadaInforme): DetalleDiferencia | null {
  const { instantes, turnoInicio, turnoFin, duraciones, diferenciaMinutos, efectivoProgramadoMinutos } = jornada
  const { entrada, salidaAlmuerzo, regresoAlmuerzo, salidaFinal } = instantes
  if (diferenciaMinutos === null || duraciones.efectivoMinutos === null || !turnoInicio || !turnoFin || !entrada || !salidaAlmuerzo || !regresoAlmuerzo || !salidaFinal) {
    return null
  }
  const autorizado = minutosEntre(turnoInicio, turnoFin) - efectivoProgramadoMinutos
  const tomado = minutosEntre(salidaAlmuerzo, regresoAlmuerzo)
  const llegada = -minutosEntre(turnoInicio, entrada)
  const almuerzo = -(tomado - autorizado)
  const salida = minutosEntre(turnoFin, salidaFinal)
  return {
    fecha: jornada.fecha,
    trabajador: jornada.trabajador.nombreCompleto,
    efectivoProgramadoMinutos,
    efectivoMinutos: duraciones.efectivoMinutos,
    diferenciaMinutos,
    aportes: [
      {
        concepto: 'Entrada',
        programado: formatearHora12(turnoInicio),
        registrado: formatearHora12(entrada),
        aporteMinutos: llegada,
        descripcion: frase(llegada, { resta: 'Llegó {t} tarde', suma: 'Llegó {t} antes', igual: 'Llegó a la hora' }),
      },
      {
        concepto: 'Almuerzo',
        programado: formatearDuracion(autorizado),
        registrado: formatearDuracion(tomado),
        aporteMinutos: almuerzo,
        descripcion: frase(almuerzo, { resta: 'Almuerzo {t} más largo que el autorizado', suma: 'Almuerzo {t} más corto que el autorizado', igual: 'Almuerzo igual al autorizado' }),
      },
      {
        concepto: 'Salida',
        programado: formatearHora12(turnoFin),
        registrado: formatearHora12(salidaFinal),
        aporteMinutos: salida,
        descripcion: frase(salida, { resta: 'Salió {t} antes', suma: 'Salió {t} después', igual: 'Salió a la hora' }),
      },
    ],
  }
}
