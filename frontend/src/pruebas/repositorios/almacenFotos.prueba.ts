// @vitest-environment node
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MAXIMO_FOTOS_DEMO } from '../../configuracion/limitesFotos'
import { AlmacenFotosIndexedDb } from '../../repositorios/demo/AlmacenFotosIndexedDb'
import { ErrorAlmacenFotos } from '../../repositorios/demo/ErrorAlmacenFotos'

const foto = (bytes = 10) => new Blob([new Uint8Array(bytes)], { type: 'image/webp' })

async function motivoDe(promesa: Promise<unknown>): Promise<string | null> {
  try {
    await promesa
    return null
  } catch (error) {
    return error instanceof ErrorAlmacenFotos ? error.motivo : 'OTRO_ERROR'
  }
}

describe('AlmacenFotosIndexedDb (D35)', () => {
  let almacen: AlmacenFotosIndexedDb

  beforeEach(async () => {
    almacen = new AlmacenFotosIndexedDb()
    await almacen.eliminarTodas()
  })
  afterEach(() => vi.restoreAllMocks())

  it('guarda y lee una foto con su tipo y tamaño', async () => {
    await almacen.guardar('trabajador:trab-001', foto(1234))
    const leida = await almacen.obtener('trabajador:trab-001')
    expect(leida).not.toBeNull()
    expect(leida!.size).toBe(1234)
    expect(leida!.type).toBe('image/webp')
  })

  it('devuelve null si no existe, elimina una foto y elimina todas', async () => {
    expect(await almacen.obtener('no-existe')).toBeNull()
    await almacen.guardar('a', foto())
    await almacen.guardar('b', foto())
    expect(await almacen.contar()).toBe(2)
    await almacen.eliminar('a')
    expect(await almacen.obtener('a')).toBeNull()
    expect(await almacen.contar()).toBe(1)
    await almacen.eliminarTodas()
    expect(await almacen.contar()).toBe(0)
  })

  it('reemplazar la foto de una clave no cuenta como una foto nueva', async () => {
    await almacen.guardar('a', foto(10))
    await almacen.guardar('a', foto(20))
    expect(await almacen.contar()).toBe(1)
    expect((await almacen.obtener('a'))!.size).toBe(20)
  })

  it(`respeta el máximo de ${MAXIMO_FOTOS_DEMO} fotos, pero permite reemplazar una existente`, async () => {
    for (let i = 0; i < MAXIMO_FOTOS_DEMO; i += 1) {
      await almacen.guardar(`foto-${i}`, foto(1))
    }
    expect(await motivoDe(almacen.guardar('una-mas', foto(1)))).toBe('LIMITE_DE_FOTOS')
    expect(await motivoDe(almacen.guardar('foto-0', foto(2)))).toBeNull()
    expect(await almacen.contar()).toBe(MAXIMO_FOTOS_DEMO)
  })

  it('si el navegador no tiene IndexedDB informa ALMACENAMIENTO_NO_DISPONIBLE y no rompe', async () => {
    const original = globalThis.indexedDB
    // @ts-expect-error simula un navegador sin IndexedDB
    delete globalThis.indexedDB
    try {
      const sinBase = new AlmacenFotosIndexedDb()
      expect(await motivoDe(sinBase.obtener('a'))).toBe('ALMACENAMIENTO_NO_DISPONIBLE')
      expect(await motivoDe(sinBase.guardar('a', foto()))).toBe('ALMACENAMIENTO_NO_DISPONIBLE')
    } finally {
      globalThis.indexedDB = original
    }
  })

  it('si la base está bloqueada o falla al abrir informa el problema y se recupera al reintentar', async () => {
    const abrir = vi.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
      const solicitud = {} as IDBOpenDBRequest
      queueMicrotask(() => (solicitud.onerror as () => void)())
      return solicitud
    })
    const almacenFallido = new AlmacenFotosIndexedDb()
    expect(await motivoDe(almacenFallido.guardar('a', foto()))).toBe('ALMACENAMIENTO_NO_DISPONIBLE')
    expect(abrir).toHaveBeenCalledTimes(1)
    await almacenFallido.guardar('a', foto())
    expect(await almacenFallido.contar()).toBe(1)
  })

  it('una cuota excedida al escribir se informa como CUOTA_EXCEDIDA y no deja la foto a medias', async () => {
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => {
      throw new DOMException('lleno', 'QuotaExceededError')
    })
    expect(await motivoDe(almacen.guardar('a', foto()))).toBe('CUOTA_EXCEDIDA')
    vi.restoreAllMocks()
    expect(await almacen.obtener('a')).toBeNull()
  })

  it('cualquier otro fallo de escritura se informa como ERROR_DE_ESCRITURA', async () => {
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => {
      throw new DOMException('algo falló', 'UnknownError')
    })
    expect(await motivoDe(almacen.guardar('a', foto()))).toBe('ERROR_DE_ESCRITURA')
  })
})
