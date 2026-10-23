import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../estilos/componentes/MenuAlertas.css'
import { useAlertas } from '../../hooks/useAlertas'
import { useSesion } from '../../hooks/useSesion'
import { TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import { Icono } from '../iconos/Icono'

const ALERTAS_VISIBLES = 6

/**
 * Campana de alertas de la barra superior (HU-07, P-19) para coordinación y administración: muestra
 * cuántas alertas siguen sin revisar y las más recientes, cada una con el texto «Sin revisar» o
 * «Revisada» (no solo color) y un enlace a su incidencia. El trabajador no ve alertas. Las alertas no se
 * descartan: se revisan al abrir su incidencia. Se cierra con Escape o al pulsar fuera.
 */
export function MenuAlertas() {
  const { usuario } = useSesion()
  const veAlertas = usuario !== null && usuario.rol !== 'TRABAJADOR'
  const { alertas, sinRevisar, nombreDe } = useAlertas(veAlertas)
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const idLista = useId()

  useEffect(() => {
    if (!abierto) return undefined
    const cerrarSiFuera = (evento: MouseEvent) => !contenedor.current?.contains(evento.target as Node) && setAbierto(false)
    const cerrarConEscape = (evento: KeyboardEvent) => evento.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', cerrarSiFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarSiFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierto])

  if (!veAlertas) {
    return null
  }
  return (
    <div className="menu-alertas" ref={contenedor}>
      <button
        type="button"
        className="menu-alertas__boton"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-label={`Alertas: ${sinRevisar === 0 ? 'ninguna sin revisar' : `${sinRevisar} sin revisar`}`}
        onClick={() => setAbierto(!abierto)}
      >
        <Icono nombre="campana" />
        {sinRevisar > 0 && <span className="menu-alertas__contador">{sinRevisar}</span>}
      </button>
      {abierto && (
        <div id={idLista} className="menu-alertas__panel">
          <p className="menu-alertas__titulo">{sinRevisar === 0 ? 'No hay alertas sin revisar' : `${sinRevisar} alerta${sinRevisar === 1 ? '' : 's'} sin revisar`}</p>
          <ul>
            {alertas.slice(0, ALERTAS_VISIBLES).map((alerta) => (
              <li key={alerta.id}>
                <Link to={`/incidencias/${alerta.incidenciaId}`} onClick={() => setAbierto(false)}>
                  {TEXTO_TIPO_INCIDENCIA[alerta.tipo]} · {nombreDe(alerta.trabajadorId)}
                </Link>
                <span>
                  {alerta.revisada ? 'Revisada' : 'Sin revisar'} · {formatearFechaCorta(new Date(alerta.creadaEn))} {formatearHora12(new Date(alerta.creadaEn))}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/incidencias" onClick={() => setAbierto(false)}>
            Ver todas las incidencias
          </Link>
        </div>
      )}
    </div>
  )
}
