import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { UbicacionDto } from '../../contratos/marcacion'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

/** 07:00 en Colombia del 23 de octubre de 2026: justo la hora de entrada del horario diurno. */
const SIETE_AM = '2026-10-23T12:00:00Z'

function ubicacionCercaDe(hospitalId: string, cambios: Partial<UbicacionDto> = {}, desplazamientoGrados = 0): UbicacionDto {
  const coordenadas = repositorios.hospitales.obtenerPorId(hospitalId)!.coordenadas!
  return { latitud: coordenadas.latitud + desplazamientoGrados, longitud: coordenadas.longitud, precisionMetros: 10, ...cambios }
}

/** Deja la demostración sin marcaciones, intentos, incidencias ni alertas para controlar la jornada de la prueba. */
function vaciarRegistros() {
  repositorios.hospitales.listar() // inicializa la demostración antes de vaciar
  repositorios.marcaciones.reemplazarTodo([])
  repositorios.intentos.reemplazarTodo([])
  repositorios.incidencias.reemplazarTodo([])
  repositorios.alertas.reemplazarTodo([])
}

describe('MarcacionServicioDemo (HU-05, D19, D23, D26)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date(SIETE_AM))
    vaciarRegistros()
  })
  afterEach(() => establecerRelojParaPruebas())

  it('registra la entrada con ubicación válida y guarda tipo, hora, coordenadas y precisión (CA-2)', async () => {
    const resultado = await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01', { precisionMetros: 12 }, 0.0002) })
    expect(resultado.resultado).toBe('REGISTRADA')
    const [guardada] = repositorios.marcaciones.listar()
    expect(guardada).toMatchObject({
      trabajadorId: 'trab-001',
      hospitalId: 'hosp-01',
      tipo: 'ENTRADA',
      instante: SIETE_AM.replace('Z', '.000Z'),
      fechaOperativa: '2026-10-23',
      origen: 'TRABAJADOR',
    })
    expect(guardada.ubicacion.precisionMetros).toBe(12)
    expect(guardada.distanciaAlHospitalMetros).toBeGreaterThan(15)
    expect(guardada.distanciaAlHospitalMetros).toBeLessThan(30)
  })

  it('impide duplicados y la salida final sin jornada abierta, y no guarda nada', async () => {
    const ubicacion = ubicacionCercaDe('hosp-01')
    expect(await servicios.marcaciones.registrar('trab-001', 'SALIDA_FINAL', { ubicacion })).toEqual({ resultado: 'SECUENCIA_INVALIDA', motivo: 'SIN_JORNADA_ABIERTA' })
    await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion })
    expect(await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion })).toEqual({ resultado: 'SECUENCIA_INVALIDA', motivo: 'DUPLICADA' })
    expect(await servicios.marcaciones.registrar('trab-001', 'REGRESO_ALMUERZO', { ubicacion })).toEqual({ resultado: 'SECUENCIA_INVALIDA', motivo: 'FUERA_DE_SECUENCIA' })
    expect(repositorios.marcaciones.listar()).toHaveLength(1)
    expect(repositorios.intentos.listar()).toHaveLength(0)
  })

  it('fuera del radio: no crea marcación, guarda el intento aparte y abre una incidencia con su alerta (CA-3, CA-4)', async () => {
    const lejos = ubicacionCercaDe('hosp-01', {}, 0.002)
    const resultado = await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: lejos })
    expect(resultado).toMatchObject({ resultado: 'RECHAZADA', abrioIncidencia: true })
    expect(repositorios.marcaciones.listar()).toHaveLength(0)
    const [intento] = repositorios.intentos.listar()
    expect(intento).toMatchObject({ motivo: 'FUERA_DE_RADIO', esFalloTecnico: false, trabajadorId: 'trab-001' })
    expect(intento.distanciaAlHospitalMetros).toBeGreaterThan(200)
    const [incidencia] = repositorios.incidencias.listar()
    expect(incidencia).toMatchObject({
      tipo: 'UBICACION_NO_AUTORIZADA',
      estado: 'PENDIENTE',
      asignacion: 'ASIGNADA',
      revisorPrincipalId: 'usr-coord-1',
      intentosIds: [intento.id],
    })
    expect(intento.incidenciaId).toBe(incidencia.id)
    expect(repositorios.alertas.listar()).toEqual([expect.objectContaining({ incidenciaId: incidencia.id, revisada: false })])
  })

  it('varios intentos fuera de radio del mismo día y hospital comparten una sola incidencia (CA-12)', async () => {
    const lejos = ubicacionCercaDe('hosp-01', {}, 0.002)
    await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: lejos })
    await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01', {}, 0.003) })
    expect(repositorios.intentos.listar()).toHaveLength(2)
    const incidencias = repositorios.incidencias.listar()
    expect(incidencias).toHaveLength(1)
    expect(incidencias[0].intentosIds).toHaveLength(2)
    expect(incidencias[0].historial.filter((e) => e.accion === 'INTENTO_ANADIDO')).toHaveLength(1)
    expect(repositorios.alertas.listar()).toHaveLength(1)
  })

  it('un intento fuera de radio no cambia la secuencia: después se puede registrar la entrada', async () => {
    await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01', {}, 0.002) })
    const resultado = await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01') })
    expect(resultado.resultado).toBe('REGISTRADA')
    expect(repositorios.intentos.listar()).toHaveLength(1)
  })

  it('un fallo técnico guarda el intento con su motivo, sin ubicación y sin incidencia ni alerta (CA-4, CA-14)', async () => {
    const resultado = await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { falloTecnico: 'PERMISO_DENEGADO' })
    expect(resultado).toMatchObject({ resultado: 'RECHAZADA', abrioIncidencia: false })
    const [intento] = repositorios.intentos.listar()
    expect(intento).toMatchObject({ motivo: 'PERMISO_DENEGADO', esFalloTecnico: true })
    expect(intento.ubicacion).toBeUndefined()
    expect(intento.incidenciaId).toBeUndefined()
    expect(repositorios.incidencias.listar()).toHaveLength(0)
    expect(repositorios.alertas.listar()).toHaveLength(0)
    expect(repositorios.marcaciones.listar()).toHaveLength(0)
  })

  it('una precisión insuficiente, aunque la ubicación esté lejos, es fallo técnico y no genera incidencia (CA-14)', async () => {
    const resultado = await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01', { precisionMetros: 80 }, 0.01) })
    expect(resultado).toMatchObject({ resultado: 'RECHAZADA', abrioIncidencia: false })
    const [intento] = repositorios.intentos.listar()
    expect(intento).toMatchObject({ motivo: 'PRECISION_INSUFICIENTE', esFalloTecnico: true })
    expect(intento.ubicacion?.precisionMetros).toBe(80)
    expect(repositorios.incidencias.listar()).toHaveLength(0)
  })

  it('un hospital sin coordenadas confirmadas no admite marcar y no guarda nada (CA-11)', async () => {
    const resultado = await servicios.marcaciones.registrar('trab-016', 'ENTRADA', { ubicacion: { latitud: 5.3, longitud: -75.4, precisionMetros: 5 } })
    expect(resultado).toEqual({ resultado: 'HOSPITAL_SIN_COORDENADAS' })
    expect(repositorios.marcaciones.listar()).toHaveLength(0)
    expect(repositorios.intentos.listar()).toHaveLength(0)
  })

  it('en un hospital sin coordinador, la incidencia queda pendiente de asignación (D28)', async () => {
    await servicios.marcaciones.registrar('trab-008', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-05', {}, 0.002) })
    const [incidencia] = repositorios.incidencias.listar()
    expect(incidencia.asignacion).toBe('PENDIENTE_ASIGNACION')
    expect(incidencia.revisorPrincipalId).toBeUndefined()
  })

  it('el historial separa marcaciones e intentos y los ordena del más reciente al más antiguo (CA-5)', async () => {
    await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01') })
    establecerRelojParaPruebas(() => new Date('2026-10-23T17:00:00Z'))
    await servicios.marcaciones.registrar('trab-001', 'SALIDA_ALMUERZO', { falloTecnico: 'TIEMPO_AGOTADO' })
    await servicios.marcaciones.registrar('trab-001', 'SALIDA_ALMUERZO', { ubicacion: ubicacionCercaDe('hosp-01') })
    const historial = await servicios.marcaciones.listarHistorial('trab-001')
    expect(historial.marcaciones.map((m) => m.tipo)).toEqual(['SALIDA_ALMUERZO', 'ENTRADA'])
    expect(historial.intentos.map((i) => i.motivo)).toEqual(['TIEMPO_AGOTADO'])
    expect((await servicios.marcaciones.listarHistorial('trab-002')).marcaciones).toEqual([])
  })

  it('la jornada actual solo trae lo de su fecha operativa y su horario vigente', async () => {
    await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: ubicacionCercaDe('hosp-01') })
    const jornada = await servicios.marcaciones.obtenerJornadaActual('trab-001')
    expect(jornada.fechaOperativa).toBe('2026-10-23')
    expect(jornada.horario).toMatchObject({ horaEntrada: '07:00', horaSalida: '16:00' })
    expect(jornada.marcaciones).toHaveLength(1)
  })
})
