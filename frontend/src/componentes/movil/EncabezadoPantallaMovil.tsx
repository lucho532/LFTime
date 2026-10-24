import '../../estilos/componentes/EncabezadoPantallaMovil.css'
import { Icono } from '../iconos/Icono'

interface PropiedadesEncabezadoPantallaMovil {
  titulo: string
  /** Si se da, aparece la flecha para volver a la pantalla anterior. */
  onAtras?: () => void
}

/** Encabezado de una pantalla interior de la aplicación móvil: flecha de regreso y título. No navega por sí mismo. */
export function EncabezadoPantallaMovil({ titulo, onAtras }: PropiedadesEncabezadoPantallaMovil) {
  return (
    <header className="encabezado-pantalla-movil">
      {onAtras && (
        <button type="button" className="encabezado-pantalla-movil__atras" aria-label="Volver" onClick={onAtras}>
          <Icono nombre="atras" />
        </button>
      )}
      <h1>{titulo}</h1>
    </header>
  )
}
