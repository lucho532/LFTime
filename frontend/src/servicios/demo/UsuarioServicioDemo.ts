import type { UsuarioDto } from '../../contratos/usuario'
import { aUsuario } from '../../mapeadores/usuarioMapeador'
import type { DatosUsuario, Usuario } from '../../modelos/usuario'
import { repositorios } from '../../repositorios/demo/repositorios'
import { normalizarDocumento, validarDatosPersonales } from '../../validadores/trabajador'
import type { IUsuarioServicio } from '../IUsuarioServicio'
import { registrarAuditoria } from './registrarAuditoria'

/**
 * Implementación de demostración de `IUsuarioServicio`: entrega los usuarios de prueba y guarda los datos
 * personales de administradores y coordinadores con auditoría. No hay contraseñas ni autenticación real, y
 * no decide quién puede editar (D27).
 */
export class UsuarioServicioDemo implements IUsuarioServicio {
  async listar(): Promise<Usuario[]> {
    return repositorios.usuarios.listar().map(aUsuario)
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const dto = repositorios.usuarios.obtenerPorId(id)
    return dto ? aUsuario(dto) : null
  }

  async actualizarDatosPersonales(id: string, datos: DatosUsuario, actorId: string): Promise<Usuario> {
    const actual = repositorios.usuarios.obtenerPorId(id)
    if (!actual) {
      throw new Error('No se encontró al usuario.')
    }
    if (actual.rol === 'TRABAJADOR') {
      throw new Error('Los datos de un trabajador se editan en su ficha de trabajador.')
    }
    if (Object.keys(validarDatosPersonales(datos)).length > 0) {
      throw new Error('Los datos personales no son válidos.')
    }
    const documento = normalizarDocumento(datos.numeroDocumento)
    const repetido =
      repositorios.usuarios.listar().some((u) => u.id !== id && normalizarDocumento(u.numeroDocumento ?? '') === documento) ||
      repositorios.trabajadores.listar().some((t) => normalizarDocumento(t.numeroDocumento) === documento)
    if (repetido) {
      throw new Error('Ya existe una persona registrada con ese documento.')
    }
    const telefono = datos.telefono.trim()
    const actualizado: UsuarioDto = {
      ...actual,
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      tipoDocumento: datos.tipoDocumento,
      numeroDocumento: datos.numeroDocumento.trim(),
      cargo: datos.cargo.trim(),
      telefono: telefono === '' ? undefined : telefono,
    }
    repositorios.usuarios.guardar(actualizado)
    registrarAuditoria({ usuarioId: actorId, accion: 'EDITAR_DATOS_USUARIO', entidad: 'USUARIO', entidadId: id, detalle: 'Datos personales actualizados' })
    return aUsuario(actualizado)
  }
}
