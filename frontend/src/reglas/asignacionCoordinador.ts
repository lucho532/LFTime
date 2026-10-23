import type { AsignacionCoordinadorDto } from '../contratos/hospital'

/**
 * Regla provisional (spec D28): un hospital tiene un coordinador responsable principal.
 * Devuelve la asignación vigente en la fecha indicada (`AAAA-MM-DD`), o `null` si el hospital
 * no tiene responsable en ese día.
 *
 * Una asignación rige desde `vigenteDesde` (inclusive) hasta `vigenteHasta` (inclusive); si no
 * tiene `vigenteHasta`, sigue vigente. Si hubiera más de una, gana la de `vigenteDesde` más reciente.
 * No modifica las asignaciones ni decide permisos.
 */
export function obtenerAsignacionVigente(
  asignaciones: AsignacionCoordinadorDto[],
  fecha: string,
): AsignacionCoordinadorDto | null {
  const vigentes = asignaciones.filter(
    (asignacion) => asignacion.vigenteDesde <= fecha && (!asignacion.vigenteHasta || fecha <= asignacion.vigenteHasta),
  )
  if (vigentes.length === 0) {
    return null
  }
  return vigentes.reduce((masReciente, actual) => (actual.vigenteDesde > masReciente.vigenteDesde ? actual : masReciente))
}
