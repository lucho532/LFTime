/**
 * Datos de un horario que asigna el coordinador (D15, P-07 provisional). Las horas son de Colombia en
 * formato `HH:mm`; si la salida es menor que la entrada, el turno cruza la medianoche (D5).
 */
export interface DatosHorario {
  /** Fecha `AAAA-MM-DD` desde la que rige el horario. */
  vigenteDesde: string
  /** Días laborables, de 1 (lunes) a 7 (domingo). */
  diasLaborables: number[]
  horaEntrada: string
  horaSalida: string
  ventanaAlmuerzoDesde: string
  ventanaAlmuerzoHasta: string
  /** Duración autorizada del almuerzo, en minutos; 60 por defecto (D4). */
  duracionAlmuerzoMinutos: number
}
