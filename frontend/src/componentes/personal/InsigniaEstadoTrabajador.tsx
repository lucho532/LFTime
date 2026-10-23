import type { EstadoTrabajador } from '../../contratos/trabajador'
import { TEXTO_ESTADO_TRABAJADOR } from '../../modelos/estadoTrabajador'
import { Insignia } from '../base/Insignia'

/**
 * Insignia del estado de un trabajador (activo, inactivo, vacaciones, incapacidad o licencia).
 * Siempre muestra el texto además del color. Todo estado distinto de «Activo» suprime la detección
 * de incidencias (P-20, provisional). No cambia el estado: solo lo muestra.
 */
export function InsigniaEstadoTrabajador({ estado }: { estado: EstadoTrabajador }) {
  return <Insignia texto={TEXTO_ESTADO_TRABAJADOR[estado]} tono={estado === 'ACTIVO' ? 'verde' : 'gris'} icono={estado === 'ACTIVO' ? '●' : '–'} />
}
