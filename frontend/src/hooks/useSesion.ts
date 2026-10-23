import { useContext } from 'react'
import { ContextoSesion, type ValorSesion } from './contextoSesion'

/**
 * Devuelve la sesión simulada (usuario actual, ingresar y salir).
 * Debe usarse dentro de `ProveedorSesion`; fuera de él lanza un error claro.
 * No decide permisos: para eso existe `reglas/permisosRuta`.
 */
export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion)
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de ProveedorSesion.')
  }
  return valor
}
