import { useCallback, useEffect, useRef, useState } from 'react'

/** Estado de una carga asíncrona de datos. */
export interface ResultadoCarga<T> {
  datos: T | null
  cargando: boolean
  /** Mensaje comprensible si la carga falló; `null` si no hay error. */
  error: string | null
  recargar: () => void
}

/**
 * Hook que ejecuta una carga asíncrona (llamadas a servicios) y expone su estado: cargando, error o
 * datos, con la posibilidad de recargar. Evita actualizar el estado si el componente ya se desmontó.
 * No conoce qué se carga; el mensaje de error de la persona lo da quien lo usa.
 */
export function useCarga<T>(cargar: () => Promise<T>, mensajeError: string, dependencias: unknown[] = []): ResultadoCarga<T> {
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const cargarActual = useRef(cargar)
  cargarActual.current = cargar

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)
    cargarActual.current().then(
      (resultado) => {
        if (activo) {
          setDatos(resultado)
          setCargando(false)
        }
      },
      () => {
        if (activo) {
          setError(mensajeError)
          setCargando(false)
        }
      },
    )
    return () => {
      activo = false
    }
    // La carga se repite cuando cambian las dependencias indicadas o se pide recargar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...dependencias])

  const recargar = useCallback(() => setVersion((anterior) => anterior + 1), [])
  return { datos, cargando, error, recargar }
}
