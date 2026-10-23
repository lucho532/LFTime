import '../../estilos/componentes/ResumenJornadaDelDia.css'
import type { MarcacionDto } from '../../contratos/marcacion'
import type { EstadoVisible } from '../../modelos/estadoVisible'
import { NOMBRE_MARCACION } from '../../modelos/etiquetasMarcacion'
import type { DuracionesJornada } from '../../reglas/duraciones'
import { formatearContador, formatearDuracion } from '../../utilidades/formatoDuracion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { InsigniaEstado } from '../base/InsigniaEstado'
import { ListaHistorial } from '../base/ListaHistorial'

interface PropiedadesResumenJornadaDelDia {
  marcaciones: MarcacionDto[]
  duraciones: DuracionesJornada
  estado: EstadoVisible | null
  /** Segundos desde la entrada mientras la jornada está abierta; `null` si no aplica. */
  contadorSegundos: number | null
}

/**
 * Jornada del día del trabajador: estado, lo registrado en orden y los tiempos **separados** (efectivo,
 * almuerzo y total, D21), con «Incompleto» cuando falta una marca (D16). El contador es solo una
 * referencia visual; los tiempos oficiales salen de las marcas. Recibe todo calculado; no tiene reglas.
 */
export function ResumenJornadaDelDia({ marcaciones, duraciones, estado, contadorSegundos }: PropiedadesResumenJornadaDelDia) {
  return (
    <div className="resumen-jornada-dia">
      {estado && (
        <p className="resumen-jornada-dia__estado">
          Estado: <InsigniaEstado estado={estado} />
        </p>
      )}
      {contadorSegundos !== null && (
        <p className="resumen-jornada-dia__contador">
          Tiempo desde tu entrada: <strong>{formatearContador(contadorSegundos)}</strong>
          <small> (referencia; los tiempos oficiales salen de tus registros)</small>
        </p>
      )}
      <ListaHistorial
        textoVacio="Todavía no has registrado nada hoy."
        elementos={marcaciones.map((marcacion) => ({
          id: marcacion.id,
          contenido: (
            <>
              <strong>{NOMBRE_MARCACION[marcacion.tipo]}</strong>
              <span>
                {formatearHora12(new Date(marcacion.instante))} · {Math.round(marcacion.distanciaAlHospitalMetros)} m del hospital
              </span>
            </>
          ),
        }))}
      />
      <dl className="resumen-jornada-dia__tiempos">
        <dt>Tiempo efectivo</dt>
        <dd>{formatearDuracion(duraciones.efectivoMinutos)}</dd>
        <dt>Tiempo de almuerzo</dt>
        <dd>{formatearDuracion(duraciones.almuerzoMinutos)}</dd>
        <dt>Total de la jornada</dt>
        <dd>{formatearDuracion(duraciones.totalMinutos)}</dd>
      </dl>
    </div>
  )
}
