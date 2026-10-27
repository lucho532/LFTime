/**
 * Contrato del servicio de recuperación de acceso por correo electrónico.
 *
 * En la demostración no envía nada ni cambia ninguna contraseña (no existen contraseñas, D9). En la Fase 2 lo
 * sustituye una llamada al backend, que enviará el correo con Brevo; el envío nunca se hará desde el frontend.
 * No decide si un correo existe: la respuesta es la misma haya o no cuenta, para no revelar quién está registrado.
 */
export interface IRecuperacionAccesoServicio {
  /** Pide que se envíe al correo un enlace para crear una contraseña nueva. */
  solicitarEnlace(correo: string): Promise<void>
  /** Crea la contraseña nueva con el código que llegó en el enlace del correo. */
  restablecerContrasena(codigo: string, nuevaContrasena: string): Promise<void>
}
