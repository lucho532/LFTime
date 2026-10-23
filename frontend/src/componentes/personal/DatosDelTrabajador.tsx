import '../../estilos/componentes/DatosDelTrabajador.css'
import type { MunicipioDto } from '../../contratos/hospital'
import type { Hospital } from '../../modelos/hospital'
import type { Trabajador } from '../../modelos/trabajador'
import { InsigniaEstadoTrabajador } from './InsigniaEstadoTrabajador'

interface PropiedadesDatosDelTrabajador {
  trabajador: Trabajador
  hospital: Hospital | undefined
  municipio: MunicipioDto | undefined
}

/**
 * Datos personales de un trabajador: documento, cargo, contacto, hospital, municipio y estado. Solo los
 * datos estrictamente necesarios (P-13). Solo muestra; no edita.
 */
export function DatosDelTrabajador({ trabajador, hospital, municipio }: PropiedadesDatosDelTrabajador) {
  return (
    <dl className="datos-del-trabajador">
      <dt>Documento</dt>
      <dd>
        {trabajador.tipoDocumento} {trabajador.numeroDocumento}
      </dd>
      <dt>Cargo o servicio</dt>
      <dd>{trabajador.cargo}</dd>
      <dt>Teléfono</dt>
      <dd>{trabajador.telefono ?? 'No registrado'}</dd>
      <dt>Hospital</dt>
      <dd>{hospital?.nombre ?? 'Sin hospital'}</dd>
      <dt>Municipio</dt>
      <dd>{municipio?.nombre ?? 'Sin municipio'}</dd>
      <dt>Estado</dt>
      <dd>
        <InsigniaEstadoTrabajador estado={trabajador.estado} />
      </dd>
    </dl>
  )
}
