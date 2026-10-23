/**
 * Estado que se muestra de un trabajador en las pantallas (catálogo confirmado en D31).
 *
 * Es el vocabulario que comparten las reglas (que lo calculan, hito 7) y la interfaz (que lo
 * presenta). Siempre se muestra con texto además de color (constitución R-7).
 */
export type EstadoVisible =
  | 'EN_JORNADA'
  | 'EN_ALMUERZO'
  | 'RETRASO'
  | 'SIN_REGISTRAR'
  | 'AUSENCIA_APARENTE'
  | 'SALIDA_ANTICIPADA'
  | 'ALMUERZO_PROLONGADO'
  | 'INCIDENCIA'
  | 'FINALIZADA'
  | 'INACTIVO'
  | 'VACACIONES'
  | 'INCAPACIDAD'
  | 'LICENCIA'

/** Texto que ve la persona para cada estado. */
export const TEXTO_ESTADO_VISIBLE: Record<EstadoVisible, string> = {
  EN_JORNADA: 'En jornada',
  EN_ALMUERZO: 'En almuerzo',
  RETRASO: 'Retraso',
  SIN_REGISTRAR: 'Sin registrar',
  AUSENCIA_APARENTE: 'Ausencia aparente',
  SALIDA_ANTICIPADA: 'Salida anticipada',
  ALMUERZO_PROLONGADO: 'Almuerzo prolongado',
  INCIDENCIA: 'Incidencia',
  FINALIZADA: 'Finalizada',
  INACTIVO: 'Inactivo',
  VACACIONES: 'Vacaciones',
  INCAPACIDAD: 'Incapacidad',
  LICENCIA: 'Licencia',
}
