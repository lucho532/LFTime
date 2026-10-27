import { useState } from 'react'
import '../../estilos/componentes/AvisoModoDemo.css'
import { useDatosDemo } from '../../hooks/useDatosDemo'
import type { EstadoDatosDemo } from '../../modelos/estadoDatosDemo'

const MENSAJES_DE_ESTADO: Partial<Record<EstadoDatosDemo, string>> = {
  VERSION_DISTINTA: 'Los datos guardados son de otra versión de la demostración. Restablécelos para continuar con datos coherentes.',
  DE_OTRO_DIA: 'Los datos de demostración se generaron otro día. Restablécelos para que sean relativos a hoy.',
  ALMACENAMIENTO_NO_DISPONIBLE: 'Este navegador no permite guardar datos: los cambios se pierden al cerrar la pestaña.',
}

interface PropiedadesAvisoModoDemo {
  /** En el teléfono el aviso es una franja de una línea con un botón «Detalles» para leerlo completo. */
  compacto?: boolean
}

/**
 * Aviso permanente de que la aplicación funciona en modo demostración.
 *
 * Representa la advertencia que exige la constitución (principio 4): los datos son de
 * demostración, se guardan solo en este navegador y nada se valida contra un servidor. Informa
 * si los datos están desactualizados u omitidos y permite restablecerlos. En su versión compacta (teléfono)
 * queda siempre visible como una franja de una línea y se abre solo si hay algo que corregir.
 * No guarda datos ni decide reglas.
 */
export function AvisoModoDemo({ compacto = false }: PropiedadesAvisoModoDemo) {
  const { estado, restableciendo, restablecer } = useDatosDemo()
  const [abierto, setAbierto] = useState(false)
  const mensajeEstado = estado ? MENSAJES_DE_ESTADO[estado] : undefined

  const contenido = (
    <>
      <span>
        <strong>Modo demostración.</strong> Los datos son ficticios y se guardan solo en este navegador. La
        ubicación no se valida contra un servidor y el control de acceso por rol es solo visual.
      </span>
      {mensajeEstado && <span className="aviso-modo-demo__estado">{mensajeEstado}</span>}
      <button type="button" className="aviso-modo-demo__boton" onClick={restablecer} disabled={restableciendo}>
        {restableciendo ? 'Restableciendo…' : 'Restablecer datos de demostración'}
      </button>
    </>
  )
  if (!compacto) {
    return (
      <div className="aviso-modo-demo" role="note">
        {contenido}
      </div>
    )
  }
  const visible = abierto || Boolean(mensajeEstado)
  return (
    <div className="aviso-modo-demo aviso-modo-demo--compacto" role="note">
      <div className="aviso-modo-demo__franja">
        <span>
          <strong>Modo demostración</strong> · datos ficticios
        </span>
        {!mensajeEstado && (
          <button type="button" className="aviso-modo-demo__detalles" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
            {abierto ? 'Ocultar' : 'Detalles'}
          </button>
        )}
      </div>
      {visible && <div className="aviso-modo-demo__detalle">{contenido}</div>}
    </div>
  )
}
