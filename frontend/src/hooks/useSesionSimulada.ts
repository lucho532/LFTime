import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Usuario } from '../modelos/usuario'
import { servicios } from '../servicios/fabrica'
import type { ValorSesion } from './contextoSesion'

/**
 * Estado de la sesión simulada (D9): recupera al abrir la aplicación el usuario de prueba guardado y ofrece
 * `ingresar` y `salir` conectados a `ISesionServicio`. Lo usa solo `ProveedorSesion`; el resto de la
 * interfaz lee la sesión con `useSesion`. No autentica ni autoriza: es solo la demostración.
 */
export function useSesionSimulada(): ValorSesion {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    servicios.sesion.obtenerUsuarioActual().then((actual) => {
      if (activo) {
        setUsuario(actual)
        setCargando(false)
      }
    })
    return () => {
      activo = false
    }
  }, [])

  const ingresar = useCallback(async (usuarioId: string) => {
    const actual = await servicios.sesion.iniciarSesion(usuarioId)
    setUsuario(actual)
    return actual
  }, [])

  const salir = useCallback(async () => {
    await servicios.sesion.cerrarSesion()
    setUsuario(null)
  }, [])

  return useMemo<ValorSesion>(() => ({ usuario, cargando, ingresar, salir }), [usuario, cargando, ingresar, salir])
}
