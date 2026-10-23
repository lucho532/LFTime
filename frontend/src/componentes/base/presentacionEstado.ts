import type { EstadoVisible } from '../../modelos/estadoVisible'
import type { TonoInsignia } from './Insignia'

/**
 * Presentación (tono y símbolo) de cada estado visible del catálogo (D31). El texto de cada
 * estado vive en `modelos/estadoVisible.ts`; aquí solo se decide cómo se ve.
 */
export const PRESENTACION_ESTADO: Record<EstadoVisible, { tono: TonoInsignia; icono: string }> = {
  EN_JORNADA: { tono: 'verde', icono: '●' },
  EN_ALMUERZO: { tono: 'azul', icono: '◐' },
  RETRASO: { tono: 'ambar', icono: '▲' },
  SIN_REGISTRAR: { tono: 'rojo', icono: '✕' },
  AUSENCIA_APARENTE: { tono: 'rojo', icono: '✕' },
  SALIDA_ANTICIPADA: { tono: 'ambar', icono: '▲' },
  ALMUERZO_PROLONGADO: { tono: 'ambar', icono: '◔' },
  INCIDENCIA: { tono: 'rojo', icono: '!' },
  FINALIZADA: { tono: 'gris', icono: '✓' },
  INACTIVO: { tono: 'gris', icono: '–' },
  VACACIONES: { tono: 'gris', icono: '–' },
  INCAPACIDAD: { tono: 'gris', icono: '–' },
  LICENCIA: { tono: 'gris', icono: '–' },
}
