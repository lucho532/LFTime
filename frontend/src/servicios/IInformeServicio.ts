import type { DatosInformes } from '../modelos/informe'

/**
 * Contrato del servicio de informes (HU-08).
 *
 * Entrega los datos registrados que necesitan los informes. No calcula nada (los cálculos viven en
 * `reglas/informes`), no exporta archivos y no modifica datos. En la Fase 2 será una consulta al servidor
 * con el periodo y los filtros.
 */
export interface IInformeServicio {
  /** Foto de lo registrado, con las incidencias de hoy ya detectadas. */
  obtenerDatos(): Promise<DatosInformes>
}
