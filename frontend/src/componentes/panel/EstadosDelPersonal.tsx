import '../../estilos/componentes/EstadosDelPersonal.css'
import { PRESENTACION_ESTADO } from '../base/presentacionEstado'
import { porcentaje, type GrupoEstadoPersonal } from '../../reglas/indicadoresPanel'
import { calcularSegmentosAnillo } from '../../utilidades/segmentosAnillo'

const RADIO = 15.9155

interface PropiedadesEstadosDelPersonal {
  grupos: GrupoEstadoPersonal[]
}

/**
 * «Estados del personal» (HU-01): gráfico de anillo y lista con cada estado, su cantidad y su porcentaje
 * en texto (el color nunca es lo único que informa, D31). Quien hoy no tiene nada esperado aparece como
 * «Sin turno por ahora». Muestra los grupos que recibe; no los calcula.
 */
export function EstadosDelPersonal({ grupos }: PropiedadesEstadosDelPersonal) {
  const total = grupos.reduce((suma, grupo) => suma + grupo.cantidad, 0)
  const segmentos = calcularSegmentosAnillo(grupos)
  return (
    <div className="estados-del-personal">
      <svg viewBox="0 0 36 36" role="img" aria-label={`Estados de ${total} personas`}>
        <circle className="estados-del-personal__fondo" cx="18" cy="18" r={RADIO} />
        {segmentos.map((segmento) => {
          const tono = segmento.clave === 'SIN_TURNO' ? 'gris' : PRESENTACION_ESTADO[segmento.clave].tono
          return (
            <circle
              key={segmento.clave}
              className={`estados-del-personal__segmento estados-del-personal__segmento--${tono}`}
              cx="18"
              cy="18"
              r={RADIO}
              pathLength={100}
              strokeDasharray={`${segmento.largo} ${100 - segmento.largo}`}
              strokeDashoffset={-segmento.inicio}
            />
          )
        })}
        <text x="18" y="18" textAnchor="middle" className="estados-del-personal__total">
          {total}
        </text>
        <text x="18" y="22.5" textAnchor="middle" className="estados-del-personal__rotulo">
          personas
        </text>
      </svg>
      <ul>
        {grupos.map((grupo) => (
          <li key={grupo.clave}>
            <span>{grupo.texto}</span>
            <strong>
              {grupo.cantidad} ({porcentaje(grupo.cantidad, total)} %)
            </strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
