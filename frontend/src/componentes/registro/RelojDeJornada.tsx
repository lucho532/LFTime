import '../../estilos/componentes/RelojDeJornada.css'
import { formatearFechaLarga, formatearHora24 } from '../../utilidades/horaColombia'

/**
 * Fecha y hora actuales de Colombia en una línea, bajo el cronómetro de la pantalla principal del trabajador.
 * Recibe el instante ya leído del reloj; no lo lee ni lo guarda. Es una referencia visual, no una marcación.
 */
export function RelojDeJornada({ ahora }: { ahora: Date }) {
  return (
    <p className="reloj-jornada">
      Hoy, {formatearFechaLarga(ahora)} · <strong className="reloj-jornada__hora">{formatearHora24(ahora)}</strong> (hora de Colombia)
    </p>
  )
}
