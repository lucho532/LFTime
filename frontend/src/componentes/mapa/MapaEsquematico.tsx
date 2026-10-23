import { useNavigate } from 'react-router-dom'
import '../../estilos/componentes/MapaEsquematico.css'
import type { Hospital } from '../../modelos/hospital'
import { proyectarPuntos } from '../../utilidades/proyeccionMapa'

const ANCHO = 520
const ALTO = 320
const MARGEN = 56

interface PropiedadesMapaEsquematico {
  hospitales: Hospital[]
}

/**
 * Mapa esquemático y local de los hospitales (spec D18): un lienzo SVG con un marcador por hospital
 * con coordenadas confirmadas. Es ilustrativo, no cartográfico, y no consulta ningún servicio externo.
 * Los marcadores abren la ficha del hospital; los hospitales sin coordenadas confirmadas no se dibujan
 * y se listan aparte. No modifica hospitales.
 */
export function MapaEsquematico({ hospitales }: PropiedadesMapaEsquematico) {
  const navegar = useNavigate()
  const conCoordenadas = hospitales.filter((h) => h.coordenadasConfirmadas && h.coordenadas)
  const sinCoordenadas = hospitales.filter((h) => !h.coordenadasConfirmadas)
  const posiciones = proyectarPuntos(
    conCoordenadas.map((h) => ({ id: h.id, latitud: h.coordenadas!.latitud, longitud: h.coordenadas!.longitud })),
    ANCHO,
    ALTO,
    MARGEN,
  )

  return (
    <div className="mapa-esquematico">
      <svg className="mapa-esquematico__lienzo" viewBox={`0 0 ${ANCHO} ${ALTO}`} role="group" aria-label="Mapa esquemático de hospitales">
        <rect width={ANCHO} height={ALTO} className="mapa-esquematico__fondo" />
        {[1, 2, 3].map((i) => (
          <g key={i} className="mapa-esquematico__rejilla" aria-hidden="true">
            <line x1={(ANCHO / 4) * i} y1="0" x2={(ANCHO / 4) * i} y2={ALTO} />
            <line x1="0" y1={(ALTO / 4) * i} x2={ANCHO} y2={(ALTO / 4) * i} />
          </g>
        ))}
        {conCoordenadas.map((hospital) => {
          const punto = posiciones.get(hospital.id)!
          const abrir = () => navegar(`/hospitales/${hospital.id}`)
          return (
            <g
              key={hospital.id}
              className="mapa-esquematico__marcador"
              transform={`translate(${punto.x} ${punto.y})`}
              role="link"
              tabIndex={0}
              aria-label={`Hospital ${hospital.nombre}`}
              onClick={abrir}
              onKeyDown={(evento) => (evento.key === 'Enter' || evento.key === ' ') && abrir()}
            >
              <circle r="9" />
              <text x="14" y="4">
                {hospital.nombre}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mapa-esquematico__nota">Mapa ilustrativo: muestra la posición relativa de los hospitales, no es cartografía.</p>
      {sinCoordenadas.length > 0 && (
        <div className="mapa-esquematico__pendientes">
          <strong>Sin coordenadas confirmadas (no aparecen en el mapa):</strong>
          <ul>
            {sinCoordenadas.map((hospital) => (
              <li key={hospital.id}>{hospital.nombre}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
