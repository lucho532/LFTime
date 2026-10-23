import type { AlertaVisible } from '../modelos/alerta'

/**
 * Contrato del servicio de alertas del panel (HU-07, P-19).
 *
 * Toda incidencia detectada tiene una alerta. Las alertas no se descartan: se marcan «revisada» al abrir
 * su incidencia. No crea alertas (las abre el servicio de incidencias) ni envía correos ni mensajes.
 */
export interface IAlertaServicio {
  /** Alertas con los datos de su incidencia, la más reciente primero. */
  listar(): Promise<AlertaVisible[]>
  /** Marca como revisada la alerta de una incidencia; no hace nada si ya estaba revisada o no existe. */
  marcarRevisadaDeIncidencia(incidenciaId: string): Promise<void>
}
