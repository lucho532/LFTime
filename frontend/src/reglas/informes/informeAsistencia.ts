import { TEXTO_ESTADO_VISIBLE } from '../../modelos/estadoVisible'
import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { construirJornadas } from './jornadasDelPeriodo'
import { textoHora } from './formatoInforme'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de asistencia diaria (P-23, `contratos-preliminares.md` §7). */
export const COLUMNAS_ASISTENCIA = [
  'Fecha operativa', 'Trabajador', 'Documento', 'Hospital', 'Municipio', 'Entrada', 'Salida almuerzo', 'Regreso almuerzo', 'Salida final', 'Estado',
]

/**
 * Informe «Asistencia diaria» (HU-08): una fila por trabajador y fecha operativa del periodo en que se
 * esperaba la jornada o hubo marcaciones, con la hora de cada evento y el estado calculado con la hora de
 * la foto (D31). Una jornada esperada sin marcas aparece con «—». Los estados son provisionales (P-01, P-02).
 */
export function informeAsistencia(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const filas = construirJornadas(datos, filtros)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.trabajador.nombreCompleto.localeCompare(b.trabajador.nombreCompleto))
    .map(({ fecha, trabajador, hospital, municipio, instantes, estado }) => [
      fecha,
      trabajador.nombreCompleto,
      trabajador.numeroDocumento,
      hospital.nombre,
      municipio,
      textoHora(instantes.entrada),
      textoHora(instantes.salidaAlmuerzo),
      textoHora(instantes.regresoAlmuerzo),
      textoHora(instantes.salidaFinal),
      estado ? TEXTO_ESTADO_VISIBLE[estado] : 'Sin turno',
    ])
  return { tipo: 'ASISTENCIA_DIARIA', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_ASISTENCIA, filas }
}
