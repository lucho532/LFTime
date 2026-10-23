import { beforeEach, describe, expect, it } from 'vitest'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { servicios } from '../../servicios/fabrica'

describe('SesionServicioDemo (D9)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
  })

  it('al inicio no hay sesión', async () => {
    expect(await servicios.sesion.obtenerUsuarioActual()).toBeNull()
  })

  it('inicia sesión como un usuario de prueba y la recuerda', async () => {
    const usuario = await servicios.sesion.iniciarSesion('usr-coord-1')
    expect(usuario).toMatchObject({ nombreCompleto: 'Laura Gómez', rol: 'COORDINADOR' })
    expect((await servicios.sesion.obtenerUsuarioActual())?.id).toBe('usr-coord-1')
  })

  it('no guarda contraseñas ni credenciales: solo el identificador del usuario', async () => {
    await servicios.sesion.iniciarSesion('usr-admin-1')
    const guardado = window.localStorage.getItem('lftime.demo.sesion')
    expect(JSON.parse(guardado!)).toEqual({ usuarioId: 'usr-admin-1' })
  })

  it('rechaza un usuario que no existe y no deja sesión a medias', async () => {
    await expect(servicios.sesion.iniciarSesion('usr-fantasma')).rejects.toThrow(/No existe el usuario/)
    expect(await servicios.sesion.obtenerUsuarioActual()).toBeNull()
  })

  it('cerrar sesión la borra', async () => {
    await servicios.sesion.iniciarSesion('usr-trab-001')
    await servicios.sesion.cerrarSesion()
    expect(await servicios.sesion.obtenerUsuarioActual()).toBeNull()
  })

  it('si el usuario guardado ya no existe, no hay sesión', async () => {
    await servicios.sesion.iniciarSesion('usr-trab-001')
    window.localStorage.setItem('lftime.demo.sesion', '{"usuarioId":"borrado"}')
    expect(await servicios.sesion.obtenerUsuarioActual()).toBeNull()
  })
})
