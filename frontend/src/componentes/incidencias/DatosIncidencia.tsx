import '../../estilos/componentes/DatosIncidencia.css'
import type { IncidenciaDto } from '../../contratos/incidencia'
import { TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import { Insignia } from '../base/Insignia'
import { InsigniaEstadoIncidencia } from './InsigniaEstadoIncidencia'

interface PropiedadesDatosIncidencia {
  incidencia: IncidenciaDto
  trabajador: string
  hospital: string
  /** Nombre del revisor principal; `null` si no tiene. */
  revisor: string | null
  nombreDe: (usuarioId: string) => string
}

/**
 * Datos principales de una incidencia: tipo, estado, quién, dónde, cuándo, revisor y escalada. Aclara que
 * una incidencia es una anomalía sujeta a revisión y no una sanción (P-18). Solo muestra.
 */
export function DatosIncidencia({ incidencia, trabajador, hospital, revisor, nombreDe }: PropiedadesDatosIncidencia) {
  const detectada = new Date(incidencia.detectadaEn)
  return (
    <div className="datos-incidencia">
      <dl>
        <dt>Tipo</dt>
        <dd>{TEXTO_TIPO_INCIDENCIA[incidencia.tipo]}</dd>
        <dt>Estado</dt>
        <dd>
          <InsigniaEstadoIncidencia estado={incidencia.estado} />
        </dd>
        <dt>Trabajador</dt>
        <dd>{trabajador}</dd>
        <dt>Hospital</dt>
        <dd>{hospital}</dd>
        <dt>Jornada</dt>
        <dd>{incidencia.fechaOperativa}</dd>
        <dt>Detectada</dt>
        <dd>
          {formatearFechaCorta(detectada)} · {formatearHora12(detectada)}
        </dd>
        <dt>Revisor</dt>
        <dd>{revisor ?? <Insignia texto="Pendiente de asignación" tono="ambar" icono="!" />}</dd>
        {incidencia.escalada && (
          <>
            <dt>Escalada</dt>
            <dd>
              Por {nombreDe(incidencia.escalada.escaladaPorId)} al administrador. Motivo: {incidencia.escalada.motivo}
            </dd>
          </>
        )}
      </dl>
      <p className="datos-incidencia__nota">Una incidencia es una anomalía que la coordinación revisa; no es una sanción.</p>
    </div>
  )
}
