import { useCallback, useEffect, useState } from 'react'
import type { EstadoDatosDemo } from '../modelos/estadoDatosDemo'
import { servicios } from '../servicios/fabrica'

/**
 * Hook que expone la situación de los datos de demostración y la acción de restablecerlos.
 *
 * Responsabilidad: conectar la interfaz con `IDatosDemoServicio`. Tras restablecer recarga la
 * página para que todas las pantallas lean los datos nuevos. No decide qué mostrar.
 */
export function useDatosDemo() {
  const [estado, setEstado] = useState<EstadoDatosDemo | null>(null)
  const [restableciendo, setRestableciendo] = useState(false)

  useEffect(() => {
    let activo = true
    servicios.datosDemo.obtenerEstado().then((resultado) => {
      if (activo) {
        setEstado(resultado)
      }
    })
    return () => {
      activo = false
    }
  }, [])

  const restablecer = useCallback(async () => {
    setRestableciendo(true)
    await servicios.datosDemo.restablecer()
    window.location.reload()
  }, [])

  return { estado, restableciendo, restablecer }
}
