import '../../estilos/componentes/ResumenPorHospital.css'
import type { ResumenHospital } from '../../reglas/indicadoresPanel'
import { EstadoVacio } from '../estados/EstadoVacio'

interface PropiedadesResumenPorHospital {
  resumen: ResumenHospital[]
}

/**
 * «Resumen por hospital» (HU-01): por cada hospital, cuántos de los esperados hoy ya registraron su
 * entrada, como texto «presentes / esperados» y como barra. Recibe los números calculados; no los deriva.
 */
export function ResumenPorHospital({ resumen }: PropiedadesResumenPorHospital) {
  if (resumen.length === 0) {
    return <EstadoVacio titulo="Sin hospitales" descripcion="Todavía no hay hospitales registrados." />
  }
  return (
    <ul className="resumen-por-hospital">
      {resumen.map((hospital) => (
        <li key={hospital.hospitalId}>
          <p>
            <span>
              {hospital.nombre} ({hospital.municipio})
            </span>
            <strong>
              {hospital.presentes} / {hospital.esperados}
            </strong>
          </p>
          <meter
            min={0}
            max={Math.max(hospital.esperados, 1)}
            value={hospital.presentes}
            aria-label={`${hospital.nombre}: ${hospital.presentes} de ${hospital.esperados} esperados con entrada registrada`}
          />
        </li>
      ))}
    </ul>
  )
}
