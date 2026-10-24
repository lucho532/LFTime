import { Link } from 'react-router-dom'
import '../../estilos/componentes/TarjetaPersonaMovil.css'
import { Icono, type NombreIconoVisible } from '../iconos/Icono'

interface PropiedadesTarjetaPersonaMovil {
  titulo: string
  subtitulo: string
  icono: NombreIconoVisible
  /** Si se da, la tarjeta es un enlace con flecha. */
  a?: string
  etiquetaEnlace?: string
}

/**
 * Tarjeta de una línea con un icono, un título y un subtítulo (la persona o el hospital en la pantalla
 * principal). Nunca muestra la foto de perfil: esa vive solo en la ficha de cada persona (D41).
 */
export function TarjetaPersonaMovil({ titulo, subtitulo, icono, a, etiquetaEnlace }: PropiedadesTarjetaPersonaMovil) {
  const contenido = (
    <>
      <span className="tarjeta-persona-movil__icono">
        <Icono nombre={icono} />
      </span>
      <span className="tarjeta-persona-movil__textos">
        <strong>{titulo}</strong>
        <small>{subtitulo}</small>
      </span>
      {a && <Icono nombre="derecha" />}
    </>
  )
  return a ? (
    <Link to={a} className="tarjeta-persona-movil" aria-label={etiquetaEnlace}>
      {contenido}
    </Link>
  ) : (
    <div className="tarjeta-persona-movil">{contenido}</div>
  )
}
