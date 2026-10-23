import { useCallback, useState } from 'react'
import type { UbicacionDto } from '../contratos/marcacion'
import { obtenerUbicacionActual, type MotivoFalloUbicacion } from '../utilidades/geolocalizacion'
import { mensajeDeFalloUbicacion } from '../utilidades/mensajesUbicacion'

/** Estado de una solicitud de ubicación. */
export type EstadoUbicacion = 'inactivo' | 'obteniendo' | 'listo' | 'fallo'

/**
 * Hook para pedir la ubicación real del dispositivo (D13).
 *
 * Cada llamada a `solicitar` vuelve a comprobar el permiso y vuelve a pedir la ubicación. Expone el
 * estado, la ubicación obtenida o el motivo del fallo con su mensaje. Nunca sustituye la ubicación
 * por otra. No valida precisión ni radio: eso lo hacen las reglas.
 */
export function useUbicacion() {
  const [estado, setEstado] = useState<EstadoUbicacion>('inactivo')
  const [ubicacion, setUbicacion] = useState<UbicacionDto | null>(null)
  const [motivo, setMotivo] = useState<MotivoFalloUbicacion | null>(null)

  const solicitar = useCallback(async () => {
    setEstado('obteniendo')
    setUbicacion(null)
    setMotivo(null)
    const resultado = await obtenerUbicacionActual()
    if (resultado.exito) {
      setUbicacion(resultado.ubicacion)
      setEstado('listo')
    } else {
      setMotivo(resultado.motivo)
      setEstado('fallo')
    }
    return resultado
  }, [])

  const limpiar = useCallback(() => {
    setEstado('inactivo')
    setUbicacion(null)
    setMotivo(null)
  }, [])

  return { estado, ubicacion, motivo, mensaje: motivo ? mensajeDeFalloUbicacion(motivo) : null, solicitar, limpiar }
}
