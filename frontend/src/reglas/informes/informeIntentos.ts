import { NOMBRE_MARCACION, TEXTO_MOTIVO_RECHAZO } from '../../modelos/etiquetasMarcacion'
import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { filtrarTrabajadores } from './jornadasDelPeriodo'
import { SIN_DATO, textoFechaHora } from './formatoInforme'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de intentos rechazados (P-23). */
export const COLUMNAS_INTENTOS = [
  'Fecha y hora', 'Trabajador', 'Hospital', 'Tipo de evento', 'Motivo', 'Fallo técnico', 'Distancia', 'Precisión', 'Incidencia',
]

/**
 * Informe «Intentos rechazados» (HU-08, CA-5): los intentos del periodo, siempre aparte de las marcaciones
 * válidas. Un fallo técnico se rotula como tal («Sí») y nunca como ubicación indebida (CA-14); solo el
 * intento fuera de radio apunta a una incidencia. Los más recientes primero.
 */
export function informeIntentos(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const ids = new Set(filtrarTrabajadores(datos, filtros).map((t) => t.id))
  const trabajador = (id: string) => datos.trabajadores.find((t) => t.id === id)?.nombreCompleto ?? 'Persona no disponible'
  const hospital = (id: string) => datos.hospitales.find((h) => h.id === id)?.nombre ?? 'Hospital no disponible'
  const intentos = datos.intentos
    .filter((i) => ids.has(i.trabajadorId) && i.fechaOperativa >= filtros.desde && i.fechaOperativa <= filtros.hasta)
    .sort((a, b) => b.instante.localeCompare(a.instante))
  const filas = intentos.map((i) => [
      textoFechaHora(i.instante),
      trabajador(i.trabajadorId),
      hospital(i.hospitalId),
      NOMBRE_MARCACION[i.tipo],
      TEXTO_MOTIVO_RECHAZO[i.motivo],
      i.esFalloTecnico ? 'Sí' : 'No',
      i.distanciaAlHospitalMetros === undefined ? SIN_DATO : `${Math.round(i.distanciaAlHospitalMetros)} m`,
      i.ubicacion ? `${Math.round(i.ubicacion.precisionMetros)} m` : SIN_DATO,
      i.incidenciaId ?? SIN_DATO,
    ])
  const enlaces = intentos.map((i) => ({
    trabajadorId: i.trabajadorId,
    incidencias: i.incidenciaId ? [{ id: i.incidenciaId, texto: i.incidenciaId }] : [],
  }))
  return { tipo: 'INTENTOS_RECHAZADOS', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_INTENTOS, filas, enlaces }
}
