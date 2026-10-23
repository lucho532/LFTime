import type { Usuario } from '../modelos/usuario'

/**
 * Contrato del servicio de usuarios.
 *
 * En la demostración alimenta el ingreso simulado con los usuarios de prueba. No autentica ni
 * autoriza: el control de acceso de la Fase 1 es solo visual (D27).
 */
export interface IUsuarioServicio {
  listar(): Promise<Usuario[]>
  obtenerPorId(id: string): Promise<Usuario | null>
}
