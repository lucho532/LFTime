import { aUsuario } from '../../mapeadores/usuarioMapeador'
import type { Usuario } from '../../modelos/usuario'
import { eliminarClave, escribirJson, leerJson } from '../../repositorios/demo/almacenamientoLocal'
import { repositorios } from '../../repositorios/demo/repositorios'
import type { ISesionServicio } from '../ISesionServicio'

const CLAVE_SESION = 'sesion'

/**
 * Implementación de demostración de `ISesionServicio`: recuerda en el navegador qué usuario de
 * prueba está activo. No guarda contraseñas ni credenciales; no representa seguridad real.
 */
export class SesionServicioDemo implements ISesionServicio {
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    const sesion = leerJson<{ usuarioId: string }>(CLAVE_SESION)
    const dto = sesion ? repositorios.usuarios.obtenerPorId(sesion.usuarioId) : null
    return dto ? aUsuario(dto) : null
  }

  async iniciarSesion(usuarioId: string): Promise<Usuario> {
    const dto = repositorios.usuarios.obtenerPorId(usuarioId)
    if (!dto) {
      throw new Error(`No existe el usuario de prueba «${usuarioId}».`)
    }
    escribirJson(CLAVE_SESION, { usuarioId })
    return aUsuario(dto)
  }

  async cerrarSesion(): Promise<void> {
    eliminarClave(CLAVE_SESION)
  }
}
