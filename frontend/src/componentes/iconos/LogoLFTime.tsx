import '../../estilos/componentes/LogoLFTime.css'

/**
 * Marca de LFTime: un reloj dentro de un círculo y el lema «Cada minuto cuenta», como en la
 * referencia visual. Es una representación propia hecha con SVG; no es el arte final del logo.
 */
export function LogoLFTime() {
  return (
    <span className="logo-lftime">
      <svg className="logo-lftime__reloj" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="21" fill="#ffffff" stroke="#1b5fe8" strokeWidth="4" />
        <path d="M24 12v12l8 5" fill="none" stroke="#1b5fe8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="logo-lftime__textos">
        <span className="logo-lftime__nombre">LFTime</span>
        <span className="logo-lftime__lema">Cada minuto cuenta</span>
      </span>
    </span>
  )
}
