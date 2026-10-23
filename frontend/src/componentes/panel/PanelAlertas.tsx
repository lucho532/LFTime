import { Link } from 'react-router-dom'
import '../../estilos/componentes/PanelAlertas.css'
import type { AlertaVisible } from '../../modelos/alerta'
import { TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import type { FilaPersonalEnVivo } from '../../modelos/panel'
import { contarAlertasSinRevisar, ordenarAlertasParaPanel } from '../../reglas/indicadoresPanel'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { EstadoVacio } from '../estados/EstadoVacio'

const ALERTAS_VISIBLES = 5

interface PropiedadesPanelAlertas {
  alertas: AlertaVisible[]
  filas: FilaPersonalEnVivo[]
}

/**
 * Panel «Alertas e incidencias» (HU-01, HU-07): las alertas más recientes, las sin revisar primero, cada
 * una con el texto «Sin revisar» o «Revisada» (no solo color) y un enlace a su incidencia. Las alertas no se
 * descartan: se revisan al abrir la incidencia. No crea ni cambia alertas.
 */
export function PanelAlertas({ alertas, filas }: PropiedadesPanelAlertas) {
  if (alertas.length === 0) {
    return <EstadoVacio titulo="Sin alertas" descripcion="Todavía no se ha detectado ninguna incidencia." />
  }
  const sinRevisar = contarAlertasSinRevisar(alertas)
  const ordenadas = ordenarAlertasParaPanel(alertas)
  const filaDe = (trabajadorId: string) => filas.find((f) => f.trabajador.id === trabajadorId)
  return (
    <div className="panel-alertas">
      <p className="panel-alertas__resumen">{sinRevisar === 0 ? 'No hay alertas sin revisar.' : `${sinRevisar} alerta${sinRevisar === 1 ? '' : 's'} sin revisar.`}</p>
      <ul>
        {ordenadas.slice(0, ALERTAS_VISIBLES).map((alerta) => {
          const persona = filaDe(alerta.trabajadorId)
          return (
            <li key={alerta.id} className={alerta.revisada ? 'panel-alertas__alerta' : 'panel-alertas__alerta panel-alertas__alerta--sin-revisar'}>
              <Link to={`/incidencias/${alerta.incidenciaId}`}>{TEXTO_TIPO_INCIDENCIA[alerta.tipo]}</Link>
              <span>
                {persona?.trabajador.nombreCompleto ?? 'Persona no disponible'} — {persona?.hospitalNombre ?? 'Hospital no disponible'}
              </span>
              <small>
                {alerta.revisada ? 'Revisada' : 'Sin revisar'} · {formatearHora12(new Date(alerta.creadaEn))}
              </small>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
