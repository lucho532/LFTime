import type { TipoIncidencia } from '../contratos/incidencia'

/**
 * Alerta lista para mostrar: la alerta (P-19) junto con los datos de su incidencia, para enlazar y
 * describirla sin que la pantalla consulte otra cosa. «Sin revisar» y «revisada» se muestran con texto.
 */
export interface AlertaVisible {
  id: string
  incidenciaId: string
  creadaEn: string
  revisada: boolean
  tipo: TipoIncidencia
  trabajadorId: string
  hospitalId: string
}
