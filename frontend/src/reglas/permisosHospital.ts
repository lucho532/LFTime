import type { Usuario } from '../modelos/usuario'

/**
 * Regla provisional (spec D12, D22, D28; plan §13, P-21): quién puede editar hospitales y sus
 * coordenadas. El coordinador registra hospitales y confirma sus coordenadas.
 * Es solo visual en la demostración: el control real corresponde al backend.
 */
export function puedeEditarHospital(usuario: Usuario | null): boolean {
  return usuario?.rol === 'COORDINADOR'
}

/**
 * Regla provisional (spec D28): quién puede cambiar el coordinador responsable de un hospital.
 * Se asigna a un administrador «autorizado»; en la demostración, todos los administradores lo están.
 * Qué significa «autorizado» en producción sigue abierto (P-28). Es solo visual.
 */
export function puedeAsignarCoordinador(usuario: Usuario | null): boolean {
  return usuario?.rol === 'ADMINISTRADOR'
}
