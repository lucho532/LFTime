import '../../estilos/componentes/DatosDelHospital.css'
import type { MunicipioDto } from '../../contratos/hospital'
import type { Hospital } from '../../modelos/hospital'

interface PropiedadesDatosDelHospital {
  hospital: Hospital
  municipio: MunicipioDto | undefined
}

/**
 * Datos de un hospital: municipio, dirección, coordenadas actuales y los umbrales de ubicación. El radio
 * y la precisión se rotulan como provisionales (D19, CA-9). Solo muestra; no edita.
 */
export function DatosDelHospital({ hospital, municipio }: PropiedadesDatosDelHospital) {
  const coordenadas = hospital.coordenadas
  return (
    <dl className="datos-del-hospital">
      <dt>Municipio</dt>
      <dd>{municipio ? `${municipio.nombre} (${municipio.departamento})` : 'Sin municipio'}</dd>
      <dt>Dirección</dt>
      <dd>{hospital.direccion}</dd>
      <dt>Coordenadas</dt>
      <dd>{coordenadas?.confirmadas ? `${coordenadas.latitud}, ${coordenadas.longitud}` : 'Sin confirmar'}</dd>
      <dt>Radio permitido para marcar</dt>
      <dd>{hospital.radioPermitidoMetros} m (valor provisional)</dd>
      <dt>Precisión máxima del GPS</dt>
      <dd>{hospital.precisionMaximaMetros} m (valor provisional)</dd>
    </dl>
  )
}
