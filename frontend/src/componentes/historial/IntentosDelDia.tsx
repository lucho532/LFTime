import '../../estilos/componentes/IntentosDelDia.css'
import type { IntentoMarcacionDto } from '../../contratos/marcacion'
import { NOMBRE_MARCACION, TEXTO_MOTIVO_RECHAZO } from '../../modelos/etiquetasMarcacion'
import { formatearHora12 } from '../../utilidades/horaColombia'
import { EnlaceUbicacion } from '../base/EnlaceUbicacion'

/**
 * Intentos de marcación rechazados de un día, **aparte** de los registros válidos (CA-5): evento, hora, causa
 * (un fallo técnico se nombra como tal, CA-14), distancia al hospital y ubicación si hubo. Un intento no es una
 * sanción. Solo muestra; no modifica nada.
 */
export function IntentosDelDia({ intentos }: { intentos: IntentoMarcacionDto[] }) {
  return (
    <ul className="intentos-dia" aria-label="Intentos rechazados del día">
      {intentos.map((intento) => (
        <li key={intento.id} className="intentos-dia__fila">
          <strong>
            {NOMBRE_MARCACION[intento.tipo]} · {formatearHora12(new Date(intento.instante))}
          </strong>
          <span>{TEXTO_MOTIVO_RECHAZO[intento.motivo]}</span>
          {intento.distanciaAlHospitalMetros !== undefined && <small>A {Math.round(intento.distanciaAlHospitalMetros)} m del hospital</small>}
          <small>
            <EnlaceUbicacion ubicacion={intento.ubicacion} />
          </small>
        </li>
      ))}
    </ul>
  )
}
