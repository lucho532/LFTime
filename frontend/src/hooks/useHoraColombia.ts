import { useEffect, useState } from 'react'
import { obtenerAhoraUtc } from '../utilidades/horaColombia'

/**
 * Instante actual (UTC), refrescado cada pocos segundos, para mostrar el reloj de la pantalla principal
 * del trabajador. Es solo una ayuda visual: ninguna marcación toma su hora de aquí, sino del reloj al
 * registrar. Lee el reloj mediante `horaColombia` (R-9).
 */
export function useHoraColombia(segundosEntreActualizaciones = 5): Date {
  const [ahora, setAhora] = useState(() => obtenerAhoraUtc())
  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(obtenerAhoraUtc()), segundosEntreActualizaciones * 1000)
    return () => window.clearInterval(temporizador)
  }, [segundosEntreActualizaciones])
  return ahora
}
