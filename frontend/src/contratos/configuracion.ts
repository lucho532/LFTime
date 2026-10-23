/**
 * Reglas provisionales y configurables (spec D37). No son reglas laborales definitivas.
 * Cada valor se rotula «provisional» en la interfaz.
 */
export interface ReglasProvisionalesDto {
  /** Cerrada por D1: 0 minutos. */
  toleranciaEntradaMinutos: number
  toleranciaSalidaMinutos: number
  toleranciaAlmuerzoMinutos: number
  umbralAusenciaMinutos: number
  umbralSalidaSinRegistrarMinutos: number
  umbralRegresoSinRegistrarMinutos: number
  radioPermitidoMetros: number
  precisionMaximaMetros: number
  intervaloActualizacionSegundos: number
}
