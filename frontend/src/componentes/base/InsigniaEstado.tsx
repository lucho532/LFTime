import { TEXTO_ESTADO_VISIBLE, type EstadoVisible } from '../../modelos/estadoVisible'
import { Insignia } from './Insignia'
import { PRESENTACION_ESTADO } from './presentacionEstado'

interface PropiedadesInsigniaEstado {
  estado: EstadoVisible
}

/**
 * Insignia de un estado visible del catálogo (D31). Siempre muestra el texto del estado además
 * de su color y símbolo. No calcula el estado: lo recibe.
 */
export function InsigniaEstado({ estado }: PropiedadesInsigniaEstado) {
  const { tono, icono } = PRESENTACION_ESTADO[estado]
  return <Insignia texto={TEXTO_ESTADO_VISIBLE[estado]} tono={tono} icono={icono} />
}
