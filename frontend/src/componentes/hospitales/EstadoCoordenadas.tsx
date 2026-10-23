import type { Hospital } from '../../modelos/hospital'
import { Insignia } from '../base/Insignia'

/**
 * Insignia que dice, con texto, si un hospital tiene coordenadas confirmadas (D25). Sin ellas el
 * hospital no admite marcaciones. No cambia el estado: solo lo muestra.
 */
export function EstadoCoordenadas({ hospital }: { hospital: Pick<Hospital, 'coordenadasConfirmadas'> }) {
  return hospital.coordenadasConfirmadas ? (
    <Insignia texto="Coordenadas confirmadas" tono="verde" icono="✓" />
  ) : (
    <Insignia texto="Sin coordenadas confirmadas" tono="rojo" icono="✕" />
  )
}
