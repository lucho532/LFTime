import { MAXIMO_FOTOS_DEMO } from '../../configuracion/limitesFotos'
import { ErrorAlmacenFotos } from './ErrorAlmacenFotos'
import type { IAlmacenFotos } from './IAlmacenFotos'

const NOMBRE_BASE = 'lftime-demo-fotos'
const NOMBRE_TIENDA = 'fotos'
const VERSION_BASE = 1

function esErrorDeCuota(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError'
}

function esperar<T>(solicitud: IDBRequest<T>): Promise<T> {
  return new Promise((resolver, rechazar) => {
    solicitud.onsuccess = () => resolver(solicitud.result)
    solicitud.onerror = () => rechazar(solicitud.error)
  })
}

/**
 * Implementación de `IAlmacenFotos` sobre IndexedDB. Abre la base la primera vez que se usa. Traduce los
 * fallos (base bloqueada o no disponible, cuota excedida, escritura fallida) a `ErrorAlmacenFotos`.
 * No valida el contenido de las imágenes.
 */
export class AlmacenFotosIndexedDb implements IAlmacenFotos {
  private conexion: Promise<IDBDatabase> | null = null

  private abrir(): Promise<IDBDatabase> {
    if (!this.conexion) {
      this.conexion = new Promise((resolver, rechazar) => {
        if (typeof indexedDB === 'undefined') {
          rechazar(new ErrorAlmacenFotos('ALMACENAMIENTO_NO_DISPONIBLE'))
          return
        }
        const solicitud = indexedDB.open(NOMBRE_BASE, VERSION_BASE)
        solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(NOMBRE_TIENDA)
        solicitud.onsuccess = () => resolver(solicitud.result)
        solicitud.onerror = () => rechazar(new ErrorAlmacenFotos('ALMACENAMIENTO_NO_DISPONIBLE'))
        solicitud.onblocked = () => rechazar(new ErrorAlmacenFotos('ALMACENAMIENTO_NO_DISPONIBLE'))
      })
      this.conexion.catch(() => {
        this.conexion = null
      })
    }
    return this.conexion
  }

  private async tienda(modo: IDBTransactionMode): Promise<IDBObjectStore> {
    const base = await this.abrir()
    return base.transaction(NOMBRE_TIENDA, modo).objectStore(NOMBRE_TIENDA)
  }

  private async ejecutar<T>(modo: IDBTransactionMode, operacion: (tienda: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    try {
      return await esperar(operacion(await this.tienda(modo)))
    } catch (error) {
      if (error instanceof ErrorAlmacenFotos) {
        throw error
      }
      throw new ErrorAlmacenFotos(esErrorDeCuota(error) ? 'CUOTA_EXCEDIDA' : 'ERROR_DE_ESCRITURA')
    }
  }

  async guardar(clave: string, foto: Blob): Promise<void> {
    const existente = await this.ejecutar('readonly', (tienda) => tienda.count(clave))
    if (existente === 0 && (await this.contar()) >= MAXIMO_FOTOS_DEMO) {
      throw new ErrorAlmacenFotos('LIMITE_DE_FOTOS')
    }
    await this.ejecutar('readwrite', (tienda) => tienda.put(foto, clave))
  }

  async obtener(clave: string): Promise<Blob | null> {
    return (await this.ejecutar<Blob | undefined>('readonly', (tienda) => tienda.get(clave))) ?? null
  }

  async eliminar(clave: string): Promise<void> {
    await this.ejecutar('readwrite', (tienda) => tienda.delete(clave))
  }

  async eliminarTodas(): Promise<void> {
    await this.ejecutar('readwrite', (tienda) => tienda.clear())
  }

  async contar(): Promise<number> {
    return this.ejecutar('readonly', (tienda) => tienda.count())
  }
}
