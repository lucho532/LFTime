import type { EstadoDatosDemo } from '../modelos/estadoDatosDemo'

/**
 * Contrato del servicio de los datos de demostración.
 *
 * Existe solo en la Fase 1. Informa el estado de los datos guardados y permite restablecerlos.
 * En la Fase 2 desaparece junto con la demostración.
 */
export interface IDatosDemoServicio {
  obtenerEstado(): Promise<EstadoDatosDemo>
  /** Borra los datos guardados (reglas, semillas) y los vuelve a generar relativos a hoy. */
  restablecer(): Promise<EstadoDatosDemo>
}
