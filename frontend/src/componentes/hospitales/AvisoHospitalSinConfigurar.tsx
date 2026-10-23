import type { Hospital } from '../../modelos/hospital'
import { Aviso } from '../base/Aviso'

/**
 * Aviso de que el hospital necesita configuración antes de habilitar el registro (D25, CA-6, CA-11).
 * No se dibuja si las coordenadas ya están confirmadas. Solo informa: no bloquea nada por sí mismo.
 */
export function AvisoHospitalSinConfigurar({ hospital }: { hospital: Pick<Hospital, 'coordenadasConfirmadas'> }) {
  if (hospital.coordenadasConfirmadas) {
    return null
  }
  return (
    <Aviso tipo="advertencia" titulo="Hospital sin configurar">
      Este hospital necesita configuración antes de habilitar el registro: no admite marcaciones hasta que se confirmen sus coordenadas. El personal asignado no podrá registrar su jornada aquí mientras tanto.
    </Aviso>
  )
}
