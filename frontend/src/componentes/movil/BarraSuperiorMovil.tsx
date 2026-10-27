import { Link } from 'react-router-dom'
import '../../estilos/componentes/BarraSuperiorMovil.css'
import { useIncidenciasPropias } from '../../hooks/useIncidenciasPropias'
import { useSesion } from '../../hooks/useSesion'
import { rutaDeFichaDe } from '../../reglas/permisosPersonal'
import { Icono } from '../iconos/Icono'
import { LogoLFTime } from '../iconos/LogoLFTime'

/**
 * Barra superior de la aplicación móvil: la marca a la izquierda y, en la esquina derecha, la campana y el nombre
 * de la persona. La campana lleva a «Mis incidencias» y cuenta las que siguen sin resolver (el trabajador no recibe
 * las alertas de coordinación, P-19, y qué otras notificaciones tendrá sigue abierto). El nombre lleva a su ficha.
 * No muestra la foto de perfil (D41).
 */
export function BarraSuperiorMovil() {
  const { usuario } = useSesion()
  const abiertas = useIncidenciasPropias(usuario?.trabajadorId ?? null)
  if (!usuario) {
    return null
  }
  const nombreCorto = `${usuario.nombres.split(' ')[0]} ${usuario.apellidos.split(' ')[0]}`
  return (
    <header className="barra-superior-movil">
      <LogoLFTime variante="claro" lema={null} tamano={36} />
      <div className="barra-superior-movil__derecha">
        <Link to="/incidencias" className={`barra-superior-movil__campana${abiertas > 0 ? ' barra-superior-movil__campana--con-aviso' : ''}`} aria-label={`Mis incidencias: ${abiertas === 0 ? 'ninguna sin resolver' : `${abiertas} sin resolver`}`}>
          <Icono nombre="campana" />
          {abiertas > 0 && <span className="barra-superior-movil__contador">{abiertas}</span>}
        </Link>
        <Link to={rutaDeFichaDe(usuario)} className="barra-superior-movil__nombre" aria-label={`Abrir mi ficha: ${usuario.nombreCompleto}`}>
          <Icono nombre="usuario" tamano={18} />
          <span>{nombreCorto}</span>
        </Link>
      </div>
    </header>
  )
}
