import type { IAlmacenFotos } from '../../repositorios/demo/IAlmacenFotos'

/**
 * Almacén de fotos en memoria para las pruebas de interfaz y de servicio (jsdom no tiene IndexedDB y no
 * puede clonar sus `Blob`). Cumple el mismo contrato que el real. Puede simular un fallo de escritura.
 */
export class AlmacenFotosEnMemoria implements IAlmacenFotos {
  private readonly fotos = new Map<string, Blob>()
  falloAlGuardar: Error | null = null

  async guardar(clave: string, foto: Blob): Promise<void> {
    if (this.falloAlGuardar) {
      throw this.falloAlGuardar
    }
    this.fotos.set(clave, foto)
  }

  async obtener(clave: string): Promise<Blob | null> {
    return this.fotos.get(clave) ?? null
  }

  async eliminar(clave: string): Promise<void> {
    this.fotos.delete(clave)
  }

  async eliminarTodas(): Promise<void> {
    this.fotos.clear()
  }

  async contar(): Promise<number> {
    return this.fotos.size
  }

  /** Solo para pruebas: deja el almacén como nuevo. */
  vaciar(): void {
    this.fotos.clear()
    this.falloAlGuardar = null
  }
}
