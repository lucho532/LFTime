import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  almacenamientoDisponible,
  eliminarTodasLasClaves,
  escribirJson,
  leerJson,
  reiniciarAlmacenamientoParaPruebas,
} from '../../repositorios/demo/almacenamientoLocal'
import { RepositorioColeccionDemo } from '../../repositorios/demo/RepositorioColeccionDemo'
import { asegurarDatosDemo, olvidarEstadoDemoParaPruebas, restablecerDatosDemo, VERSION_ESQUEMA } from '../../repositorios/demo/inicializacionDemo'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

function reiniciarTodo() {
  vi.restoreAllMocks()
  window.localStorage.clear()
  reiniciarAlmacenamientoParaPruebas()
  olvidarEstadoDemoParaPruebas()
}

describe('almacenamientoLocal', () => {
  beforeEach(reiniciarTodo)
  afterEach(() => establecerRelojParaPruebas())

  it('guarda y lee JSON con el prefijo de la demostración', () => {
    expect(escribirJson('prueba', { a: 1 })).toEqual({ exito: true })
    expect(leerJson('prueba')).toEqual({ a: 1 })
    expect(window.localStorage.getItem('lftime.demo.prueba')).toBe('{"a":1}')
  })

  it('devuelve null si el valor no existe o está dañado', () => {
    expect(leerJson('inexistente')).toBeNull()
    window.localStorage.setItem('lftime.demo.dañado', '{no es json')
    expect(leerJson('dañado')).toBeNull()
  })

  it('con el almacenamiento bloqueado trabaja en memoria sin lanzar errores', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError')
    })
    expect(almacenamientoDisponible()).toBe(false)
    expect(escribirJson('memoria', [1, 2])).toEqual({ exito: true })
    expect(leerJson('memoria')).toEqual([1, 2])
  })

  it('con el almacenamiento lleno informa CUOTA_EXCEDIDA y conserva el valor en memoria', () => {
    expect(almacenamientoDisponible()).toBe(true)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('lleno', 'QuotaExceededError')
    })
    expect(escribirJson('grande', { x: 1 })).toEqual({ exito: false, motivo: 'CUOTA_EXCEDIDA' })
    expect(leerJson('grande')).toEqual({ x: 1 })
  })

  it('elimina solo las claves de la demostración', () => {
    window.localStorage.setItem('otra.cosa', 'x')
    escribirJson('a', 1)
    eliminarTodasLasClaves()
    expect(window.localStorage.getItem('lftime.demo.a')).toBeNull()
    expect(window.localStorage.getItem('otra.cosa')).toBe('x')
  })
})

describe('RepositorioColeccionDemo', () => {
  beforeEach(() => {
    reiniciarTodo()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })
  afterEach(() => establecerRelojParaPruebas())

  it('lista, obtiene, inserta y reemplaza por id', () => {
    const repositorio = new RepositorioColeccionDemo<{ id: string; valor: number }>('hospitales')
    const inicial = repositorio.listar().length
    repositorio.guardar({ id: 'nuevo', valor: 1 })
    repositorio.guardar({ id: 'nuevo', valor: 2 })
    expect(repositorio.listar()).toHaveLength(inicial + 1)
    expect(repositorio.obtenerPorId('nuevo')).toEqual({ id: 'nuevo', valor: 2 })
    expect(repositorio.obtenerPorId('no-existe')).toBeNull()
  })

  it('lanza un error claro si el almacenamiento está lleno', () => {
    const repositorio = new RepositorioColeccionDemo<{ id: string }>('hospitales')
    repositorio.listar()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('lleno', 'QuotaExceededError')
    })
    expect(() => repositorio.guardar({ id: 'x' })).toThrow(/almacenamiento lleno/)
  })
})

describe('inicializacionDemo', () => {
  beforeEach(() => {
    reiniciarTodo()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })
  afterEach(() => establecerRelojParaPruebas())

  it('siembra los datos la primera vez y los reconoce después', () => {
    expect(asegurarDatosDemo()).toBe('RECIEN_INICIALIZADOS')
    expect(leerJson('version')).toBe(VERSION_ESQUEMA)
    olvidarEstadoDemoParaPruebas()
    expect(asegurarDatosDemo()).toBe('EXISTENTES')
  })

  it('no borra datos de otra versión: informa VERSION_DISTINTA', () => {
    asegurarDatosDemo()
    escribirJson('version', VERSION_ESQUEMA + 1)
    olvidarEstadoDemoParaPruebas()
    expect(asegurarDatosDemo()).toBe('VERSION_DISTINTA')
    expect(leerJson<unknown[]>('trabajadores')).toHaveLength(48)
  })

  it('no borra datos de otro día: informa DE_OTRO_DIA', () => {
    asegurarDatosDemo()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-24T15:00:00Z'))
    expect(asegurarDatosDemo()).toBe('DE_OTRO_DIA')
  })

  it('restablecer vuelve a los datos iniciales y a las reglas por defecto', () => {
    asegurarDatosDemo()
    escribirJson('configuracion', { toleranciaSalidaMinutos: 99 })
    const repositorio = new RepositorioColeccionDemo<{ id: string }>('trabajadores')
    repositorio.reemplazarTodo([])
    expect(restablecerDatosDemo()).toBe('RECIEN_INICIALIZADOS')
    expect(repositorio.listar()).toHaveLength(48)
    expect(leerJson('configuracion')).toBeNull()
  })

  it('informa ALMACENAMIENTO_NO_DISPONIBLE si el navegador no permite guardar', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError')
    })
    expect(asegurarDatosDemo()).toBe('ALMACENAMIENTO_NO_DISPONIBLE')
    expect(leerJson<unknown[]>('trabajadores')).toHaveLength(48)
  })
})
