import type { ReglasProvisionalesDto } from '../contratos/configuracion'

/**
 * Valores provisionales de las reglas (spec D37, plan §13). **No son reglas laborales definitivas**:
 * son supuestos de demostración, aceptados por el responsable y editables en Configuración.
 *
 * - Entrada: 0 minutos es la decisión D1 (cerrada).
 * - Radio de 100 m y precisión de 25 m: D19, provisionales hasta las pruebas de producción.
 * - Todo lo demás: P-01, P-02 y P-25, provisionales y con la regla de negocio aún abierta.
 */
export const REGLAS_PROVISIONALES_POR_DEFECTO: ReglasProvisionalesDto = {
  toleranciaEntradaMinutos: 0,
  toleranciaSalidaMinutos: 0,
  toleranciaAlmuerzoMinutos: 0,
  umbralAusenciaMinutos: 60,
  umbralSalidaSinRegistrarMinutos: 60,
  umbralRegresoSinRegistrarMinutos: 30,
  radioPermitidoMetros: 100,
  precisionMaximaMetros: 25,
  intervaloActualizacionSegundos: 60,
}
