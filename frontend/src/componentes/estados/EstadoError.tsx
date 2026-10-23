import '../../estilos/componentes/EstadoError.css'
import { Boton } from '../base/Boton'

interface PropiedadesEstadoError {
  mensaje: string
  /** Si se entrega, aparece el botón «Reintentar». */
  onReintentar?: () => void
}

/**
 * Pantalla o bloque de error comprensible, con reintento opcional. Se anuncia como alerta.
 * No muestra detalles técnicos: el mensaje debe estar redactado para la persona usuaria.
 */
export function EstadoError({ mensaje, onReintentar }: PropiedadesEstadoError) {
  return (
    <div className="estado-error" role="alert">
      <p className="estado-error__mensaje">
        <strong>Ocurrió un problema.</strong> {mensaje}
      </p>
      {onReintentar && (
        <Boton variante="secundario" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  )
}
