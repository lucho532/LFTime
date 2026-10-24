import type { IncidenciaDto } from '../../contratos/incidencia'
import { TEXTO_ESTADO_INCIDENCIA, TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import type { DatosInformes, FiltrosInforme, TablaInforme } from '../../modelos/informe'
import { estaCerrada } from '../permisosIncidencia'
import { detalleDeDiferencia } from './detalleDiferencia'
import { filtrarTrabajadores } from './jornadasDelPeriodo'
import { construirJornadas } from './jornadasDelPeriodo'
import { SIN_DATO, textoDiferenciaDeJornada, textoFechaHora, textoHora } from './formatoInforme'
import { textoPeriodo } from './periodo'

/** Columnas provisionales del informe de incidencias (P-23). */
export const COLUMNAS_INCIDENCIAS = [
  'Id', 'Tipo', 'Estado', 'Trabajador', 'Hospital', 'Fecha operativa', 'Detectada', 'Revisor', 'Resolución', 'Nº de intentos',
  'Entrada', 'Salida almuerzo', 'Regreso almuerzo', 'Salida final', 'Diferencia con lo programado',
]

/** Incidencias del periodo de los trabajadores y hospitales que cumplen los filtros. */
export function incidenciasFiltradas(datos: DatosInformes, filtros: FiltrosInforme): IncidenciaDto[] {
  const ids = new Set(filtrarTrabajadores(datos, filtros).map((t) => t.id))
  return datos.incidencias.filter((i) => ids.has(i.trabajadorId) && i.fechaOperativa >= filtros.desde && i.fechaOperativa <= filtros.hasta)
}

function textoResolucion(incidencia: IncidenciaDto): string {
  if (!estaCerrada(incidencia.estado)) return 'Sin resolver'
  const motivo = [...incidencia.historial].reverse().find((e) => e.accion === 'RESUELTA')?.motivo
  return motivo ? `${TEXTO_ESTADO_INCIDENCIA[incidencia.estado]}: ${motivo}` : TEXTO_ESTADO_INCIDENCIA[incidencia.estado]
}

/**
 * Informe «Incidencias» (HU-08): las incidencias del periodo con su estado, revisor, resolución y número
 * de intentos asociados, más la hora de cada registro de esa jornada y la diferencia con lo programado (solo
 * jornadas completas, D16). Una incidencia es una anomalía sujeta a revisión, no una sanción (P-18); el informe
 * solo las lista. Las más recientes primero.
 */
export function informeIncidencias(datos: DatosInformes, filtros: FiltrosInforme): TablaInforme {
  const trabajador = (id: string) => datos.trabajadores.find((t) => t.id === id)?.nombreCompleto ?? 'Persona no disponible'
  const hospital = (id: string) => datos.hospitales.find((h) => h.id === id)?.nombre ?? 'Hospital no disponible'
  const jornadas = new Map(construirJornadas(datos, filtros).map((j) => [`${j.trabajador.id}|${j.fecha}`, j]))
  const ordenadas = incidenciasFiltradas(datos, filtros).sort((a, b) => b.detectadaEn.localeCompare(a.detectadaEn))
  const filas = ordenadas.map((i) => {
      const jornada = jornadas.get(`${i.trabajadorId}|${i.fechaOperativa}`)
      return [
        i.id,
        TEXTO_TIPO_INCIDENCIA[i.tipo],
        TEXTO_ESTADO_INCIDENCIA[i.estado],
        trabajador(i.trabajadorId),
        hospital(i.hospitalId),
        i.fechaOperativa,
        textoFechaHora(i.detectadaEn),
        i.revisorPrincipalId ? (datos.nombresUsuarios[i.revisorPrincipalId] ?? 'Persona no disponible') : 'Sin asignar',
        textoResolucion(i),
        i.intentosIds?.length ?? 0,
        textoHora(jornada?.instantes.entrada ?? null),
        textoHora(jornada?.instantes.salidaAlmuerzo ?? null),
        textoHora(jornada?.instantes.regresoAlmuerzo ?? null),
        textoHora(jornada?.instantes.salidaFinal ?? null),
        jornada ? textoDiferenciaDeJornada(jornada.programada, jornada.diferenciaMinutos) : SIN_DATO,
      ]
    })
  const enlaces = ordenadas.map((i) => {
    const jornada = jornadas.get(`${i.trabajadorId}|${i.fechaOperativa}`)
    return { trabajadorId: i.trabajadorId, incidencias: [{ id: i.id, texto: i.id }], diferencia: (jornada && detalleDeDiferencia(jornada)) || undefined }
  })
  return { tipo: 'INCIDENCIAS', periodo: textoPeriodo(filtros.desde, filtros.hasta), columnas: COLUMNAS_INCIDENCIAS, filas, enlaces }
}
