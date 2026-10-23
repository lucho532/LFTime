import { useEffect, useState } from 'react'
import type { PropietarioFoto } from '../reglas/permisoFoto'
import { servicios } from '../servicios/fabrica'
import { escucharCambioDeFotos } from '../utilidades/avisoFotos'

/**
 * Hook que carga la foto de una persona como una dirección temporal para mostrarla. Se vuelve a cargar
 * cuando cambia el propietario o cuando alguien cambia o retira una foto. Libera la dirección anterior
 * para no acumular memoria. Si `activo` es falso (sin permiso o sin foto) no lee nada y devuelve `null`.
 * No decide permisos.
 */
export function useUrlFoto(propietario: PropietarioFoto, activo: boolean): string | null {
  const [url, setUrl] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const clave = `${propietario.trabajadorId ?? ''}|${propietario.usuarioId ?? ''}`

  useEffect(() => escucharCambioDeFotos(() => setVersion((anterior) => anterior + 1)), [])

  useEffect(() => {
    let vigente = true
    let creada: string | null = null
    if (!activo) {
      setUrl(null)
      return undefined
    }
    servicios.fotos.obtenerUrl(propietario).then((nueva) => {
      if (vigente) {
        creada = nueva
        setUrl(nueva)
      } else if (nueva) {
        URL.revokeObjectURL(nueva)
      }
    })
    return () => {
      vigente = false
      if (creada) {
        URL.revokeObjectURL(creada)
      }
    }
    // El propietario se identifica por `clave`; se recarga también al cambiar `version` o `activo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, activo, version])

  return url
}
