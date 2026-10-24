import { beforeEach, describe, expect, it } from 'vitest'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'

const DATOS = { nombres: 'Laura Elena', apellidos: 'Gómez Ríos', tipoDocumento: 'CC', numeroDocumento: '1.020.304.052', cargo: 'Coordinadora general', telefono: '3015550000' }

describe('IUsuarioServicio: datos personales de administradores y coordinadores (P-13)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    repositorios.hospitales.listar() // inicializa la demostración
  })

  it('los usuarios de prueba de administración y coordinación traen sus datos personales', async () => {
    const laura = await servicios.usuarios.obtenerPorId('usr-coord-1')
    expect(laura).toMatchObject({ tipoDocumento: 'CC', numeroDocumento: '1.020.304.052', cargo: 'Coordinadora de personal de salud', telefono: '3001234503' })
    expect((await servicios.usuarios.obtenerPorId('usr-trab-001'))?.numeroDocumento).toBe('')
  })

  it('guarda los datos personales, deja auditoría y no toca el rol ni los hospitales a cargo', async () => {
    const actualizado = await servicios.usuarios.actualizarDatosPersonales('usr-coord-1', DATOS, 'usr-admin-1')
    expect(actualizado).toMatchObject({ nombres: 'Laura Elena', cargo: 'Coordinadora general', telefono: '3015550000', rol: 'COORDINADOR' })
    expect(actualizado.hospitalesResponsable).toEqual(['hosp-01', 'hosp-02'])
    const auditoria = repositorios.auditoria.listar().find((a) => a.accion === 'EDITAR_DATOS_USUARIO')
    expect(auditoria).toMatchObject({ usuarioId: 'usr-admin-1', entidad: 'USUARIO', entidadId: 'usr-coord-1' })
  })

  it('rechaza datos inválidos, un documento de otra persona, a un trabajador y a un usuario que no existe', async () => {
    await expect(servicios.usuarios.actualizarDatosPersonales('usr-coord-1', { ...DATOS, nombres: '' }, 'usr-coord-1')).rejects.toThrow(/no son válidos/)
    await expect(servicios.usuarios.actualizarDatosPersonales('usr-coord-1', { ...DATOS, numeroDocumento: '1.020.304.053' }, 'usr-coord-1')).rejects.toThrow(/Ya existe una persona/)
    await expect(servicios.usuarios.actualizarDatosPersonales('usr-trab-001', DATOS, 'usr-admin-1')).rejects.toThrow(/ficha de trabajador/)
    await expect(servicios.usuarios.actualizarDatosPersonales('no-existe', DATOS, 'usr-admin-1')).rejects.toThrow(/No se encontró/)
  })
})
