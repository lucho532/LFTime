import { useState, type FormEvent } from 'react'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'

interface PropiedadesFormularioSolicitudRecuperacion {
  /** Pide el enlace para el correo escrito; devuelve el motivo si no se pudo o `null` si se registró la solicitud. */
  onSolicitar: (correo: string) => Promise<string | null>
  /** Se llama cuando la solicitud quedó registrada. */
  onSolicitado: () => void
  enviando: boolean
}

/**
 * Formulario «¿Olvidaste tu contraseña?»: pide el correo con el que se recibirá el enlace. No valida ni envía:
 * de eso se encargan el hook y el servicio.
 */
export function FormularioSolicitudRecuperacion({ onSolicitar, onSolicitado, enviando }: PropiedadesFormularioSolicitudRecuperacion) {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const motivo = await onSolicitar(correo)
    setError(motivo)
    if (!motivo) onSolicitado()
  }

  return (
    <form className="formulario-recuperacion" onSubmit={enviar} noValidate>
      <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@dominio.com" error={error ?? undefined} />
      <Boton type="submit" cargando={enviando}>
        Enviar enlace de recuperación
      </Boton>
    </form>
  )
}
