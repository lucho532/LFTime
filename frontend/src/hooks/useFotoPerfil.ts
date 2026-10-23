import { useCallback, useState } from 'react'
import type { PropietarioFoto } from '../reglas/permisoFoto'
import { ErrorAlmacenFotos } from '../repositorios/demo/ErrorAlmacenFotos'
import { servicios } from '../servicios/fabrica'
import { notificarCambioDeFotos } from '../utilidades/avisoFotos'
import { prepararFoto } from '../utilidades/comprimirFoto'
import { mensajeDeErrorFoto } from '../utilidades/mensajesFoto'

/** Resultado de la última acción con la foto: un mensaje para la persona. */
export interface MensajeFoto {
  tipo: 'exito' | 'error'
  texto: string
}

/**
 * Hook con las acciones sobre la foto de perfil: subir/cambiar (valida el formato, comprime si pesa más
 * de 2 MB y guarda) y retirar. Convierte cualquier fallo en un mensaje comprensible; la aplicación sigue
 * funcionando sin foto. Avisa a los avatares visibles cuando algo cambia. No decide permisos.
 */
export function useFotoPerfil(propietario: PropietarioFoto) {
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState<MensajeFoto | null>(null)

  const subir = useCallback(
    async (archivo: File): Promise<boolean> => {
      setProcesando(true)
      setMensaje(null)
      try {
        const preparada = await prepararFoto(archivo)
        if (!preparada.exito) {
          setMensaje({ tipo: 'error', texto: preparada.mensaje })
          return false
        }
        await servicios.fotos.guardar(propietario, preparada.foto)
        notificarCambioDeFotos()
        setMensaje({
          tipo: 'exito',
          texto: preparada.fueComprimida ? 'Foto guardada en esta demostración. Se redujo de tamaño para que pese menos de 2 MB.' : 'Foto guardada en esta demostración.',
        })
        return true
      } catch (error) {
        setMensaje({ tipo: 'error', texto: error instanceof ErrorAlmacenFotos ? mensajeDeErrorFoto(error.motivo) : 'No se pudo guardar la foto. Puedes seguir usando la aplicación sin foto.' })
        return false
      } finally {
        setProcesando(false)
      }
    },
    [propietario],
  )

  const retirar = useCallback(async (): Promise<boolean> => {
    setProcesando(true)
    setMensaje(null)
    try {
      await servicios.fotos.retirar(propietario)
      notificarCambioDeFotos()
      setMensaje({ tipo: 'exito', texto: 'Foto retirada. El historial de asistencia no cambió.' })
      return true
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof ErrorAlmacenFotos ? mensajeDeErrorFoto(error.motivo) : 'No se pudo retirar la foto.' })
      return false
    } finally {
      setProcesando(false)
    }
  }, [propietario])

  return { procesando, mensaje, subir, retirar }
}
