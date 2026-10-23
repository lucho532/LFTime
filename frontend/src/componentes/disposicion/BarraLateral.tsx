import { NavLink } from 'react-router-dom'
import '../../estilos/componentes/BarraLateral.css'
import type { EntradaMenuDeRol } from '../../reglas/permisosRuta'
import { Icono } from '../iconos/Icono'

interface PropiedadesBarraLateral {
  id: string
  entradas: EntradaMenuDeRol[]
  /** En pantallas pequeñas la barra se muestra solo si está abierta. */
  abierta: boolean
}

/**
 * Navegación lateral azul oscuro con las entradas que corresponden al rol (según la matriz
 * provisional). Marca la página actual con `aria-current` y color. Solo navega: no decide permisos.
 */
export function BarraLateral({ id, entradas, abierta }: PropiedadesBarraLateral) {
  return (
    <nav id={id} className={`barra-lateral ${abierta ? 'barra-lateral--abierta' : ''}`.trim()} aria-label="Navegación principal">
      <ul className="barra-lateral__lista">
        {entradas.map((entrada) => (
          <li key={entrada.ruta}>
            <NavLink to={`/${entrada.ruta}`} className="barra-lateral__enlace">
              <Icono nombre={entrada.icono} />
              <span>{entrada.etiqueta}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="barra-lateral__pie">
        <strong>LFTime</strong>
        <span>Control de jornadas y personal</span>
        <span>Fase 1 · demostración</span>
      </p>
    </nav>
  )
}
