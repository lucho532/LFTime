import { useEffect, useState } from 'react'
import { obtenerAhoraUtc } from '../utilidades/horaColombia'

/**
 * Segundos transcurridos desde un instante, actualizados cada segundo; `null` si no hay instante.
 * Es solo una ayuda visual mientras la jornada está abierta: los tiempos oficiales salen de las marcas
 * registradas, nunca de este contador (D16). Lee el reloj mediante `horaColombia`.
 */
export function useContador(desde: Date | null): number | null {
  const [ahora, setAhora] = useState(() => obtenerAhoraUtc().getTime())
  useEffect(() => {
    if (!desde) {
      return undefined
    }
    setAhora(obtenerAhoraUtc().getTime())
    const temporizador = window.setInterval(() => setAhora(obtenerAhoraUtc().getTime()), 1000)
    return () => window.clearInterval(temporizador)
  }, [desde])
  return desde ? Math.max(0, (ahora - desde.getTime()) / 1000) : null
}
