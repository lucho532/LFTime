import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import type { ReglasProvisionalesDto } from '../../contratos/configuracion'
import { escribirJson, leerJson } from './almacenamientoLocal'
import { ErrorAlmacenamientoDemo } from './RepositorioColeccionDemo'

const CLAVE = 'configuracion'

/**
 * Repositorio de las reglas provisionales guardadas en el almacenamiento local.
 *
 * Guarda un único objeto de configuración. Si no existe o está dañado, devuelve los valores por
 * defecto. No valida los valores ni decide reglas: eso corresponde a quien los edita.
 */
export class RepositorioConfiguracionDemo {
  /** Devuelve las reglas guardadas, completadas con los valores por defecto para los que falten. */
  obtener(): ReglasProvisionalesDto {
    return { ...REGLAS_PROVISIONALES_POR_DEFECTO, ...leerJson<Partial<ReglasProvisionalesDto>>(CLAVE) }
  }

  /** Guarda las reglas. Lanza `ErrorAlmacenamientoDemo` si no se puede guardar. */
  guardar(reglas: ReglasProvisionalesDto): void {
    const resultado = escribirJson(CLAVE, reglas)
    if (!resultado.exito) {
      throw new ErrorAlmacenamientoDemo(CLAVE, 'no se pudo escribir')
    }
  }

  /** Vuelve a los valores provisionales por defecto y los devuelve. */
  restablecer(): ReglasProvisionalesDto {
    this.guardar({ ...REGLAS_PROVISIONALES_POR_DEFECTO })
    return { ...REGLAS_PROVISIONALES_POR_DEFECTO }
  }
}
