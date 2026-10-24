import '../../estilos/componentes/LogoLFTime.css'

interface PropiedadesLogoLFTime {
  /** `claro` es para fondos claros (aplicación móvil): nombre en azul y, opcional, otro lema. */
  variante?: 'oscuro' | 'claro'
  /** Texto bajo el nombre; por defecto «Cada minuto cuenta». Con `null` no se muestra. */
  lema?: string | null
  tamano?: number
}

/**
 * Marca de LFTime: un reloj dentro de un círculo y un lema (por defecto «Cada minuto cuenta»), como en la
 * referencia visual. Es una representación propia hecha con SVG; no es el arte final del logo.
 */
export function LogoLFTime({ variante = 'oscuro', lema = 'Cada minuto cuenta', tamano = 44 }: PropiedadesLogoLFTime) {
  return (
    <span className={`logo-lftime logo-lftime--${variante}`}>
      <svg className="logo-lftime__reloj" viewBox="0 0 48 48" width={tamano} height={tamano} aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="21" fill="#ffffff" stroke="#1b5fe8" strokeWidth="4" />
        <path d="M24 12v12l8 5" fill="none" stroke="#1b5fe8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="logo-lftime__textos">
        <span className="logo-lftime__nombre">LFTime</span>
        {lema !== null && <span className="logo-lftime__lema">{lema}</span>}
      </span>
    </span>
  )
}
