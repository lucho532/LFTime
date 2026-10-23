import { useId, type InputHTMLAttributes } from 'react'
import { idsDeCampo } from '../../utilidades/idsDeCampo'
import { CampoEnvoltorio } from './CampoEnvoltorio'

interface PropiedadesCampo extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  etiqueta: string
  ayuda?: string
  error?: string
}

/**
 * Campo de texto (o numérico, de fecha, etc.) con etiqueta, ayuda y error accesibles.
 *
 * Responsabilidad: presentar el control y enlazar sus mensajes. No valida: el error se lo
 * entrega quien lo usa (ver `validadores/`).
 */
export function Campo({ etiqueta, ayuda, error, required, ...resto }: PropiedadesCampo) {
  const id = useId()
  const ids = idsDeCampo(id)
  const descripcion = [ayuda ? ids.ayuda : null, error ? ids.error : null].filter(Boolean).join(' ') || undefined
  return (
    <CampoEnvoltorio id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} obligatorio={required}>
      <input id={id} className="campo__control" required={required} aria-invalid={error ? true : undefined} aria-describedby={descripcion} {...resto} />
    </CampoEnvoltorio>
  )
}
