import '../../estilos/componentes/RelojDeJornada.css'
import { formatearFechaLarga, formatearHora24 } from '../../utilidades/horaColombia'

/**
 * Fecha y hora actuales de Colombia, en grande, como en la pantalla principal del trabajador. Recibe el
 * instante ya leído del reloj; no lo lee ni lo guarda. Es una referencia visual, no una marcación.
 */
export function RelojDeJornada({ ahora }: { ahora: Date }) {
  return (
    <div className="reloj-jornada">
      <span>Hoy, {formatearFechaLarga(ahora)}</span>
      <strong className="reloj-jornada__hora">{formatearHora24(ahora)}</strong>
      <small>(Hora de Colombia)</small>
    </div>
  )
}
