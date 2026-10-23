/**
 * Escenarios de la jornada de hoy para la demostración (spec §9, P-22 confirmado).
 *
 * Cada escenario describe qué hizo un trabajador respecto a su horario. Son datos de ejemplo,
 * no reglas: la detección de incidencias la hacen las reglas (hito 7) a partir de las marcaciones.
 */
export type EscenarioDia =
  | 'NORMAL'
  | 'RETRASO'
  | 'SIN_ENTRADA'
  | 'NO_REGRESO'
  | 'ALMUERZO_EXCEDIDO'
  | 'SALIDA_ANTICIPADA'

/** Cómo se desvía un día de lo programado. Los valores son minutos; `null` significa que el evento no ocurre. */
export interface PlanDia {
  /** Minutos respecto a la hora programada de entrada (positivo = tarde). */
  entrada: number | null
  /** Minutos respecto al inicio de la ventana de almuerzo. */
  almuerzoSalida: number | null
  /** Duración del almuerzo; `null` = no regresó. */
  almuerzoDuracion: number | null
  /** Minutos respecto a la hora programada de salida (negativo = anticipada); `null` = sin salida. */
  salida: number | null
}

/** Escenario de hoy de los trabajadores que no son «normales». */
export const ESCENARIOS_HOY: Record<string, EscenarioDia> = {
  'trab-004': 'RETRASO',
  'trab-005': 'SIN_ENTRADA',
  'trab-007': 'NO_REGRESO',
  'trab-009': 'ALMUERZO_EXCEDIDO',
  'trab-010': 'SALIDA_ANTICIPADA',
}

/** Plan base de cada escenario. Un trabajador «normal» recibe además una pequeña variación. */
export const PLANES_BASE: Record<EscenarioDia, PlanDia> = {
  NORMAL: { entrada: -3, almuerzoSalida: 3, almuerzoDuracion: 58, salida: 1 },
  RETRASO: { entrada: 28, almuerzoSalida: 3, almuerzoDuracion: 58, salida: 1 },
  SIN_ENTRADA: { entrada: null, almuerzoSalida: null, almuerzoDuracion: null, salida: null },
  NO_REGRESO: { entrada: -1, almuerzoSalida: 15, almuerzoDuracion: null, salida: null },
  ALMUERZO_EXCEDIDO: { entrada: -2, almuerzoSalida: 3, almuerzoDuracion: 85, salida: 1 },
  SALIDA_ANTICIPADA: { entrada: -2, almuerzoSalida: 3, almuerzoDuracion: 58, salida: -45 },
}

/** Trabajadores cuyo escenario de hoy incluye intentos de marcación rechazados (ver `intentos.ts`). */
export const TRABAJADOR_INTENTO_FUERA_DE_RADIO = 'trab-012'
/** Trabajador de demostración con un intento rechazado por fallo técnico (nunca una ubicación indebida, CA-14). Solo lo usa la semilla de `intentos.ts`. */
export const TRABAJADOR_INTENTO_FALLO_TECNICO = 'trab-013'

/** Escenario de un trabajador para hoy. */
export function escenarioDeHoy(trabajadorId: string): EscenarioDia {
  return ESCENARIOS_HOY[trabajadorId] ?? 'NORMAL'
}
