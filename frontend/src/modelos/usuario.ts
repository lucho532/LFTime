import type { Rol } from '../contratos/usuario'
import type { DatosPersonales } from './datosPersonales'

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
  /** Datos personales propios; vacíos si es trabajador (sus datos son los de su ficha de trabajador). */
  tipoDocumento: string
  numeroDocumento: string
  cargo: string
  telefono: string
  trabajadorId: string | null
  hospitalesResponsable: string[]
  puedeVerFotos: boolean
  urlFoto: string | null
  notaDemo: string
}

/** Datos personales que edita un administrador o coordinador en su ficha. La foto, el rol y los hospitales no se editan aquí. */
export type DatosUsuario = DatosPersonales
