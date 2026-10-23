import { aUsuario } from '../../mapeadores/usuarioMapeador'
import type { Usuario } from '../../modelos/usuario'
import { repositorios } from '../../repositorios/demo/repositorios'
import type { IUsuarioServicio } from '../IUsuarioServicio'

/**
 * Implementación de demostración de `IUsuarioServicio`: entrega los usuarios de prueba.
 * No hay contraseñas ni autenticación real.
 */
export class UsuarioServicioDemo implements IUsuarioServicio {
  async listar(): Promise<Usuario[]> {
    return repositorios.usuarios.listar().map(aUsuario)
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const dto = repositorios.usuarios.obtenerPorId(id)
    return dto ? aUsuario(dto) : null
  }
}
