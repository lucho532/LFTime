import { useState } from 'react'
import '../../estilos/componentes/RestablecerDatosDemo.css'
import { Aviso } from '../base/Aviso'
import { Boton } from '../base/Boton'

interface PropiedadesRestablecerDatosDemo {
  restableciendo: boolean
  onRestablecer: () => void
}

/**
 * Acción para borrar y volver a generar los datos de demostración. Pide una confirmación explícita porque
 * se pierde todo lo cambiado en este navegador (marcaciones, incidencias, ediciones y fotos). No restablece
 * por sí misma: avisa a quien la usa.
 */
export function RestablecerDatosDemo({ restableciendo, onRestablecer }: PropiedadesRestablecerDatosDemo) {
  const [confirmando, setConfirmando] = useState(false)
  return (
    <div className="restablecer-datos-demo">
      <p>Vuelve a generar los datos ficticios relativos a hoy. Se pierde todo lo registrado o editado en este navegador.</p>
      {confirmando ? (
        <>
          <Aviso tipo="advertencia">¿Seguro? Esta acción no se puede deshacer.</Aviso>
          <div className="restablecer-datos-demo__acciones">
            <Boton variante="peligro" cargando={restableciendo} onClick={onRestablecer}>
              Sí, restablecer los datos
            </Boton>
            <Boton variante="secundario" disabled={restableciendo} onClick={() => setConfirmando(false)}>
              Cancelar
            </Boton>
          </div>
        </>
      ) : (
        <Boton variante="secundario" onClick={() => setConfirmando(true)}>
          Restablecer datos de demostración…
        </Boton>
      )}
    </div>
  )
}
