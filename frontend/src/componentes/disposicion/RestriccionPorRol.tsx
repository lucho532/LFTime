import type { ReactNode } from 'react'
import { useSesion } from '../../hooks/useSesion'
import { PaginaAccesoRestringido } from '../../paginas/PaginaAccesoRestringido'
import { puedeAccederARuta } from '../../reglas/permisosRuta'

interface PropiedadesRestriccionPorRol {
  ruta: string
  children: ReactNode
}

/**
 * Muestra la página solo si el rol de la sesión puede entrar a la ruta según la matriz provisional;
 * si no, muestra la página de acceso no disponible. Es solo visual (D27), no seguridad real.
 */
export function RestriccionPorRol({ ruta, children }: PropiedadesRestriccionPorRol) {
  const { usuario } = useSesion()
  if (!usuario || !puedeAccederARuta(usuario.rol, ruta)) {
    return <PaginaAccesoRestringido />
  }
  return <>{children}</>
}
