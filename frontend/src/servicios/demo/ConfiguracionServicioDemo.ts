import type { ReglasProvisionalesDto } from '../../contratos/configuracion'
import { repositorios } from '../../repositorios/demo/repositorios'
import type { IConfiguracionServicio } from '../IConfiguracionServicio'

/**
 * Implementación de demostración de `IConfiguracionServicio`: guarda las reglas provisionales en
 * el almacenamiento local. Valida únicamente que los valores sean números no negativos.
 */
export class ConfiguracionServicioDemo implements IConfiguracionServicio {
  async obtenerReglas(): Promise<ReglasProvisionalesDto> {
    return repositorios.configuracion.obtener()
  }

  async guardarReglas(reglas: ReglasProvisionalesDto): Promise<void> {
    const invalida = Object.entries(reglas).find(([, valor]) => typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0)
    if (invalida) {
      throw new Error(`El valor de «${invalida[0]}» debe ser un número no negativo.`)
    }
    repositorios.configuracion.guardar(reglas)
  }

  async restablecerReglas(): Promise<ReglasProvisionalesDto> {
    return repositorios.configuracion.restablecer()
  }
}
