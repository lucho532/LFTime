import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

/** 08:30 en Colombia del 23 de octubre de 2026: más de 60 minutos después de la entrada de las 07:00. */
const OCHO_Y_MEDIA = '2026-10-23T13:30:00Z'
const AUSENCIA_TRAB_001 = 'inc-ausencia_aparente-trab-001-2026-10-23'

function vaciarRegistros() {
  repositorios.hospitales.listar() // inicializa la demostración antes de vaciar
  repositorios.marcaciones.reemplazarTodo([])
  repositorios.intentos.reemplazarTodo([])
  repositorios.incidencias.reemplazarTodo([])
  repositorios.alertas.reemplazarTodo([])
  repositorios.auditoria.reemplazarTodo([])
}

describe('IncidenciaServicioDemo: detección (HU-06, P-19, P-20, D25, D28)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date(OCHO_Y_MEDIA))
    vaciarRegistros()
  })
  afterEach(() => establecerRelojParaPruebas())

  it('abre las incidencias detectadas por las reglas, con su alerta y el revisor del hospital', async () => {
    expect(await servicios.incidencias.sincronizar()).toBeGreaterThan(0)
    const incidencia = await servicios.incidencias.obtenerPorId(AUSENCIA_TRAB_001)
    expect(incidencia).toMatchObject({ tipo: 'AUSENCIA_APARENTE', estado: 'PENDIENTE', asignacion: 'ASIGNADA', revisorPrincipalId: 'usr-coord-1', hospitalId: 'hosp-01' })
    expect(incidencia?.historial.map((e) => e.accion)).toEqual(['DETECTADA', 'ASIGNADA'])
    expect((await servicios.alertas.listar()).find((a) => a.incidenciaId === AUSENCIA_TRAB_001)).toMatchObject({ revisada: false, tipo: 'AUSENCIA_APARENTE' })
  })

  it('es idempotente: sincronizar de nuevo no duplica nada', async () => {
    await servicios.incidencias.sincronizar()
    const total = repositorios.incidencias.listar().length
    expect(await servicios.incidencias.sincronizar()).toBe(0)
    expect(repositorios.incidencias.listar()).toHaveLength(total)
    expect(repositorios.alertas.listar()).toHaveLength(total)
  })

  it('no detecta nada de trabajadores no activos (P-20) ni de hospitales sin coordenadas confirmadas (D25)', async () => {
    await servicios.incidencias.sincronizar()
    const trabajadoresConIncidencia = new Set(repositorios.incidencias.listar().map((i) => i.trabajadorId))
    expect(trabajadoresConIncidencia.has('trab-014')).toBe(false)
    expect(trabajadoresConIncidencia.has('trab-015')).toBe(false)
    expect(trabajadoresConIncidencia.has('trab-016')).toBe(false)
    expect(trabajadoresConIncidencia.has('trab-001')).toBe(true)
  })

  it('en un hospital sin responsable la incidencia queda pendiente de asignación (D28)', async () => {
    await servicios.incidencias.sincronizar()
    expect(repositorios.incidencias.obtenerPorId('inc-ausencia_aparente-trab-008-2026-10-23')).toMatchObject({ asignacion: 'PENDIENTE_ASIGNACION', hospitalId: 'hosp-05' })
  })

  it('el listado ejecuta la detección y entrega lo más reciente primero', async () => {
    const lista = await servicios.incidencias.listar()
    expect(lista.length).toBeGreaterThan(0)
    const instantes = lista.map((i) => i.detectadaEn)
    expect(instantes).toEqual([...instantes].sort().reverse())
  })
})

describe('IncidenciaServicioDemo: flujo de revisión (D11, P-16, P-17, P-18, D29)', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date(OCHO_Y_MEDIA))
    vaciarRegistros()
    await servicios.incidencias.sincronizar()
  })
  afterEach(() => establecerRelojParaPruebas())

  it('el trabajador justifica con texto; una justificación vacía se rechaza', async () => {
    await expect(servicios.incidencias.justificar(AUSENCIA_TRAB_001, '   ', 'usr-trab-001')).rejects.toThrow('La justificación es obligatorio')
    const incidencia = await servicios.incidencias.justificar(AUSENCIA_TRAB_001, 'Me demoré por un derrumbe en la vía.', 'usr-trab-001')
    expect(incidencia.justificaciones).toHaveLength(1)
    expect(incidencia.justificaciones[0]).toMatchObject({ autorId: 'usr-trab-001', texto: 'Me demoré por un derrumbe en la vía.' })
    expect(incidencia.historial.at(-1)).toMatchObject({ accion: 'JUSTIFICADA', usuarioId: 'usr-trab-001' })
    expect(incidencia.estado).toBe('PENDIENTE')
  })

  it('el coordinador que justifica en nombre del trabajador debe indicar el motivo', async () => {
    await expect(servicios.incidencias.justificar(AUSENCIA_TRAB_001, 'Estaba en una cita médica.', 'usr-coord-1')).rejects.toThrow('El motivo de justificar en nombre del trabajador es obligatorio')
    const incidencia = await servicios.incidencias.justificar(AUSENCIA_TRAB_001, 'Estaba en una cita médica.', 'usr-coord-1', 'El trabajador me llamó por teléfono')
    expect(incidencia.historial.at(-1)).toMatchObject({ accion: 'JUSTIFICADA', usuarioId: 'usr-coord-1', motivo: 'El trabajador me llamó por teléfono' })
  })

  it('iniciar revisión pasa a «En revisión» y solo desde «Pendiente»', async () => {
    const enRevision = await servicios.incidencias.iniciarRevision(AUSENCIA_TRAB_001, 'usr-coord-1')
    expect(enRevision.estado).toBe('EN_REVISION')
    await expect(servicios.incidencias.iniciarRevision(AUSENCIA_TRAB_001, 'usr-coord-1')).rejects.toThrow('pendiente')
  })

  it('resolver exige motivo, deja historial y auditoría y no toca los intentos ni los registros (CA-13, P-18)', async () => {
    await expect(servicios.incidencias.resolver(AUSENCIA_TRAB_001, 'NO_JUSTIFICADA', '', 'usr-coord-1')).rejects.toThrow('obligatorio')
    const intentosAntes = JSON.stringify(repositorios.intentos.listar())
    const resuelta = await servicios.incidencias.resolver(AUSENCIA_TRAB_001, 'NO_JUSTIFICADA', 'No hubo soporte.', 'usr-coord-1')
    expect(resuelta.estado).toBe('NO_JUSTIFICADA')
    expect(resuelta.historial.at(-1)).toMatchObject({ accion: 'RESUELTA', usuarioId: 'usr-coord-1', motivo: 'No hubo soporte.', estadoAnterior: 'PENDIENTE', estadoNuevo: 'NO_JUSTIFICADA' })
    expect(JSON.stringify(repositorios.intentos.listar())).toBe(intentosAntes)
    expect(repositorios.auditoria.listar().at(-1)).toMatchObject({ accion: 'RESOLVER_INCIDENCIA', entidadId: AUSENCIA_TRAB_001, usuarioId: 'usr-coord-1', motivo: 'No hubo soporte.' })
  })

  it('una incidencia cerrada no admite justificar ni resolver, pero se reabre con motivo y queda historial', async () => {
    await servicios.incidencias.resolver(AUSENCIA_TRAB_001, 'JUSTIFICADA', 'Presentó soporte.', 'usr-coord-1')
    await expect(servicios.incidencias.justificar(AUSENCIA_TRAB_001, 'otra', 'usr-trab-001')).rejects.toThrow('cerrada')
    await expect(servicios.incidencias.reabrir(AUSENCIA_TRAB_001, '', 'usr-coord-1')).rejects.toThrow('obligatorio')
    const reabierta = await servicios.incidencias.reabrir(AUSENCIA_TRAB_001, 'Apareció nueva información.', 'usr-coord-1')
    expect(reabierta.estado).toBe('EN_REVISION')
    expect(reabierta.historial.map((e) => e.accion).slice(-2)).toEqual(['RESUELTA', 'REABIERTA'])
    expect(repositorios.auditoria.listar().at(-1)?.accion).toBe('REABRIR_INCIDENCIA')
  })

  it('una justificación sobre una incidencia «pendiente de información» la devuelve a revisión', async () => {
    await servicios.incidencias.resolver(AUSENCIA_TRAB_001, 'PENDIENTE_INFORMACION', 'Falta el soporte.', 'usr-coord-1')
    const incidencia = await servicios.incidencias.justificar(AUSENCIA_TRAB_001, 'Aquí está el soporte.', 'usr-trab-001')
    expect(incidencia.estado).toBe('EN_REVISION')
  })

  it('escalar exige motivo, se hace una sola vez y deja auditoría (D29)', async () => {
    await expect(servicios.incidencias.escalar(AUSENCIA_TRAB_001, ' ', 'usr-coord-1')).rejects.toThrow('obligatorio')
    const escalada = await servicios.incidencias.escalar(AUSENCIA_TRAB_001, 'Necesita una decisión del administrador.', 'usr-coord-1')
    expect(escalada.escalada).toMatchObject({ motivo: 'Necesita una decisión del administrador.', escaladaPorId: 'usr-coord-1' })
    expect(escalada.estado).toBe('PENDIENTE')
    await expect(servicios.incidencias.escalar(AUSENCIA_TRAB_001, 'otra vez', 'usr-coord-1')).rejects.toThrow('ya fue escalada')
    expect(repositorios.auditoria.listar().at(-1)).toMatchObject({ accion: 'ESCALAR_INCIDENCIA', usuarioId: 'usr-coord-1' })
  })

  it('el administrador asigna revisor a una incidencia pendiente de asignación, y solo un coordinador (D28)', async () => {
    const id = 'inc-ausencia_aparente-trab-008-2026-10-23'
    await expect(servicios.incidencias.asignarRevisor(id, 'usr-admin-1', 'usr-admin-1')).rejects.toThrow('coordinador')
    const asignada = await servicios.incidencias.asignarRevisor(id, 'usr-coord-2', 'usr-admin-1', 'Cubre la zona')
    expect(asignada).toMatchObject({ asignacion: 'ASIGNADA', revisorPrincipalId: 'usr-coord-2' })
    expect(asignada.historial.at(-1)).toMatchObject({ accion: 'ASIGNADA', usuarioId: 'usr-admin-1', motivo: 'Cubre la zona' })
    expect(repositorios.auditoria.listar().at(-1)?.accion).toBe('ASIGNAR_REVISOR_INCIDENCIA')
  })

  it('las alertas se marcan «revisada» al abrir la incidencia y no se descartan (P-19)', async () => {
    const antes = await servicios.alertas.listar()
    expect(antes.find((a) => a.incidenciaId === AUSENCIA_TRAB_001)?.revisada).toBe(false)
    await servicios.alertas.marcarRevisadaDeIncidencia(AUSENCIA_TRAB_001)
    const despues = await servicios.alertas.listar()
    expect(despues).toHaveLength(antes.length)
    expect(despues.find((a) => a.incidenciaId === AUSENCIA_TRAB_001)?.revisada).toBe(true)
  })

  it('una incidencia inexistente da un error comprensible', async () => {
    await expect(servicios.incidencias.resolver('no-existe', 'JUSTIFICADA', 'x', 'usr-coord-1')).rejects.toThrow('No se encontró la incidencia')
  })
})
