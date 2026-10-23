import type { Usuario } from '../modelos/usuario'

/**
 * Contrato del servicio de sesión.
 *
 * En la demostración simula el inicio de sesión con usuarios de prueba, sin contraseñas (D9).
 * No autentica ni autoriza de verdad: el control de acceso de la Fase 1 es solo visual (D27).
 * En la Fase 2 lo sustituye la autenticación real.
 */
export interface ISesionServicio {
  /** Usuario con sesión iniciada, o `null` si no hay ninguna (o si el usuario ya no existe). */
  obtenerUsuarioActual(): Promise<Usuario | null>
  /** Inicia sesión como el usuario de prueba indicado. Lanza un error si no existe. */
  iniciarSesion(usuarioId: string): Promise<Usuario>
  cerrarSesion(): Promise<void>
}
