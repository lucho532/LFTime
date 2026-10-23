import { useId, type SelectHTMLAttributes } from 'react'
import { idsDeCampo } from '../../utilidades/idsDeCampo'
import { CampoEnvoltorio } from './CampoEnvoltorio'

/** Opción de un selector: valor que se guarda y texto que se muestra. */
export interface OpcionSelector {
  valor: string
  etiqueta: string
}

interface PropiedadesSelector extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  etiqueta: string
  opciones: OpcionSelector[]
  /** Texto de la opción vacía inicial; si se omite, no se muestra. */
  textoVacio?: string
  ayuda?: string
  error?: string
}

/**
 * Lista desplegable con etiqueta, ayuda y error accesibles.
 *
 * Responsabilidad: presentar las opciones y enlazar los mensajes. No filtra ni valida.
 */
export function Selector({ etiqueta, opciones, textoVacio, ayuda, error, required, ...resto }: PropiedadesSelector) {
  const id = useId()
  const ids = idsDeCampo(id)
  const descripcion = [ayuda ? ids.ayuda : null, error ? ids.error : null].filter(Boolean).join(' ') || undefined
  return (
    <CampoEnvoltorio id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} obligatorio={required}>
      <select id={id} className="campo__control" required={required} aria-invalid={error ? true : undefined} aria-describedby={descripcion} {...resto}>
        {textoVacio !== undefined && <option value="">{textoVacio}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </CampoEnvoltorio>
  )
}
