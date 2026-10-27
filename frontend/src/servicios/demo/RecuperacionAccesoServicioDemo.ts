import type { IRecuperacionAccesoServicio } from '../IRecuperacionAccesoServicio'

/**
 * Recuperación de acceso de la demostración: no envía correos ni guarda nada, solo deja recorrer las pantallas.
 * No debe aparentar que se envió un correo ni que se cambió una contraseña.
 */
export class RecuperacionAccesoServicioDemo implements IRecuperacionAccesoServicio {
  async solicitarEnlace(): Promise<void> {}

  async restablecerContrasena(): Promise<void> {}
}
