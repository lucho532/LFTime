import type { InstantaneaPanel } from '../modelos/panel'

/**
 * Contrato del servicio del panel de coordinación (HU-01).
 *
 * Entrega la situación actual del personal ya calculada con las reglas provisionales. Solo lee: no crea
 * marcaciones ni incidencias distintas de las que ya detectan las reglas, ni impone consecuencias.
 */
export interface IPanelServicio {
  /** Foto del panel «ahora». Cada llamada recalcula; en la Fase 2 será una consulta al servidor. */
  obtenerInstantanea(): Promise<InstantaneaPanel>
}
