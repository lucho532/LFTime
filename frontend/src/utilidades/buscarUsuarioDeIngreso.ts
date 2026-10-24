import type { Trabajador } from '../modelos/trabajador'
import type { Usuario } from '../modelos/usuario'

const soloDigitos = (texto: string) => texto.replace(/\D/g, '')

/**
 * Busca el usuario de prueba que corresponde a lo escrito en «Usuario o cédula» del ingreso simulado (D9).
 * Compara el número de documento sin puntos ni espacios con el de cada usuario y, para los trabajadores, con el
 * de su ficha. Es solo una comodidad de la demostración: no autentica ni valida contraseñas. Devuelve `null`
 * si no hay coincidencia exacta o si el texto no tiene dígitos.
 */
export function buscarUsuarioDeIngreso(texto: string, usuarios: Usuario[], trabajadores: Trabajador[]): Usuario | null {
  const buscado = soloDigitos(texto)
  if (buscado === '') {
    return null
  }
  return (
    usuarios.find((usuario) => {
      const documento = usuario.trabajadorId ? trabajadores.find((t) => t.id === usuario.trabajadorId)?.numeroDocumento : usuario.numeroDocumento
      return documento !== undefined && soloDigitos(documento) === buscado
    }) ?? null
  )
}
