import '../../estilos/componentes/BarraSuperiorMovil.css'
import { LogoLFTime } from '../iconos/LogoLFTime'

/**
 * Barra superior de la aplicación móvil: solo la marca. El trabajador no ve alertas (P-19), por eso no hay
 * campana. No tiene lógica.
 */
export function BarraSuperiorMovil() {
  return (
    <header className="barra-superior-movil">
      <LogoLFTime variante="claro" lema={null} tamano={36} />
    </header>
  )
}
