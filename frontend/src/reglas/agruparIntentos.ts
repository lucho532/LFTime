import type { IncidenciaDto } from '../contratos/incidencia'
import type { IntentoMarcacionDto } from '../contratos/marcacion'

/** Intentos fuera de radio de un mismo trabajador, jornada operativa y hospital (D26). */
export interface GrupoIntentos {
  clave: string
  trabajadorId: string
  fechaOperativa: string
  hospitalId: string
  /** Del más antiguo al más reciente. */
  intentosIds: string[]
  /** Instante del primer intento: cuándo se detecta la incidencia. */
  primerInstante: string
}

/** Qué hacer con un grupo: abrir una incidencia nueva o añadir intentos a la que ya existe. */
export interface AccionDeAgrupacion {
  grupo: GrupoIntentos
  /** `null` si todavía no hay incidencia de ubicación para ese trabajador, jornada y hospital. */
  incidenciaExistente: IncidenciaDto | null
  /** Intentos del grupo que la incidencia existente aún no lista (todos, si no existe). */
  intentosNuevosIds: string[]
}

/** Clave única de agrupación: trabajador + fecha operativa + hospital (D26). */
export function claveDeAgrupacion(trabajadorId: string, fechaOperativa: string, hospitalId: string): string {
  return `${trabajadorId}|${fechaOperativa}|${hospitalId}`
}

/**
 * Agrupa los intentos que prueban una ubicación fuera del radio (D26, CA-12).
 * Los fallos técnicos se excluyen: nunca alimentan una incidencia de ubicación no autorizada (CA-14).
 * Función pura: no modifica ni elimina ningún intento.
 */
export function agruparIntentos(intentos: IntentoMarcacionDto[]): GrupoIntentos[] {
  const grupos = new Map<string, GrupoIntentos>()
  const ordenados = [...intentos].sort((a, b) => Date.parse(a.instante) - Date.parse(b.instante))
  for (const intento of ordenados) {
    if (intento.esFalloTecnico || intento.motivo !== 'FUERA_DE_RADIO') {
      continue
    }
    const clave = claveDeAgrupacion(intento.trabajadorId, intento.fechaOperativa, intento.hospitalId)
    const grupo = grupos.get(clave)
    if (grupo) {
      grupo.intentosIds.push(intento.id)
    } else {
      grupos.set(clave, {
        clave,
        trabajadorId: intento.trabajadorId,
        fechaOperativa: intento.fechaOperativa,
        hospitalId: intento.hospitalId,
        intentosIds: [intento.id],
        primerInstante: intento.instante,
      })
    }
  }
  return [...grupos.values()]
}

/**
 * Decide, para cada grupo, si corresponde abrir una incidencia o añadir intentos a la existente (D26).
 * Función pura: solo describe la acción; crear o actualizar la incidencia es del servicio.
 */
export function resolverAgrupacion(grupos: GrupoIntentos[], incidencias: IncidenciaDto[]): AccionDeAgrupacion[] {
  const existentes = new Map<string, IncidenciaDto>()
  for (const incidencia of incidencias) {
    if (incidencia.tipo === 'UBICACION_NO_AUTORIZADA') {
      existentes.set(claveDeAgrupacion(incidencia.trabajadorId, incidencia.fechaOperativa, incidencia.hospitalId), incidencia)
    }
  }
  return grupos.map((grupo) => {
    const incidenciaExistente = existentes.get(grupo.clave) ?? null
    const yaListados = new Set(incidenciaExistente?.intentosIds ?? [])
    return { grupo, incidenciaExistente, intentosNuevosIds: grupo.intentosIds.filter((id) => !yaListados.has(id)) }
  })
}
