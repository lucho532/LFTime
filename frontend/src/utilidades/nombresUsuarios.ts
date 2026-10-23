import type { Usuario } from '../modelos/usuario'

/**
 * Crea una función que devuelve el nombre de una persona a partir de su identificador, para mostrar
 * «quién» en historiales. `sistema` es el actor de las acciones automáticas; un identificador que no
 * se encuentra se muestra como «Persona no disponible» en lugar de fallar.
 */
export function crearNombreDe(usuarios: Usuario[]): (usuarioId: string) => string {
  const porId = new Map(usuarios.map((usuario) => [usuario.id, usuario.nombreCompleto]))
  return (usuarioId) => (usuarioId === 'sistema' ? 'Sistema' : (porId.get(usuarioId) ?? 'Persona no disponible'))
}
