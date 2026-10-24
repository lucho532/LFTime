import { Link, useNavigate } from 'react-router-dom'
import '../../estilos/componentes/AccionesDeCuenta.css'
import { useSesion } from '../../hooks/useSesion'
import { useTema } from '../../hooks/useTema'
import { Boton } from '../base/Boton'
import { Icono } from '../iconos/Icono'

/**
 * Accesos de la cuenta del trabajador en su ficha (aplicación móvil): su horario, sus incidencias, el cambio de
 * tema claro u oscuro (D32) y cerrar la sesión de prueba. Sustituye al menú del perfil de la barra superior, que
 * el trabajador no tiene. No decide permisos.
 */
export function AccionesDeCuenta() {
  const { salir } = useSesion()
  const navegar = useNavigate()
  const { tema, alternar } = useTema()

  async function cerrarSesion() {
    await salir()
    navegar('/ingreso')
  }

  return (
    <nav className="acciones-cuenta" aria-label="Mi cuenta">
      <Link to="/jornadas">
        <Icono nombre="jornadas" />
        Mi horario
        <Icono nombre="derecha" />
      </Link>
      <Link to="/incidencias">
        <Icono nombre="incidencias" />
        Mis incidencias
        <Icono nombre="derecha" />
      </Link>
      <Boton variante="secundario" onClick={alternar}>
        {tema === 'claro' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
      </Boton>
      <Boton variante="secundario" onClick={cerrarSesion}>
        Cerrar sesión
      </Boton>
    </nav>
  )
}
