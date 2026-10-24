import type { DatosInformes, FiltrosInforme, TablaInforme, TipoInforme } from '../../modelos/informe'
import { informeAcumuladoMensual } from './informeAcumuladoMensual'
import { informeAsistencia } from './informeAsistencia'
import { informeCumplimiento } from './informeCumplimiento'
import { informeHoras } from './informeHoras'
import { informeIncidencias } from './informeIncidencias'
import { informeTiempoDebido } from './informeTiempoDebido'
import { informeIntentos } from './informeIntentos'
import { validarPeriodo } from './periodo'

const CONSTRUCTORES: Record<TipoInforme, (datos: DatosInformes, filtros: FiltrosInforme) => TablaInforme> = {
  ASISTENCIA_DIARIA: informeAsistencia,
  HORAS_POR_TRABAJADOR: informeHoras,
  INCIDENCIAS: informeIncidencias,
  INTENTOS_RECHAZADOS: informeIntentos,
  CUMPLIMIENTO_POR_HOSPITAL: informeCumplimiento,
  ACUMULADO_MENSUAL: informeAcumuladoMensual,
  TIEMPO_DEBIDO: informeTiempoDebido,
}

/**
 * Calcula la tabla de un informe para unos filtros. Lanza un error con un mensaje comprensible si el
 * periodo no es válido. Función pura: la pantalla y la exportación usan este mismo resultado.
 */
export function construirInforme(tipo: TipoInforme, datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const errorPeriodo = validarPeriodo(filtros.desde, filtros.hasta)
  if (errorPeriodo) {
    throw new Error(errorPeriodo)
  }
  return CONSTRUCTORES[tipo](datos, filtros)
}
