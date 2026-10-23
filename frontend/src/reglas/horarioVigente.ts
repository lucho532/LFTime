import type { AsignacionHorarioDto } from '../contratos/horario'

/**
 * Regla provisional (spec P-07): devuelve el horario de un trabajador vigente en una fecha
 * (`AAAA-MM-DD`), o `null` si no tiene ninguno.
 *
 * Gana la asignación con `vigenteDesde` más reciente que no sea posterior a la fecha. Se asume
 * un turno por día; no decide si el día es laborable ni modifica horarios.
 */
export function obtenerHorarioVigente(
  horarios: AsignacionHorarioDto[],
  trabajadorId: string,
  fecha: string,
): AsignacionHorarioDto | null {
  const candidatos = horarios.filter((horario) => horario.trabajadorId === trabajadorId && horario.vigenteDesde <= fecha)
  if (candidatos.length === 0) {
    return null
  }
  return candidatos.reduce((masReciente, actual) => (actual.vigenteDesde > masReciente.vigenteDesde ? actual : masReciente))
}
