import type { EstadoDatosDemo } from '../../modelos/estadoDatosDemo'
import { almacenFotos } from '../../repositorios/demo/almacenFotos'
import { asegurarDatosDemo, restablecerDatosDemo } from '../../repositorios/demo/inicializacionDemo'
import type { IDatosDemoServicio } from '../IDatosDemoServicio'

/**
 * Implementación de `IDatosDemoServicio`: consulta y restablece los datos guardados en el navegador.
 * Restablecer vuelve también a los valores provisionales por defecto de las reglas (se borran todas
 * las claves de la demostración) y borra las fotos guardadas en IndexedDB; si el navegador no permite
 * borrarlas, restablece igualmente el resto.
 */
export class DatosDemoServicioDemo implements IDatosDemoServicio {
  async obtenerEstado(): Promise<EstadoDatosDemo> {
    return asegurarDatosDemo()
  }

  async restablecer(): Promise<EstadoDatosDemo> {
    await almacenFotos.eliminarTodas().catch(() => undefined)
    return restablecerDatosDemo()
  }
}
