import { useSesion } from '../../hooks/useSesion'
import { DisposicionMovil } from '../movil/DisposicionMovil'
import { DisposicionBase } from './DisposicionBase'

/**
 * Elige la disposición de las pantallas con sesión: el trabajador usa la aplicación móvil (barra inferior con
 * Inicio, Historial y Perfil, D40) y la administración y la coordinación, el panel con barra lateral. Es solo
 * una decisión visual; no controla el acceso (D27).
 */
export function DisposicionPorRol() {
  const { usuario } = useSesion()
  return usuario?.rol === 'TRABAJADOR' ? <DisposicionMovil /> : <DisposicionBase />
}
