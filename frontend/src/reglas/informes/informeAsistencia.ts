import { TEXTO_ESTADO_VISIBLE } from '../../modelos/estadoVisible'
import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { detalleDeDiferencia } from './detalleDiferencia'
import { construirJornadas } from './jornadasDelPeriodo'
import { TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import { SIN_DATO, textoDiferenciaDeJornada, textoHora } from './formatoInforme'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de asistencia diaria (P-23, `contratos-preliminares.md` §7). */
export const COLUMNAS_ASISTENCIA = [
  'Fecha operativa', 'Trabajador', 'Documento', 'Hospital', 'Municipio', 'Entrada', 'Salida almuerzo', 'Regreso almuerzo', 'Salida final', 'Estado',
  'Incidencias del día', 'Diferencia con lo programado',
]

/**
 * Informe «Asistencia diaria» (HU-08): una fila por trabajador y fecha operativa del periodo en que se
 * esperaba la jornada o hubo marcaciones, con la hora de cada evento y el estado calculado con la hora de
 * la foto (D31), las incidencias del día y la diferencia entre el efectivo registrado y el programado (solo
 * jornadas completas; nunca se estima, D16). Una jornada esperada sin marcas aparece con «—». Todo es
 * provisional (P-01, P-02, P-03, P-05) y no es una sanción.
 */
export function informeAsistencia(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const jornadas = construirJornadas(datos, filtros).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.trabajador.nombreCompleto.localeCompare(b.trabajador.nombreCompleto))
  const filas = jornadas.map(({ fecha, trabajador, hospital, municipio, instantes, estado, incidencias, programada, diferenciaMinutos }) => [
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
      incidencias.length === 0 ? SIN_DATO : incidencias.map((i) => TEXTO_TIPO_INCIDENCIA[i.tipo]).join(', '),
      textoDiferenciaDeJornada(programada, diferenciaMinutos),
    ])
  const enlaces = jornadas.map((jornada) => ({
    trabajadorId: jornada.trabajador.id,
    incidencias: jornada.incidencias.map((i) => ({ id: i.id, texto: TEXTO_TIPO_INCIDENCIA[i.tipo] })),
    diferencia: detalleDeDiferencia(jornada) ?? undefined,
  }))
  return { tipo: 'ASISTENCIA_DIARIA', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_ASISTENCIA, filas, enlaces }
}
