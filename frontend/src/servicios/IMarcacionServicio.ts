import type { TipoMarcacion } from '../contratos/marcacion'
import type { HistorialMarcaciones, JornadaDelDia, ResultadoRegistro } from '../modelos/jornada'
import type { IntentoDeUbicacion } from '../reglas/evaluarMarcacion'

/**
 * Contrato del servicio de marcaciones.
 *
 * Registra los eventos de la jornada con la ubicación que entrega el dispositivo y guarda aparte los
 * intentos rechazados. En la Fase 1 la validación la hace la demostración en el navegador; en la Fase 2
 * la hará el servidor y la ubicación seguirá siendo solo «capturada». No simula ubicaciones, no corrige
 * marcaciones (T-9.7 está bloqueada por P-12) y no modifica nada ya registrado (R-10).
 */
export interface IMarcacionServicio {
  /** Jornada de «ahora» del trabajador: la fecha operativa que le corresponde y lo registrado en ella. */
  obtenerJornadaActual(trabajadorId: string): Promise<JornadaDelDia>
  /** Todo lo registrado por el trabajador, marcaciones e intentos por separado, lo más reciente primero. */
  listarHistorial(trabajadorId: string): Promise<HistorialMarcaciones>
  /**
   * Intenta registrar un evento para el trabajador. `intento` es la ubicación obtenida del dispositivo
   * o el motivo técnico por el que no hubo; nunca una ubicación inventada.
   */
  registrar(trabajadorId: string, tipo: TipoMarcacion, intento: IntentoDeUbicacion): Promise<ResultadoRegistro>
}
