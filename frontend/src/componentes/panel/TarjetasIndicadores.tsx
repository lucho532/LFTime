import { Link } from 'react-router-dom'
import '../../estilos/componentes/TarjetasIndicadores.css'
import { porcentaje, type IndicadoresPanel } from '../../reglas/indicadoresPanel'

interface PropiedadesTarjetasIndicadores {
  indicadores: IndicadoresPanel
}

interface DatosTarjeta {
  titulo: string
  valor: number
  detalle: string
  /** Lista a la que lleva la tarjeta (HU-01: cada indicador lleva a su detalle). */
  enlace: string
  tono: 'neutro' | 'verde' | 'azul' | 'ambar' | 'rojo'
}

const TABLA = '#personal-en-tiempo-real'

/**
 * Tarjetas de indicadores del panel (HU-01). Cada una es un enlace a la lista que la explica: la tabla
 * de personal en tiempo real filtrada, la lista de personal o la de incidencias. Muestra los números que
 * recibe; no los calcula. Los porcentajes son sobre el personal activo.
 */
export function TarjetasIndicadores({ indicadores }: PropiedadesTarjetasIndicadores) {
  const sobreActivos = (valor: number) => `${porcentaje(valor, indicadores.total)} % del personal activo`
  const tarjetas: DatosTarjeta[] = [
    { titulo: 'Personal activo', valor: indicadores.total, detalle: 'Ver personal', enlace: '/personal', tono: 'neutro' },
    { titulo: 'En jornada', valor: indicadores.enJornada, detalle: sobreActivos(indicadores.enJornada), enlace: `/inicio?indicador=enJornada${TABLA}`, tono: 'verde' },
    { titulo: 'En almuerzo', valor: indicadores.enAlmuerzo, detalle: sobreActivos(indicadores.enAlmuerzo), enlace: `/inicio?indicador=enAlmuerzo${TABLA}`, tono: 'azul' },
    { titulo: 'Con retraso', valor: indicadores.conRetraso, detalle: sobreActivos(indicadores.conRetraso), enlace: `/inicio?indicador=conRetraso${TABLA}`, tono: 'ambar' },
    { titulo: 'Sin entrada registrada', valor: indicadores.sinEntrada, detalle: 'Ya pasó su hora de entrada', enlace: `/inicio?indicador=sinEntrada${TABLA}`, tono: 'rojo' },
    { titulo: 'Con incidencias', valor: indicadores.conIncidencias, detalle: `${sobreActivos(indicadores.conIncidencias)} · Ver incidencias`, enlace: '/incidencias', tono: 'rojo' },
  ]
  return (
    <ul className="tarjetas-indicadores" aria-label="Indicadores del día">
      {tarjetas.map((tarjeta) => (
        <li key={tarjeta.titulo}>
          <Link to={tarjeta.enlace} className={`tarjetas-indicadores__tarjeta tarjetas-indicadores__tarjeta--${tarjeta.tono}`}>
            <span className="tarjetas-indicadores__titulo">{tarjeta.titulo}</span>
            <strong className="tarjetas-indicadores__valor">{tarjeta.valor}</strong>
            <span className="tarjetas-indicadores__detalle">{tarjeta.detalle}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
