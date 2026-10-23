import type { ReglasProvisionalesDto } from '../contratos/configuracion'

/**
 * Contrato del servicio de configuración de las reglas provisionales.
 *
 * Entrega y guarda los valores editables. No valida su sentido de negocio ni los presenta
 * como definitivos.
 */
export interface IConfiguracionServicio {
  obtenerReglas(): Promise<ReglasProvisionalesDto>
  guardarReglas(reglas: ReglasProvisionalesDto): Promise<void>
  restablecerReglas(): Promise<ReglasProvisionalesDto>
}
