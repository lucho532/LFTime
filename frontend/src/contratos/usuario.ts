/** Rol de una cuenta de LFTime. */
export type Rol = 'ADMINISTRADOR' | 'COORDINADOR' | 'TRABAJADOR'

/**
 * Contrato de intercambio de un usuario.
 *
 * Representa a quien inicia sesión. Es preliminar: la Fase 2 puede ampliarlo.
 * No contiene contraseñas ni datos de seguridad.
 */
export interface UsuarioDto {
  id: string
  nombres: string
  apellidos: string
  rol: Rol
  /** Trabajador asociado cuando el rol es TRABAJADOR. */
  trabajadorId?: string
  /** Hospitales de los que el coordinador es responsable principal (D28). */
  hospitalesResponsable?: string[]
  /** Administrador con permiso explícito para ver fotos de otros (D24, D30). */
  puedeVerFotos?: boolean
  urlFoto?: string | null
  /** Solo demostración: descripción del usuario de prueba en la pantalla de ingreso. */
  notaDemo?: string
}
