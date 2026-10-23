import { useLocation } from 'react-router-dom'
import { servicios } from '../servicios/fabrica'
import { useCarga } from './useCarga'

/**
 * Alertas del panel (HU-07, P-19) para la campana: las más recientes, con el nombre del trabajador, y
 * cuántas siguen sin revisar. Se vuelven a cargar al cambiar de pantalla, que es cuando se marca
 * «revisada» la alerta de una incidencia abierta. Si `activo` es falso (por ejemplo, el trabajador, que
 * no ve alertas) no consulta nada. No crea ni descarta alertas.
 */
export function useAlertas(activo: boolean) {
  const ubicacion = useLocation()
  const carga = useCarga(
    async () => {
      if (!activo) return { alertas: [], trabajadores: [] }
      const [alertas, trabajadores] = await Promise.all([servicios.alertas.listar(), servicios.trabajadores.listar()])
      return { alertas, trabajadores }
    },
    'No se pudieron cargar las alertas.',
    [activo, ubicacion.key],
  )
  const alertas = carga.datos?.alertas ?? []
  return {
    alertas,
    sinRevisar: alertas.filter((alerta) => !alerta.revisada).length,
    nombreDe: (trabajadorId: string) => carga.datos?.trabajadores.find((t) => t.id === trabajadorId)?.nombreCompleto ?? 'Persona no disponible',
    error: carga.error,
  }
}
