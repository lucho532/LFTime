import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

describe('servicios de demostración', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })
  afterEach(() => establecerRelojParaPruebas())

  it('trabajadores: lista 48 con datos derivados y obtiene por id', async () => {
    const lista = await servicios.trabajadores.listar()
    expect(lista).toHaveLength(48)
    const maria = await servicios.trabajadores.obtenerPorId('trab-001')
    expect(maria).toMatchObject({ nombreCompleto: 'María López', estaActivo: true, urlFoto: null })
    expect((await servicios.trabajadores.obtenerPorId('trab-014'))?.estaActivo).toBe(false)
    expect(await servicios.trabajadores.obtenerPorId('no-existe')).toBeNull()
  })

  it('hospitales: resuelven el coordinador vigente y si admiten marcaciones', async () => {
    const hospitales = await servicios.hospitales.listar()
    const porId = Object.fromEntries(hospitales.map((h) => [h.id, h]))
    expect(porId['hosp-01']).toMatchObject({ admiteMarcaciones: true, coordinadorResponsableId: 'usr-coord-1' })
    expect(porId['hosp-03'].coordinadorResponsableId).toBe('usr-coord-2')
    expect(porId['hosp-04']).toMatchObject({ admiteMarcaciones: false, coordenadasConfirmadas: false })
    expect(porId['hosp-05'].coordinadorResponsableId).toBeNull()
    expect(await servicios.hospitales.listarMunicipios()).toHaveLength(5)
  })

  it('horarios: devuelve el vigente según la fecha y el historial ordenado', async () => {
    expect((await servicios.horarios.obtenerVigente('trab-001', '2026-08-31'))?.horaEntrada).toBe('08:00')
    expect((await servicios.horarios.obtenerVigente('trab-001', '2026-10-23'))?.horaEntrada).toBe('07:00')
    expect(await servicios.horarios.obtenerVigente('trab-001', '2025-12-31')).toBeNull()
    const historial = await servicios.horarios.listarPorTrabajador('trab-001')
    expect(historial.map((h) => h.vigenteDesde)).toEqual(['2026-09-01', '2026-01-01'])
  })

  it('horarios: el turno nocturno cruza la medianoche', async () => {
    const nocturno = await servicios.horarios.obtenerVigente('trab-011', '2026-10-23')
    expect(nocturno).toMatchObject({ horaEntrada: '19:00', horaSalida: '04:00' })
  })

  it('usuarios: entrega usuarios de prueba por rol sin credenciales', async () => {
    const usuarios = await servicios.usuarios.listar()
    expect(new Set(usuarios.map((u) => u.rol))).toEqual(new Set(['ADMINISTRADOR', 'COORDINADOR', 'TRABAJADOR']))
    expect(JSON.stringify(usuarios).toLowerCase()).not.toContain('contraseña')
    const admins = usuarios.filter((u) => u.rol === 'ADMINISTRADOR')
    expect(admins.map((u) => u.puedeVerFotos).sort()).toEqual([false, true])
  })

  it('configuración: valores provisionales por defecto, edición, validación y restablecer', async () => {
    expect(await servicios.configuracion.obtenerReglas()).toEqual(REGLAS_PROVISIONALES_POR_DEFECTO)
    expect(REGLAS_PROVISIONALES_POR_DEFECTO).toMatchObject({ toleranciaEntradaMinutos: 0, radioPermitidoMetros: 100, precisionMaximaMetros: 25 })
    await servicios.configuracion.guardarReglas({ ...REGLAS_PROVISIONALES_POR_DEFECTO, toleranciaSalidaMinutos: 5 })
    expect((await servicios.configuracion.obtenerReglas()).toleranciaSalidaMinutos).toBe(5)
    await expect(servicios.configuracion.guardarReglas({ ...REGLAS_PROVISIONALES_POR_DEFECTO, umbralAusenciaMinutos: -1 })).rejects.toThrow(/no negativo/)
    expect(await servicios.configuracion.restablecerReglas()).toEqual(REGLAS_PROVISIONALES_POR_DEFECTO)
  })

  it('datos de demostración: informa el estado y restablece', async () => {
    expect(await servicios.datosDemo.obtenerEstado()).toBe('RECIEN_INICIALIZADOS')
    await servicios.configuracion.guardarReglas({ ...REGLAS_PROVISIONALES_POR_DEFECTO, toleranciaSalidaMinutos: 9 })
    expect(await servicios.datosDemo.restablecer()).toBe('RECIEN_INICIALIZADOS')
    expect((await servicios.configuracion.obtenerReglas()).toleranciaSalidaMinutos).toBe(0)
  })
})
