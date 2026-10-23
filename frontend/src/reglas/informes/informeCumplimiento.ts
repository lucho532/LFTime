import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { sumarMinutosA } from '../entradaJornada'
import { estaCerrada } from '../permisosIncidencia'
import { construirJornadas, filtrarTrabajadores } from './jornadasDelPeriodo'
import { incidenciasFiltradas } from './informeIncidencias'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de cumplimiento por hospital (P-23). */
export const COLUMNAS_CUMPLIMIENTO = [
  'Hospital', 'Municipio', 'Periodo', 'Jornadas programadas', 'Jornadas con entrada', 'Retrasos', 'Salidas anticipadas', 'Incidencias pendientes', 'Incidencias resueltas',
]

/**
 * Informe «Cumplimiento por hospital» (HU-08): por hospital, las jornadas programadas, las que tienen
 * entrada, los retrasos (entrada posterior a la hora más la tolerancia), las salidas anticipadas (antes del
 * fin menos la tolerancia) y las incidencias pendientes y resueltas del periodo. Cuenta jornadas, no
 * personas ni sanciones. Definiciones provisionales (P-01, P-06, P-23); las columnas de incidencias se
 * separan en dos respecto del borrador de los contratos.
 */
export function informeCumplimiento(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const jornadas = construirJornadas(datos, filtros)
  const incidencias = incidenciasFiltradas(datos, filtros)
  const { toleranciaEntradaMinutos, toleranciaSalidaMinutos } = datos.reglas
  const idsHospitales = new Set(filtrarTrabajadores(datos, filtros).map((t) => t.hospitalId))
  const filas = datos.hospitales
    .filter((h) => idsHospitales.has(h.id))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((hospital) => {
      const delHospital = jornadas.filter((j) => j.hospital.id === hospital.id)
      const conEntrada = delHospital.filter((j) => j.programada && j.instantes.entrada)
      const delasIncidencias = incidencias.filter((i) => i.hospitalId === hospital.id)
      return [
        hospital.nombre,
        datos.municipios.find((m) => m.id === hospital.municipioId)?.nombre ?? '',
        textoPeriodo(filtros.desde, filtros.hasta),
        delHospital.filter((j) => j.programada).length,
        conEntrada.length,
        conEntrada.filter((j) => j.turnoInicio && j.instantes.entrada && j.instantes.entrada > sumarMinutosA(j.turnoInicio, toleranciaEntradaMinutos)).length,
        delHospital.filter((j) => j.turnoFin && j.instantes.salidaFinal && j.instantes.salidaFinal < sumarMinutosA(j.turnoFin, -toleranciaSalidaMinutos)).length,
        delasIncidencias.filter((i) => !estaCerrada(i.estado)).length,
        delasIncidencias.filter((i) => estaCerrada(i.estado)).length,
      ]
    })
  return { tipo: 'CUMPLIMIENTO_POR_HOSPITAL', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_CUMPLIMIENTO, filas }
}
