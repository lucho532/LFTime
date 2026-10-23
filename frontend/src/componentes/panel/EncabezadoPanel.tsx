import '../../estilos/componentes/EncabezadoPanel.css'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import { Boton } from '../base/Boton'

interface PropiedadesEncabezadoPanel {
  nombre: string
  /** Instante (UTC) de la última actualización de los datos. */
  actualizadoEn: Date
  actualizando: boolean
  /** Cada cuántos segundos se actualiza solo; `null` si no se actualiza solo. */
  segundosEntreActualizaciones: number | null
  onActualizar: () => void
}

/**
 * Cabecera del panel (HU-01): saludo, fecha y hora de la última actualización y botón «Actualizar». Indica
 * cada cuánto se actualiza solo (provisional, P-25). La hora que muestra es la de los datos, no la de un
 * reloj en vivo. No carga datos.
 */
export function EncabezadoPanel({ nombre, actualizadoEn, actualizando, segundosEntreActualizaciones, onActualizar }: PropiedadesEncabezadoPanel) {
  return (
    <header className="encabezado-panel">
      <div>
        <h1>Hola, {nombre}</h1>
        <p>Este es el estado actual del personal en los hospitales.</p>
      </div>
      <div className="encabezado-panel__actualizacion">
        <p>
          <strong>{formatearFechaCorta(actualizadoEn)}</strong> · Última actualización: <strong>{formatearHora12(actualizadoEn)}</strong>
        </p>
        <Boton variante="secundario" cargando={actualizando} onClick={onActualizar}>
          Actualizar
        </Boton>
        <small>
          {segundosEntreActualizaciones ? `Se actualiza sola cada ${segundosEntreActualizaciones} s (provisional).` : 'Actualización automática desactivada.'}
        </small>
      </div>
    </header>
  )
}
