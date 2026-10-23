import type { Rol } from '../contratos/usuario'

/**
 * Modelo interno de un usuario con sesión.
 *
 * Añade `nombreCompleto` y normaliza las listas y banderas opcionales del contrato.
 * No contiene credenciales. No se envía a la API: para eso existe `UsuarioDto`.
 */
export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  rol: Rol
  trabajadorId: string | null
  hospitalesResponsable: string[]
  puedeVerFotos: boolean
  urlFoto: string | null
  notaDemo: string
}
