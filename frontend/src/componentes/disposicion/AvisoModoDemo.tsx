import '../../estilos/componentes/AvisoModoDemo.css'
import { useDatosDemo } from '../../hooks/useDatosDemo'
import type { EstadoDatosDemo } from '../../modelos/estadoDatosDemo'

const MENSAJES_DE_ESTADO: Partial<Record<EstadoDatosDemo, string>> = {
  VERSION_DISTINTA: 'Los datos guardados son de otra versión de la demostración. Restablécelos para continuar con datos coherentes.',
  DE_OTRO_DIA: 'Los datos de demostración se generaron otro día. Restablécelos para que sean relativos a hoy.',
  ALMACENAMIENTO_NO_DISPONIBLE: 'Este navegador no permite guardar datos: los cambios se pierden al cerrar la pestaña.',
}

/**
 * Aviso permanente de que la aplicación funciona en modo demostración.
 *
 * Representa la advertencia que exige la constitución (principio 4): los datos son de
 * demostración, se guardan solo en este navegador y nada se valida contra un servidor. Informa
 * si los datos están desactualizados u omitidos y permite restablecerlos.
 * No guarda datos ni decide reglas.
 */
export function AvisoModoDemo() {
  const { estado, restableciendo, restablecer } = useDatosDemo()
  const mensajeEstado = estado ? MENSAJES_DE_ESTADO[estado] : undefined

  return (
    <div className="aviso-modo-demo" role="note">
      <span>
        <strong>Modo demostración.</strong> Los datos son ficticios y se guardan solo en este navegador. La
        ubicación no se valida contra un servidor y el control de acceso por rol es solo visual.
      </span>
      {mensajeEstado && <span className="aviso-modo-demo__estado">{mensajeEstado}</span>}
      <button type="button" className="aviso-modo-demo__boton" onClick={restablecer} disabled={restableciendo}>
        {restableciendo ? 'Restableciendo…' : 'Restablecer datos de demostración'}
      </button>
    </div>
  )
}
