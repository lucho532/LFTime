import { Link } from 'react-router-dom'
import type { IncidenciaDto } from '../../contratos/incidencia'
import { TEXTO_TIPO_INCIDENCIA } from '../../modelos/etiquetasIncidencia'
import type { Hospital } from '../../modelos/hospital'
import type { Trabajador } from '../../modelos/trabajador'
import { Aviso } from '../base/Aviso'

interface PropiedadesBandeja {
  /** Solo las incidencias abiertas de hospitales sin coordinador responsable. */
  incidencias: IncidenciaDto[]
  trabajadores: Trabajador[]
  hospitales: Hospital[]
}

/**
 * Bandeja del administrador con las incidencias «pendientes de asignación» (D28): las de hospitales sin
 * coordinador responsable. Cada una enlaza a su detalle, donde el administrador asigna un revisor o
 * interviene (D29). No asigna nada por sí misma.
 */
export function BandejaPendientesAsignacion({ incidencias, trabajadores, hospitales }: PropiedadesBandeja) {
  if (incidencias.length === 0) {
    return null
  }
  return (
    <Aviso tipo="advertencia" titulo={`${incidencias.length} pendiente${incidencias.length === 1 ? '' : 's'} de asignación`}>
      Estas incidencias no tienen coordinador responsable. Abre cada una para asignar un revisor o intervenir:
      <ul>
        {incidencias.map((incidencia) => (
          <li key={incidencia.id}>
            <Link to={`/incidencias/${incidencia.id}`}>{TEXTO_TIPO_INCIDENCIA[incidencia.tipo]}</Link> ·{' '}
            {trabajadores.find((t) => t.id === incidencia.trabajadorId)?.nombreCompleto ?? 'Persona no disponible'} ·{' '}
            {hospitales.find((h) => h.id === incidencia.hospitalId)?.nombre ?? 'Hospital no disponible'}
          </li>
        ))}
      </ul>
    </Aviso>
  )
}
