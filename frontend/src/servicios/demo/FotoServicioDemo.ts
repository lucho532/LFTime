import { LIMITE_BYTES_FOTO } from '../../configuracion/limitesFotos'
import type { PropietarioFoto } from '../../reglas/permisoFoto'
import { almacenFotos } from '../../repositorios/demo/almacenFotos'
import { ErrorAlmacenFotos } from '../../repositorios/demo/ErrorAlmacenFotos'
import { repositorios } from '../../repositorios/demo/repositorios'
import type { IFotoServicio } from '../IFotoServicio'

/** Clave de la foto: la de la persona trabajadora si la hay; si no, la de la cuenta de usuario. */
export function claveDeFoto(propietario: PropietarioFoto): string {
  if (propietario.trabajadorId) {
    return `trabajador:${propietario.trabajadorId}`
  }
  if (propietario.usuarioId) {
    return `usuario:${propietario.usuarioId}`
  }
  throw new Error('La foto necesita un propietario.')
}

/** Marca en el registro de la persona si tiene foto (`urlFoto` guarda la clave, nunca la imagen). */
function marcarReferencia(propietario: PropietarioFoto, referencia: string | null): void {
  if (propietario.trabajadorId) {
    const trabajador = repositorios.trabajadores.obtenerPorId(propietario.trabajadorId)
    if (trabajador) {
      repositorios.trabajadores.guardar({ ...trabajador, urlFoto: referencia })
    }
  }
  if (propietario.usuarioId) {
    const usuario = repositorios.usuarios.obtenerPorId(propietario.usuarioId)
    if (usuario) {
      repositorios.usuarios.guardar({ ...usuario, urlFoto: referencia })
    }
  }
}

/**
 * Implementación de demostración de `IFotoServicio`: las imágenes viven en IndexedDB y el registro de
 * la persona solo guarda la clave de su foto. Aplica el límite de 2 MB aunque quien llama ya haya
 * comprimido. No decide quién puede ver o cambiar la foto (ver `reglas/permisoFoto`).
 */
export class FotoServicioDemo implements IFotoServicio {
  async guardar(propietario: PropietarioFoto, foto: Blob): Promise<void> {
    if (foto.size > LIMITE_BYTES_FOTO) {
      throw new ErrorAlmacenFotos('TAMANO_EXCEDIDO')
    }
    const clave = claveDeFoto(propietario)
    await almacenFotos.guardar(clave, foto)
    marcarReferencia(propietario, clave)
  }

  async obtenerUrl(propietario: PropietarioFoto): Promise<string | null> {
    try {
      const foto = await almacenFotos.obtener(claveDeFoto(propietario))
      return foto ? URL.createObjectURL(foto) : null
    } catch {
      return null
    }
  }

  async retirar(propietario: PropietarioFoto): Promise<void> {
    await almacenFotos.eliminar(claveDeFoto(propietario))
    marcarReferencia(propietario, null)
  }
}
