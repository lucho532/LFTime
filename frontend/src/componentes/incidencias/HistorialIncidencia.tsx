import type { IncidenciaDto } from '../../contratos/incidencia'
import { TEXTO_ACCION_HISTORIAL, TEXTO_ESTADO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import { formatearFechaCorta, formatearHora12 } from '../../utilidades/horaColombia'
import { ListaHistorial } from '../base/ListaHistorial'

interface PropiedadesHistorialIncidencia {
  incidencia: IncidenciaDto
  nombreDe: (usuarioId: string) => string
}

const cuando = (instante: string) => `${formatearFechaCorta(new Date(instante))} · ${formatearHora12(new Date(instante))}`

/**
 * Justificaciones y historial de una incidencia, del más antiguo al más reciente: quién, cuándo, qué y por
 * qué. El historial es inmutable (R-10): solo se añaden entradas. Solo muestra.
 */
export function HistorialIncidencia({ incidencia, nombreDe }: PropiedadesHistorialIncidencia) {
  const justificaciones = incidencia.justificaciones.map((justificacion) => ({
    id: justificacion.id,
    contenido: (
      <>
        <strong>Justificación de {nombreDe(justificacion.autorId)}</strong>
        <span>{cuando(justificacion.creadaEn)}</span>
        <span>{justificacion.texto}</span>
      </>
    ),
  }))
  const entradas = incidencia.historial.map((entrada) => ({
    id: entrada.id,
    contenido: (
      <>
        <strong>
          {TEXTO_ACCION_HISTORIAL[entrada.accion]}
          {entrada.estadoNuevo && entrada.estadoNuevo !== entrada.estadoAnterior && ` → ${TEXTO_ESTADO_INCIDENCIA[entrada.estadoNuevo]}`}
        </strong>
        <span>
          {nombreDe(entrada.usuarioId)} · {cuando(entrada.instante)}
        </span>
        {entrada.motivo && <span>Motivo: {entrada.motivo}</span>}
      </>
    ),
  }))
  return (
    <div className="historial-incidencia">
      <h3>Justificaciones</h3>
      <ListaHistorial elementos={justificaciones} textoVacio="Nadie ha aportado una justificación todavía." />
      <h3>Historial</h3>
      <ListaHistorial elementos={entradas} textoVacio="Sin entradas en el historial." />
    </div>
  )
}
