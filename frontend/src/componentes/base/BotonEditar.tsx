import '../../estilos/componentes/BotonEditar.css'
import { Icono } from '../iconos/Icono'

interface PropiedadesBotonEditar {
  /** Qué se edita, para el nombre accesible: «Editar datos personales». */
  etiqueta: string
  onClick: () => void
}

/**
 * Botón con un lápiz para editar el contenido de una tarjeta. Es un botón de icono: el nombre accesible y
 * el texto de ayuda dicen siempre qué edita (R-7). No decide quién puede editar: quien lo usa lo muestra
 * solo si corresponde.
 */
export function BotonEditar({ etiqueta, onClick }: PropiedadesBotonEditar) {
  return (
    <button type="button" className="boton-editar" aria-label={etiqueta} title={etiqueta} onClick={onClick}>
      <Icono nombre="lapiz" />
    </button>
  )
}
