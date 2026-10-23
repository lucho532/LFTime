import type { Usuario } from '../modelos/usuario'
import type { PropietarioFoto } from './permisoFoto'

/**
 * Regla provisional (plan §13, P-21): quién crea y edita trabajadores y sus datos. El administrador y el
 * coordinador gestionan el personal. Es solo visual en la demostración (D27).
 */
export function puedeGestionarPersonal(usuario: Usuario | null): boolean {
  return usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR'
}

/**
 * Regla provisional: quién edita los horarios (D15). Los asigna y edita el **coordinador**; el
 * administrador los consulta y el trabajador solo ve el suyo. Solo visual.
 */
export function puedeEditarHorarios(usuario: Usuario | null): boolean {
  return usuario?.rol === 'COORDINADOR'
}

/** Regla provisional: un trabajador solo abre su propia ficha; administración y coordinación abren cualquiera. */
export function puedeVerFichaDe(usuario: Usuario | null, trabajadorId: string): boolean {
  if (!usuario) {
    return false
  }
  return usuario.rol !== 'TRABAJADOR' || usuario.trabajadorId === trabajadorId
}

/**
 * Regla provisional (D14): todo usuario puede poner su propia foto de perfil. Nadie cambia la foto de otra
 * persona, ni siquiera quien gestiona el personal. Solo visual.
 */
export function puedeCambiarFoto(usuario: Usuario | null, propietario: PropietarioFoto): boolean {
  if (!usuario) {
    return false
  }
  return (
    (propietario.usuarioId !== undefined && propietario.usuarioId === usuario.id) ||
    (propietario.trabajadorId !== undefined && propietario.trabajadorId === usuario.trabajadorId)
  )
}
