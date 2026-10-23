import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { aInstanteUtc, establecerRelojParaPruebas } from '../../utilidades/horaColombia'

/** 08:30 en Colombia del 23 de octubre de 2026. */
const OCHO_Y_MEDIA = '2026-10-23T13:30:00Z'
const HOY = '2026-10-23'

function marcar(id: string, trabajadorId: string, tipo: TipoMarcacion, hora: string) {
  repositorios.marcaciones.guardar({
    id,
    trabajadorId,
    hospitalId: repositorios.trabajadores.obtenerPorId(trabajadorId)!.hospitalId,
    tipo,
    instante: aInstanteUtc(HOY, hora).toISOString(),
    fechaOperativa: HOY,
    ubicacion: { latitud: 5, longitud: -75, precisionMetros: 5 },
    distanciaAlHospitalMetros: 10,
    origen: 'TRABAJADOR',
  })
}

describe('PanelServicioDemo (HU-01)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date(OCHO_Y_MEDIA))
    repositorios.hospitales.listar() // inicializa la demostración antes de vaciar
    repositorios.marcaciones.reemplazarTodo([])
    repositorios.intentos.reemplazarTodo([])
    repositorios.incidencias.reemplazarTodo([])
    repositorios.alertas.reemplazarTodo([])
    repositorios.auditoria.reemplazarTodo([])
  })
  afterEach(() => establecerRelojParaPruebas())

  it('entrega una fila por trabajador con el instante de la actualización y las alertas del día', async () => {
    const foto = await servicios.panel.obtenerInstantanea()
    expect(foto.generadaEn).toBe('2026-10-23T13:30:00.000Z')
    expect(foto.filas).toHaveLength(repositorios.trabajadores.listar().length)
    expect(foto.hospitales.length).toBeGreaterThan(0)
    expect(foto.alertas.length).toBeGreaterThan(0)
    expect(foto.reglas.intervaloActualizacionSegundos).toBe(60)
  })

  it('refleja las marcaciones: entrada tardía con minutos de retraso, y almuerzo con su estado', async () => {
    marcar('mar-1', 'trab-001', 'ENTRADA', '07:28')
    marcar('mar-2', 'trab-005', 'ENTRADA', '07:00')
    marcar('mar-3', 'trab-005', 'SALIDA_ALMUERZO', '08:10')
    const foto = await servicios.panel.obtenerInstantanea()
    const de = (id: string) => foto.filas.find((f) => f.trabajador.id === id)!

    expect(de('trab-001')).toMatchObject({ conEntrada: true, minutosRetrasoEntrada: 28, efectivoMinutos: 62 })
    expect(de('trab-005')).toMatchObject({ conEntrada: true, minutosRetrasoEntrada: 0, ultimaMarca: { tipo: 'SALIDA_ALMUERZO' }, efectivoMinutos: 70 })
    expect(de('trab-005').estado).toBe('EN_ALMUERZO')
  })

  it('quien no ha entrado pasada la hora queda sin entrada y con incidencia abierta; el no activo no se evalúa', async () => {
    const foto = await servicios.panel.obtenerInstantanea()
    const de = (id: string) => foto.filas.find((f) => f.trabajador.id === id)!
    expect(de('trab-010')).toMatchObject({ conEntrada: false, esperadoHoy: true, ultimaMarca: null })
    expect(['RETRASO', 'AUSENCIA_APARENTE', 'INCIDENCIA']).toContain(de('trab-010').estado ?? 'ninguno')
    expect(de('trab-010').incidenciasAbiertas).toBeGreaterThan(0)
    expect(de('trab-014')).toMatchObject({ estado: 'VACACIONES', esperadoHoy: false, incidenciasAbiertas: 0 })
  })

  it('es de solo lectura: pedir el panel dos veces no cambia las marcaciones', async () => {
    await servicios.panel.obtenerInstantanea()
    const antes = repositorios.marcaciones.listar().length
    await servicios.panel.obtenerInstantanea()
    expect(repositorios.marcaciones.listar()).toHaveLength(antes)
  })
})
