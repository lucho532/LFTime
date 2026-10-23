/**
 * Contrato de intercambio de la asignación de horario de un trabajador (D15, P-07 provisional).
 *
 * Representa lo planificado, no lo registrado. Lo asigna y edita el coordinador.
 * Las horas son de Colombia en formato `HH:mm`; si la salida es menor que la entrada,
 * el turno cruza la medianoche (D5).
 */
export interface AsignacionHorarioDto {
  id: string
  trabajadorId: string
  /** Fecha `AAAA-MM-DD` desde la que rige este horario. */
  vigenteDesde: string
  /** Días de la semana laborables, de 1 (lunes) a 7 (domingo). */
  diasLaborables: number[]
  horaEntrada: string
  horaSalida: string
  ventanaAlmuerzoDesde: string
  ventanaAlmuerzoHasta: string
  /** Duración autorizada del almuerzo; 60 (D4), configurable. */
  duracionAlmuerzoMinutos: number
  asignadoPorUsuarioId: string
}
