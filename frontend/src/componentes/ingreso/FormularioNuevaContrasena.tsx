import { useState, type FormEvent } from 'react'
import { Boton } from '../base/Boton'
import { Campo } from '../base/Campo'

interface PropiedadesFormularioNuevaContrasena {
  /** Guarda la contraseña nueva; devuelve el motivo si no se pudo o `null` si quedó guardada. */
  onGuardar: (nueva: string, confirmacion: string) => Promise<string | null>
  /** Se llama cuando la contraseña quedó guardada. */
  onGuardada: () => void
  enviando: boolean
}

/**
 * Formulario para crear la contraseña nueva a la que se llega desde el enlace del correo. No define reglas de
 * complejidad (pendiente P-24) ni guarda nada: lo hace quien lo usa.
 */
export function FormularioNuevaContrasena({ onGuardar, onGuardada, enviando }: PropiedadesFormularioNuevaContrasena) {
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const motivo = await onGuardar(nueva, confirmacion)
    setError(motivo)
    if (!motivo) onGuardada()
  }

  return (
    <form className="formulario-recuperacion" onSubmit={enviar} noValidate>
      <Campo etiqueta="Contraseña nueva" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
      <Campo etiqueta="Confirma la contraseña nueva" type="password" autoComplete="new-password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} error={error ?? undefined} />
      <Boton type="submit" cargando={enviando}>
        Guardar contraseña nueva
      </Boton>
    </form>
  )
}
