/** Entrada del registro de auditoría de operaciones administrativas relevantes. Solo se añade, nunca se edita. */
export interface EntradaAuditoriaDto {
  id: string
  usuarioId: string
  instante: string
  accion: string
  entidad: string
  entidadId: string
  /** Motivo indicado por quien hizo la acción, si se pidió. */
  motivo?: string
  /** Descripción del cambio (por ejemplo, valor anterior y nuevo). */
  detalle?: string
}
