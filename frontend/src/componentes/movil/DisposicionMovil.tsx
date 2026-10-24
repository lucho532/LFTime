import { Outlet } from 'react-router-dom'
import '../../estilos/componentes/DisposicionMovil.css'
import { useSesion } from '../../hooks/useSesion'
import { pestanasMovilDe } from '../../reglas/permisosRuta'
import { AvisoModoDemo } from '../disposicion/AvisoModoDemo'
import { BarraSuperiorMovil } from './BarraSuperiorMovil'
import { NavegacionInferior } from './NavegacionInferior'

/**
 * Disposición de la aplicación móvil del trabajador (D40): aviso de demostración, barra superior con la
 * marca, el contenido en una columna del ancho de un teléfono y la barra inferior con Inicio, Historial y
 * Perfil. En una pantalla ancha la columna queda centrada. No decide permisos: las pestañas salen de
 * `reglas/permisosRuta`.
 */
export function DisposicionMovil() {
  const { usuario } = useSesion()
  if (!usuario) {
    return null
  }
  return (
    <div className="disposicion-movil">
      <AvisoModoDemo />
      <div className="disposicion-movil__telefono">
        <BarraSuperiorMovil />
        <main className="disposicion-movil__contenido">
          <Outlet />
        </main>
        <NavegacionInferior pestanas={pestanasMovilDe(usuario)} />
      </div>
    </div>
  )
}
