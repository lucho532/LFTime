import type { EstadoIncidencia } from '../../contratos/incidencia'
import { TEXTO_ESTADO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import { Insignia, type TonoInsignia } from '../base/Insignia'

const TONO: Record<EstadoIncidencia, { tono: TonoInsignia; icono: string }> = {
  PENDIENTE: { tono: 'ambar', icono: '●' },
  EN_REVISION: { tono: 'azul', icono: '◐' },
  PENDIENTE_INFORMACION: { tono: 'ambar', icono: '?' },
  JUSTIFICADA: { tono: 'verde', icono: '✓' },
  NO_JUSTIFICADA: { tono: 'gris', icono: '✕' },
}

/**
 * Insignia del estado de una incidencia (P-17): siempre texto además de color y símbolo (R-7).
 * «No justificada» usa un tono neutro a propósito: solo queda registrada, no es una sanción (P-18).
 */
export function InsigniaEstadoIncidencia({ estado }: { estado: EstadoIncidencia }) {
  return <Insignia texto={TEXTO_ESTADO_INCIDENCIA[estado]} tono={TONO[estado].tono} icono={TONO[estado].icono} />
}
