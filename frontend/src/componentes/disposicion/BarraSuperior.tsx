import '../../estilos/componentes/BarraSuperior.css'
import { Icono } from '../iconos/Icono'
import { LogoLFTime } from '../iconos/LogoLFTime'
import { MenuPerfil } from './MenuPerfil'

interface PropiedadesBarraSuperior {
  menuAbierto: boolean
  onAlternarMenu: () => void
  /** Identificador de la barra lateral que controla el botón de menú. */
  idMenu: string
}

/**
 * Barra superior azul oscuro con la marca y el menú del usuario. En pantallas pequeñas añade el
 * botón que abre y cierra la navegación lateral. La campana de alertas se añade en T-9.6.
 */
export function BarraSuperior({ menuAbierto, onAlternarMenu, idMenu }: PropiedadesBarraSuperior) {
  return (
    <header className="barra-superior">
      <button type="button" className="barra-superior__menu" aria-label="Menú de navegación" aria-expanded={menuAbierto} aria-controls={idMenu} onClick={onAlternarMenu}>
        <Icono nombre="menu" />
      </button>
      <LogoLFTime />
      <div className="barra-superior__derecha">
        <MenuPerfil />
      </div>
    </header>
  )
}
