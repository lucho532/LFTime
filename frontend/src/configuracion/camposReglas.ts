import type { ReglasProvisionalesDto } from '../contratos/configuracion'

/** Descripción de un valor editable de las reglas provisionales, para mostrarlo y validarlo. */
export interface CampoRegla {
  clave: keyof ReglasProvisionalesDto
  etiqueta: string
  unidad: string
  ayuda: string
  /** Decisión o pendiente de la spec de la que sale el valor. */
  referencia: string
  minimo: number
  maximo: number
}

/**
 * Valores editables de la pantalla de configuración, con su rango (supuesto provisional para evitar
 * errores de digitación, no una regla laboral). Todos se rotulan «provisional» en la interfaz.
 */
export const CAMPOS_REGLAS: CampoRegla[] = [
  { clave: 'toleranciaEntradaMinutos', etiqueta: 'Tolerancia de entrada', unidad: 'minutos', ayuda: 'Minutos después de la hora programada antes de contar un retraso.', referencia: 'D1 fijó 0 minutos', minimo: 0, maximo: 120 },
  { clave: 'toleranciaSalidaMinutos', etiqueta: 'Tolerancia de salida', unidad: 'minutos', ayuda: 'Minutos antes del fin del turno antes de contar una salida anticipada.', referencia: 'P-01', minimo: 0, maximo: 120 },
  { clave: 'toleranciaAlmuerzoMinutos', etiqueta: 'Tolerancia de almuerzo', unidad: 'minutos', ayuda: 'Minutos sobre el almuerzo autorizado antes de contarlo como prolongado.', referencia: 'P-01', minimo: 0, maximo: 120 },
  { clave: 'umbralAusenciaMinutos', etiqueta: 'Umbral de ausencia aparente', unidad: 'minutos', ayuda: 'Minutos sin ninguna marca tras la hora de entrada para marcar una ausencia aparente.', referencia: 'P-02', minimo: 1, maximo: 480 },
  { clave: 'umbralSalidaSinRegistrarMinutos', etiqueta: 'Umbral de salida sin registrar', unidad: 'minutos', ayuda: 'Minutos tras el fin del turno sin salida final para marcar «Sin registrar».', referencia: 'P-02', minimo: 1, maximo: 480 },
  { clave: 'umbralRegresoSinRegistrarMinutos', etiqueta: 'Umbral de regreso sin registrar', unidad: 'minutos', ayuda: 'Minutos tras el almuerzo autorizado sin regreso para marcar «Sin registrar».', referencia: 'P-02', minimo: 1, maximo: 480 },
  { clave: 'radioPermitidoMetros', etiqueta: 'Radio permitido', unidad: 'metros', ayuda: 'Distancia máxima al hospital para marcar. Solo se copia a los hospitales nuevos.', referencia: 'D19', minimo: 10, maximo: 5000 },
  { clave: 'precisionMaximaMetros', etiqueta: 'Precisión máxima del GPS', unidad: 'metros', ayuda: 'Precisión mínima aceptada para marcar. Solo se copia a los hospitales nuevos.', referencia: 'D19', minimo: 5, maximo: 500 },
  { clave: 'intervaloActualizacionSegundos', etiqueta: 'Actualización del panel', unidad: 'segundos', ayuda: 'Cada cuánto se actualiza solo el panel de Inicio.', referencia: 'P-25', minimo: 10, maximo: 3600 },
]
