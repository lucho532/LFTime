import type { ReactNode } from 'react'
import '../../estilos/componentes/CampoEnvoltorio.css'
import { idsDeCampo } from '../../utilidades/idsDeCampo'

interface PropiedadesCampoEnvoltorio {
  id: string
  etiqueta: string
  ayuda?: string
  error?: string
  obligatorio?: boolean
  children: ReactNode
}

/**
 * Envoltorio común de los campos de formulario: etiqueta, control, ayuda y mensaje de error.
 *
 * Su responsabilidad es la presentación y la asociación accesible de etiqueta y mensajes.
 * No valida valores: quien lo usa decide cuándo hay un error.
 */
export function CampoEnvoltorio({ id, etiqueta, ayuda, error, obligatorio, children }: PropiedadesCampoEnvoltorio) {
  const ids = idsDeCampo(id)
  return (
    <div className="campo">
      <label htmlFor={id} className="campo__etiqueta">
        {etiqueta}
        {obligatorio && <span className="campo__obligatorio"> (obligatorio)</span>}
      </label>
      {children}
      {ayuda && (
        <p id={ids.ayuda} className="campo__ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={ids.error} className="campo__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
