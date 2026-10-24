import { Link } from 'react-router-dom'
import '../../estilos/componentes/DetalleDiferenciaJornada.css'
import type { DetalleDiferencia, EnlacesDeFila } from '../../modelos/informe'
import { SIGNO_EN_CONTRA, textoDiferencia } from '../../reglas/informes/formatoInforme'
import { formatearDuracion } from '../../utilidades/formatoDuracion'

interface PropiedadesDetalleDiferenciaJornada {
  detalle: DetalleDiferencia
  enlaces?: EnlacesDeFila
}

const claseDe = (minutos: number) => (minutos < 0 ? 'detalle-diferencia__valor detalle-diferencia__valor--en-contra' : 'detalle-diferencia__valor')

/**
 * Explica de dónde viene la diferencia con lo programado de una jornada: lo programado frente a lo registrado
 * en la entrada, el almuerzo y la salida, cuánto aporta cada momento y el total. Lo que resta va en rojo y con el
 * signo «−» (R-7). Ofrece ir a la ficha de la persona y a las incidencias de ese día. Es un cálculo provisional
 * (P-03, P-05): no es una sanción ni un descuento. Solo muestra; no calcula.
 */
export function DetalleDiferenciaJornada({ detalle, enlaces }: PropiedadesDetalleDiferenciaJornada) {
  return (
    <div className="detalle-diferencia">
      <p className="detalle-diferencia__resumen">
        <strong>{detalle.trabajador}</strong> · {detalle.fecha}. Tiempo efectivo registrado {formatearDuracion(detalle.efectivoMinutos)} frente a {formatearDuracion(detalle.efectivoProgramadoMinutos)} programadas:{' '}
        <strong className={claseDe(detalle.diferenciaMinutos)}>{textoDiferencia(detalle.diferenciaMinutos)}</strong>.
      </p>
      <table className="detalle-diferencia__tabla">
        <caption className="detalle-diferencia__oculto">De dónde viene la diferencia con lo programado</caption>
        <thead>
          <tr>
            <th scope="col">Momento</th>
            <th scope="col">Programado</th>
            <th scope="col">Registrado</th>
            <th scope="col">Aporte</th>
          </tr>
        </thead>
        <tbody>
          {detalle.aportes.map((aporte) => (
            <tr key={aporte.concepto}>
              <th scope="row">
                {aporte.concepto}
                <small>{aporte.descripcion}</small>
              </th>
              <td>{aporte.programado}</td>
              <td>{aporte.registrado}</td>
              <td className={claseDe(aporte.aporteMinutos)}>{textoDiferencia(aporte.aporteMinutos)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              Diferencia total
            </th>
            <td className={claseDe(detalle.diferenciaMinutos)}>{textoDiferencia(detalle.diferenciaMinutos)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="detalle-diferencia__nota">
        Un aporte con el signo {SIGNO_EN_CONTRA} resta tiempo efectivo. Cálculo provisional (P-03 y P-05 abiertos): no es una sanción ni un descuento.
      </p>
      <div className="detalle-diferencia__enlaces">
        {enlaces?.trabajadorId && <Link to={`/personal/${enlaces.trabajadorId}`}>Ver ficha y horarios</Link>}
        {enlaces?.incidencias?.map((incidencia) => (
          <Link key={incidencia.id} to={`/incidencias/${incidencia.id}`}>
            Ver incidencia: {incidencia.texto}
          </Link>
        ))}
      </div>
    </div>
  )
}
