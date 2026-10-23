import { useEffect } from 'react'
import { servicios } from '../servicios/fabrica'
import { useCarga } from './useCarga'

/**
 * Datos del panel de coordinación (HU-01, P-25): carga la foto del panel y la repite cada
 * `intervaloActualizacionSegundos` (configurable, provisional) y cuando la persona pulsa «Actualizar».
 * Mientras recarga conserva lo ya mostrado, para que la tabla no pierda su búsqueda ni su página. No
 * calcula nada: eso lo hace el servicio con las reglas.
 */
export function usePanel() {
  const carga = useCarga(() => servicios.panel.obtenerInstantanea(), 'No se pudo cargar el panel.')
  const segundos = carga.datos?.reglas.intervaloActualizacionSegundos
  const { recargar } = carga

  useEffect(() => {
    if (!segundos || segundos <= 0) return undefined
    const temporizador = setInterval(recargar, segundos * 1000)
    return () => clearInterval(temporizador)
  }, [segundos, recargar])

  return { ...carga, instantanea: carga.datos, segundosEntreActualizaciones: segundos ?? null }
}
