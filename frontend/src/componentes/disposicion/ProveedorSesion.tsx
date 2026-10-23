import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ContextoSesion, type ValorSesion } from '../../hooks/contextoSesion'
import type { Usuario } from '../../modelos/usuario'
import { servicios } from '../../servicios/fabrica'

/**
 * Proveedor de la sesión simulada (D9). Recupera al abrir la aplicación el usuario de prueba
 * guardado y expone `ingresar` y `salir`. No autentica ni autoriza: es solo la demostración.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
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

  const valor = useMemo<ValorSesion>(() => ({ usuario, cargando, ingresar, salir }), [usuario, cargando, ingresar, salir])
  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}
