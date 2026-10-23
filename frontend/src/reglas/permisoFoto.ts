import type { Usuario } from '../modelos/usuario'

/** A quién pertenece una foto: puede identificarse por cuenta de usuario o por trabajador. */
export interface PropietarioFoto {
  usuarioId?: string
  trabajadorId?: string
}

/**
 * Regla provisional (spec D20, D24, D30; plan §13, P-21): quién puede ver una foto de perfil.
 *
 * - El propietario siempre ve la suya.
 * - Un coordinador ve las de los trabajadores (en la demo, todos los coordinadores son «autorizados»).
 * - Un administrador la ve solo con permiso explícito (`puedeVerFotos`).
 * - Un trabajador no ve la de otras personas.
 *
 * Es solo visual en la demostración: el control real corresponde al backend. No decide si una foto existe.
 */
export function puedeVerFoto(observador: Usuario | null, propietario: PropietarioFoto): boolean {
  if (!observador) {
    return false
  }
  const esPropietario =
    (propietario.usuarioId !== undefined && propietario.usuarioId === observador.id) ||
    (propietario.trabajadorId !== undefined && propietario.trabajadorId === observador.trabajadorId)
  if (esPropietario) {
    return true
  }
  if (observador.rol === 'COORDINADOR') {
    return true
  }
  return observador.rol === 'ADMINISTRADOR' && observador.puedeVerFotos
}
