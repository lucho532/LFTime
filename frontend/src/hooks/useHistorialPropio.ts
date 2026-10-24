import { servicios } from '../servicios/fabrica'
import { useCarga } from './useCarga'

/**
 * Hook del historial del trabajador en la aplicación móvil: sus marcaciones e intentos rechazados (por
 * separado, CA-5), sus horarios para mostrar el programado de cada día y los hospitales para nombrar el lugar
 * de cada registro. Solo lee; no calcula duraciones ni modifica nada ya registrado (R-10).
 */
export function useHistorialPropio(trabajadorId: string | null) {
  return useCarga(
    async () => {
      if (!trabajadorId) return null
      const [hospitales, historial, horarios] = await Promise.all([
        servicios.hospitales.listar(),
        servicios.marcaciones.listarHistorial(trabajadorId),
        servicios.horarios.listarPorTrabajador(trabajadorId),
      ])
      return { hospitales, historial, horarios }
    },
    'No se pudo cargar tu historial.',
    [trabajadorId],
  )
}
