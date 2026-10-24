import type { DatosUsuario, Usuario } from '../modelos/usuario'

/**
 * Contrato del servicio de usuarios.
 *
 * En la demostración alimenta el ingreso simulado con los usuarios de prueba y guarda los datos
 * personales de administradores y coordinadores. No autentica ni autoriza: el control de acceso de la
 * Fase 1 es solo visual (D27).
 */
export interface IUsuarioServicio {
  listar(): Promise<Usuario[]>
  obtenerPorId(id: string): Promise<Usuario | null>
  /**
   * Actualiza los datos personales de un administrador o coordinador y deja auditoría. No cambia el rol,
   * los hospitales a cargo ni la foto, y rechaza a los usuarios de rol trabajador (sus datos son los de su
   * ficha de trabajador). Rechaza un documento ya registrado por otra persona.
   */
  actualizarDatosPersonales(id: string, datos: DatosUsuario, actorId: string): Promise<Usuario>
}
