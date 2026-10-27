import { useLocation } from 'react-router-dom'
import { estaCerrada } from '../reglas/permisosIncidencia'
import { servicios } from '../servicios/fabrica'
import { useCarga } from './useCarga'

/**
 * Cuántas incidencias propias siguen sin resolver, para la campana de la aplicación móvil del trabajador. Se
 * vuelve a consultar al cambiar de pantalla. Solo lee: el trabajador no actúa sobre ellas desde aquí. Una
 * incidencia es una anomalía sujeta a revisión, no una sanción (P-18).
 */
export function useIncidenciasPropias(trabajadorId: string | null) {
  const ubicacion = useLocation()
  const carga = useCarga(
    async () => (trabajadorId ? (await servicios.incidencias.listar()).filter((i) => i.trabajadorId === trabajadorId && !estaCerrada(i.estado)).length : 0),
    'No se pudieron cargar tus incidencias.',
    [trabajadorId, ubicacion.key],
  )
  return carga.datos ?? 0
}
