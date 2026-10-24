import { Link } from 'react-router-dom'
import '../../estilos/componentes/DesgloseTiempoDebido.css'
import type { DiaDeDeuda } from '../../modelos/informe'
import { textoDiferencia } from '../../reglas/informes/formatoInforme'

interface PropiedadesDesgloseTiempoDebido {
  trabajador: string
  trabajadorId?: string
  dias: DiaDeDeuda[]
}

const clase = (minutos: number) => (minutos < 0 ? 'desglose-deuda__en-contra' : undefined)

function Celda({ minutos }: { minutos: number }) {
  return <td className={clase(minutos)}>{textoDiferencia(minutos)}</td>
}

/**
 * Desglose día por día del tiempo por reponer de un trabajador: cuánto aportó cada día la entrada, el almuerzo y la
 * salida, el total del día y las incidencias de ese día como enlaces. Lo que resta va en rojo y con el signo «−»
 * (R-7). Provisional (P-03, P-05): no es una sanción ni un descuento. Solo muestra; no calcula.
 */
export function DesgloseTiempoDebido({ trabajador, trabajadorId, dias }: PropiedadesDesgloseTiempoDebido) {
  return (
    <div className="desglose-deuda">
      <p>
        Día por día de <strong>{trabajador}</strong>: cada columna dice cuánto sumó (+) o restó (−) al tiempo efectivo. Los tres aportes suman el total del día.
      </p>
      <div className="desglose-deuda__desplazable">
        <table>
          <caption className="desglose-deuda__oculto">Aporte de cada día al tiempo por reponer</caption>
          <thead>
            <tr>
              <th scope="col">Día</th>
              <th scope="col">Entrada</th>
              <th scope="col">Almuerzo</th>
              <th scope="col">Salida</th>
              <th scope="col">Total del día</th>
              <th scope="col">Incidencias</th>
            </tr>
          </thead>
          <tbody>
            {dias.map((dia) => (
              <tr key={dia.fecha}>
                <th scope="row">{dia.fecha}</th>
                <Celda minutos={dia.entradaMinutos} />
                <Celda minutos={dia.almuerzoMinutos} />
                <Celda minutos={dia.salidaMinutos} />
                <td className={`desglose-deuda__total ${clase(dia.totalMinutos) ?? ''}`}>{textoDiferencia(dia.totalMinutos)}</td>
                <td>
                  {dia.incidencias.length === 0
                    ? '—'
                    : dia.incidencias.map((incidencia, posicion) => (
                        <span key={incidencia.id}>
                          {posicion > 0 && ', '}
                          <Link to={`/incidencias/${incidencia.id}`}>{incidencia.texto}</Link>
                        </span>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trabajadorId && <Link to={`/personal/${trabajadorId}`}>Ver ficha y horarios</Link>}
    </div>
  )
}
