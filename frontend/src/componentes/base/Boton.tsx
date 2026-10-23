import type { ButtonHTMLAttributes } from 'react'
import '../../estilos/componentes/Boton.css'

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'texto'
  /** Deshabilita el botón y lo marca como ocupado mientras se completa una acción. */
  cargando?: boolean
}

/**
 * Botón de la aplicación.
 *
 * Representa una acción que dispara la persona. Por defecto es `type="button"` para no enviar
 * formularios por accidente. No contiene lógica de la acción: solo la presenta.
 */
export function Boton({ variante = 'primario', cargando = false, type = 'button', className = '', disabled, children, ...resto }: PropiedadesBoton) {
  return (
    <button
      type={type}
      className={`boton boton--${variante} ${className}`.trim()}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {children}
    </button>
  )
}
