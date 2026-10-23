import type { AsignacionHorarioDto } from '../contratos/horario'
import type { DatosHorario } from '../modelos/horario'

/**
 * Contrato del servicio de horarios (lo planificado, no lo registrado).
 *
 * Los asigna y edita el coordinador (D15). Un horario nuevo nunca sobrescribe a otro: se añade con su
 * fecha de inicio y los anteriores se conservan. No calcula jornadas ni decide si un día es laborable.
 */
export interface IHorarioServicio {
  /** Todas las asignaciones de horario de un trabajador, la más reciente primero. */
  listarPorTrabajador(trabajadorId: string): Promise<AsignacionHorarioDto[]>
  /** Horario vigente de un trabajador en una fecha `AAAA-MM-DD`, o `null` si no tiene. */
  obtenerVigente(trabajadorId: string, fecha: string): Promise<AsignacionHorarioDto | null>
  /** Todos los horarios de todos los trabajadores (para listados). */
  listarTodos(): Promise<AsignacionHorarioDto[]>
  /** Asigna un horario nuevo desde una fecha (hoy o futura), conservando los anteriores, con auditoría. */
  asignar(trabajadorId: string, datos: DatosHorario, usuarioId: string): Promise<AsignacionHorarioDto>
}
