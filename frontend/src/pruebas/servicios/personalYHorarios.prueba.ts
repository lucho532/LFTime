import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { DatosHorario } from '../../modelos/horario'
import type { DatosTrabajador } from '../../modelos/trabajador'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

const NUEVO: DatosTrabajador = {
  nombres: 'Lucía', apellidos: 'Fernández', tipoDocumento: 'CC', numeroDocumento: '1.099.888.777',
  cargo: 'Enfermera', telefono: '300 111 2233', hospitalId: 'hosp-01', estado: 'ACTIVO',
}
const HORARIO: DatosHorario = {
  vigenteDesde: '2026-10-24', diasLaborables: [5, 1, 3], horaEntrada: '08:00', horaSalida: '17:00',
  ventanaAlmuerzoDesde: '12:30', ventanaAlmuerzoHasta: '14:30', duracionAlmuerzoMinutos: 45,
}

describe('servicios de personal y horarios', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })
  afterEach(() => establecerRelojParaPruebas())

  describe('trabajadores (HU-02)', () => {
    it('crea un trabajador activo sin foto, con los datos limpios y auditoría', async () => {
      const creado = await servicios.trabajadores.crear({ ...NUEVO, nombres: '  Lucía ', telefono: '' }, 'usr-coord-1')
      expect(creado).toMatchObject({ nombres: 'Lucía', nombreCompleto: 'Lucía Fernández', estaActivo: true, urlFoto: null, telefono: undefined })
      expect(await servicios.trabajadores.listar()).toHaveLength(49)
      expect(repositorios.auditoria.listar().some((e) => e.accion === 'CREAR_TRABAJADOR' && e.entidadId === creado.id)).toBe(true)
    })

    it('rechaza un documento ya registrado, aunque se escriba con otro formato', async () => {
      await servicios.trabajadores.crear(NUEVO, 'usr-coord-1')
      await expect(servicios.trabajadores.crear({ ...NUEVO, numeroDocumento: '1099888777', nombres: 'Otra' }, 'usr-coord-1')).rejects.toThrow('Ya hay un trabajador con ese número de documento.')
      expect(await servicios.trabajadores.listar()).toHaveLength(49)
    })

    it('rechaza datos inválidos con el primer mensaje claro', async () => {
      await expect(servicios.trabajadores.crear({ ...NUEVO, nombres: '' }, 'usr-coord-1')).rejects.toThrow('Escribe los nombres.')
    })

    it('actualizar cambia los datos y el estado, conserva la foto y deja auditoría con el cambio de estado', async () => {
      const antes = (await servicios.trabajadores.obtenerPorId('trab-001'))!
      repositorios.trabajadores.guardar({ ...repositorios.trabajadores.obtenerPorId('trab-001')!, urlFoto: 'trabajador:trab-001' })
      const despues = await servicios.trabajadores.actualizar('trab-001', { ...NUEVO, numeroDocumento: antes.numeroDocumento, nombres: 'María', apellidos: 'López', estado: 'VACACIONES' }, 'usr-coord-1')
      expect(despues).toMatchObject({ estado: 'VACACIONES', estaActivo: false, urlFoto: 'trabajador:trab-001' })
      const auditoria = repositorios.auditoria.listar().find((e) => e.accion === 'EDITAR_TRABAJADOR' && e.entidadId === 'trab-001')
      expect(auditoria?.detalle).toBe('Estado: ACTIVO → VACACIONES')
    })

    it('un trabajador puede conservar su propio documento al editarse, pero no tomar el de otro', async () => {
      const t002 = (await servicios.trabajadores.obtenerPorId('trab-002'))!
      const t001 = (await servicios.trabajadores.obtenerPorId('trab-001'))!
      await expect(servicios.trabajadores.actualizar('trab-001', { ...NUEVO, numeroDocumento: t001.numeroDocumento }, 'usr-coord-1')).resolves.toBeDefined()
      await expect(servicios.trabajadores.actualizar('trab-001', { ...NUEVO, numeroDocumento: t002.numeroDocumento }, 'usr-coord-1')).rejects.toThrow('Ya hay un trabajador con ese número de documento.')
    })

    it('actualizar un trabajador inexistente falla', async () => {
      await expect(servicios.trabajadores.actualizar('no-existe', NUEVO, 'usr-coord-1')).rejects.toThrow('No se encontró el trabajador.')
    })
  })

  describe('horarios (D15, P-07)', () => {
    it('asigna un horario nuevo sin tocar los anteriores y ordena los días', async () => {
      const antes = await servicios.horarios.listarPorTrabajador('trab-001')
      const nuevo = await servicios.horarios.asignar('trab-001', HORARIO, 'usr-coord-1')
      expect(nuevo).toMatchObject({ trabajadorId: 'trab-001', diasLaborables: [1, 3, 5], horaEntrada: '08:00', asignadoPorUsuarioId: 'usr-coord-1', duracionAlmuerzoMinutos: 45 })
      const despues = await servicios.horarios.listarPorTrabajador('trab-001')
      expect(despues).toHaveLength(antes.length + 1)
      for (const horario of antes) {
        expect(despues).toContainEqual(horario)
      }
    })

    it('el horario nuevo rige desde su fecha: hoy sigue el anterior y mañana el nuevo', async () => {
      await servicios.horarios.asignar('trab-001', HORARIO, 'usr-coord-1')
      expect((await servicios.horarios.obtenerVigente('trab-001', '2026-10-23'))!.horaEntrada).toBe('07:00')
      expect((await servicios.horarios.obtenerVigente('trab-001', '2026-10-24'))!.horaEntrada).toBe('08:00')
    })

    it('registra auditoría del cambio de horario', async () => {
      await servicios.horarios.asignar('trab-001', HORARIO, 'usr-coord-1')
      const entrada = repositorios.auditoria.listar().find((e) => e.accion === 'CAMBIAR_HORARIO' && e.entidadId === 'trab-001' && e.instante === '2026-10-23T15:00:00.000Z')
      expect(entrada?.detalle).toBe('Desde 2026-10-24: 08:00–17:00, almuerzo 12:30–14:30 (45 min)')
    })

    it('rechaza una fecha pasada, una fecha repetida y un trabajador inexistente', async () => {
      await expect(servicios.horarios.asignar('trab-001', { ...HORARIO, vigenteDesde: '2026-10-01' }, 'usr-coord-1')).rejects.toThrow(/desde hoy o desde una fecha futura/)
      await servicios.horarios.asignar('trab-001', HORARIO, 'usr-coord-1')
      await expect(servicios.horarios.asignar('trab-001', HORARIO, 'usr-coord-1')).rejects.toThrow(/Ya existe un horario/)
      await expect(servicios.horarios.asignar('no-existe', HORARIO, 'usr-coord-1')).rejects.toThrow('No se encontró el trabajador.')
    })

    it('acepta un turno que cruza la medianoche', async () => {
      const nocturno = await servicios.horarios.asignar('trab-002', { ...HORARIO, horaEntrada: '19:00', horaSalida: '04:00', ventanaAlmuerzoDesde: '23:00', ventanaAlmuerzoHasta: '01:00' }, 'usr-coord-1')
      expect(nocturno).toMatchObject({ horaEntrada: '19:00', horaSalida: '04:00' })
    })

    it('un trabajador nuevo no tiene horario hasta que se le asigna', async () => {
      const nuevo = await servicios.trabajadores.crear(NUEVO, 'usr-coord-1')
      expect(await servicios.horarios.obtenerVigente(nuevo.id, '2026-10-23')).toBeNull()
      expect(await servicios.horarios.asignar(nuevo.id, { ...HORARIO, vigenteDesde: '2026-10-23' }, 'usr-coord-1')).toBeDefined()
      expect(await servicios.horarios.obtenerVigente(nuevo.id, '2026-10-23')).not.toBeNull()
    })
  })
})
