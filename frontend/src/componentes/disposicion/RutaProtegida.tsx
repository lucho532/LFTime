import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'
import { EstadoCarga } from '../estados/EstadoCarga'

/**
 * Ruta que exige haber iniciado sesión (simulada). Sin sesión lleva al ingreso recordando a dónde
 * se quería ir. Es solo visual (D27): no protege nada de verdad.
 */
export function RutaProtegida() {
  const { usuario, cargando } = useSesion()
  const ubicacion = useLocation()
  if (cargando) {
    return <EstadoCarga mensaje="Recuperando la sesión…" />
  }
  if (!usuario) {
    return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname }} />
  }
  return <Outlet />
}
