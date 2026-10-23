import type { ReactNode } from 'react'
import { ContextoSesion } from '../../hooks/contextoSesion'
import { useSesionSimulada } from '../../hooks/useSesionSimulada'

/**
 * Proveedor de la sesión simulada (D9): entrega a toda la interfaz el valor que calcula
 * `useSesionSimulada`. No accede a servicios, no autentica ni autoriza.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const valor = useSesionSimulada()
  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}
