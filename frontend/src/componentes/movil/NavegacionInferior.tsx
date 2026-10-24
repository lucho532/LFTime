import { NavLink } from 'react-router-dom'
import '../../estilos/componentes/NavegacionInferior.css'
import type { PestanaMovil } from '../../reglas/permisosRuta'
import { Icono } from '../iconos/Icono'

/**
 * Barra de navegación inferior de la aplicación móvil. Marca con texto y color la pestaña activa
 * (`aria-current`). Recibe las pestañas ya resueltas; no decide a qué puede entrar cada rol.
 */
export function NavegacionInferior({ pestanas }: { pestanas: PestanaMovil[] }) {
  return (
    <nav className="navegacion-inferior" aria-label="Navegación principal">
      <ul>
        {pestanas.map((pestana) => (
          <li key={pestana.etiqueta}>
            <NavLink to={pestana.ruta} className={({ isActive }) => `navegacion-inferior__enlace${isActive ? ' navegacion-inferior__enlace--activo' : ''}`}>
              <Icono nombre={pestana.icono} />
              <span>{pestana.etiqueta}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
