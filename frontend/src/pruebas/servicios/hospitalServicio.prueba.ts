import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

const hospitales = servicios.hospitales
const DATOS = { nombre: 'Hospital Nuevo', municipioId: 'mun-manizales', direccion: 'Calle 1 # 2-3' }

describe('HospitalServicioDemo: alta, edición, coordenadas y responsable', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })
  afterEach(() => establecerRelojParaPruebas())

  describe('crear y actualizar (D12)', () => {
    it('un hospital nuevo no tiene coordenadas, no admite marcaciones y no tiene responsable', async () => {
      const hospital = await hospitales.crear(DATOS, 'usr-coord-1')
      expect(hospital).toMatchObject({ nombre: 'Hospital Nuevo', coordenadas: null, admiteMarcaciones: false, coordenadasConfirmadas: false, coordinadorResponsableId: null })
      expect((await hospitales.listar()).some((h) => h.id === hospital.id)).toBe(true)
    })

    it('toma el radio y la precisión de las reglas provisionales vigentes', async () => {
      const reglas = await servicios.configuracion.obtenerReglas()
      await servicios.configuracion.guardarReglas({ ...reglas, radioPermitidoMetros: 120, precisionMaximaMetros: 30 })
      const hospital = await hospitales.crear(DATOS, 'usr-coord-1')
      expect(hospital).toMatchObject({ radioPermitidoMetros: 120, precisionMaximaMetros: 30 })
    })

    it('recorta espacios y rechaza datos inválidos con un mensaje claro', async () => {
      const hospital = await hospitales.crear({ ...DATOS, nombre: '  Hospital Nuevo  ' }, 'usr-coord-1')
      expect(hospital.nombre).toBe('Hospital Nuevo')
      await expect(hospitales.crear({ ...DATOS, nombre: '' }, 'usr-coord-1')).rejects.toThrow('Escribe el nombre del hospital.')
      await expect(hospitales.crear({ ...DATOS, municipioId: '' }, 'usr-coord-1')).rejects.toThrow('Elige el municipio')
    })

    it('actualizar cambia los datos y conserva coordenadas, historial y responsable', async () => {
      const antes = (await hospitales.obtenerPorId('hosp-01'))!
      const despues = await hospitales.actualizar('hosp-01', { ...DATOS, nombre: 'San José (renombrado)' }, 'usr-coord-1')
      expect(despues.nombre).toBe('San José (renombrado)')
      expect(despues.coordenadas).toEqual(antes.coordenadas)
      expect(despues.historialCoordenadas).toEqual(antes.historialCoordenadas)
      expect(despues.coordinadorResponsableId).toBe(antes.coordinadorResponsableId)
    })

    it('actualizar un hospital que no existe falla', async () => {
      await expect(hospitales.actualizar('no-existe', DATOS, 'usr-coord-1')).rejects.toThrow('No se encontró el hospital.')
    })
  })

  describe('confirmar coordenadas (D22, D25)', () => {
    it('al confirmar por primera vez el hospital pasa a admitir marcaciones y queda el origen GPS con su precisión', async () => {
      const hospital = await hospitales.confirmarCoordenadas('hosp-04', { latitud: 5.3, longitud: -75.45, origen: 'GPS_COORDINADOR', precisionMetros: 9 }, 'usr-coord-2')
      expect(hospital).toMatchObject({ admiteMarcaciones: true, coordenadasConfirmadas: true })
      expect(hospital.coordenadas).toMatchObject({ latitud: 5.3, longitud: -75.45, confirmadas: true, origen: 'GPS_COORDINADOR', precisionMetros: 9, confirmadoPorUsuarioId: 'usr-coord-2', confirmadoEn: '2026-10-23T15:00:00.000Z' })
      expect(hospital.historialCoordenadas).toHaveLength(1)
      expect(hospital.historialCoordenadas[0]).toMatchObject({ usuarioId: 'usr-coord-2', anterior: null })
    })

    it('al cambiarlas conserva el valor anterior, quién y cuándo, sin borrar el historial', async () => {
      const antes = (await hospitales.obtenerPorId('hosp-01'))!
      const despues = await hospitales.confirmarCoordenadas('hosp-01', { latitud: 5.07, longitud: -75.52, origen: 'MANUAL' }, 'usr-coord-1')
      expect(despues.historialCoordenadas).toHaveLength(antes.historialCoordenadas.length + 1)
      expect(despues.historialCoordenadas.at(-1)).toMatchObject({ usuarioId: 'usr-coord-1', anterior: antes.coordenadas })
      expect(despues.historialCoordenadas.slice(0, -1)).toEqual(antes.historialCoordenadas)
      expect(despues.coordenadas?.precisionMetros).toBeUndefined()
    })

    it('rechaza coordenadas fuera de rango y no cambia nada', async () => {
      await expect(hospitales.confirmarCoordenadas('hosp-04', { latitud: 91, longitud: 0, origen: 'MANUAL' }, 'usr-coord-2')).rejects.toThrow('entre -90 y 90')
      await expect(hospitales.confirmarCoordenadas('hosp-04', { latitud: 0, longitud: -181, origen: 'MANUAL' }, 'usr-coord-2')).rejects.toThrow('entre -180 y 180')
      expect((await hospitales.obtenerPorId('hosp-04'))!.coordenadasConfirmadas).toBe(false)
    })

    it('registra auditoría con el valor anterior y el nuevo', async () => {
      await hospitales.confirmarCoordenadas('hosp-04', { latitud: 5.3, longitud: -75.45, origen: 'MANUAL' }, 'usr-coord-2')
      await hospitales.confirmarCoordenadas('hosp-04', { latitud: 5.31, longitud: -75.46, origen: 'MANUAL' }, 'usr-coord-2')
      const entradas = repositorios.auditoria.listar().filter((e) => e.entidadId === 'hosp-04')
      expect(entradas.map((e) => e.accion)).toEqual(['CONFIRMAR_COORDENADAS', 'CAMBIAR_COORDENADAS'])
      expect(entradas[1].detalle).toBe('De 5.3, -75.45 a 5.31, -75.46 (manual)')
    })
  })

  describe('coordinador responsable (D28)', () => {
    it('cambiar el responsable cierra la vigencia anterior, abre una nueva desde hoy y no borra nada', async () => {
      const hospital = await hospitales.asignarCoordinador('hosp-01', 'usr-coord-2', 'usr-admin-1', 'Reorganización de zonas')
      expect(hospital.coordinadorResponsableId).toBe('usr-coord-2')
      const [anterior, nueva] = hospital.asignacionesCoordinador
      expect(anterior).toMatchObject({ coordinadorId: 'usr-coord-1', vigenteDesde: '2026-01-01', vigenteHasta: '2026-10-22' })
      expect(nueva).toMatchObject({ coordinadorId: 'usr-coord-2', vigenteDesde: '2026-10-23', asignadoPorUsuarioId: 'usr-admin-1', motivo: 'Reorganización de zonas' })
      expect(nueva.vigenteHasta).toBeUndefined()
    })

    it('un hospital sin responsable puede recibir uno', async () => {
      expect((await hospitales.obtenerPorId('hosp-05'))!.coordinadorResponsableId).toBeNull()
      const hospital = await hospitales.asignarCoordinador('hosp-05', 'usr-coord-1', 'usr-admin-1')
      expect(hospital.coordinadorResponsableId).toBe('usr-coord-1')
      expect(hospital.asignacionesCoordinador).toHaveLength(1)
    })

    it('no permite asignar a quien ya es responsable ni a alguien que no es coordinador', async () => {
      await expect(hospitales.asignarCoordinador('hosp-01', 'usr-coord-1', 'usr-admin-1')).rejects.toThrow('ya es la coordinadora responsable')
      await expect(hospitales.asignarCoordinador('hosp-01', 'usr-admin-2', 'usr-admin-1')).rejects.toThrow('rol de coordinador')
      await expect(hospitales.asignarCoordinador('hosp-01', 'usr-fantasma', 'usr-admin-1')).rejects.toThrow('rol de coordinador')
    })

    it('si se cambia dos veces el mismo día, el historial se conserva completo', async () => {
      await hospitales.asignarCoordinador('hosp-01', 'usr-coord-2', 'usr-admin-1')
      const hospital = await hospitales.asignarCoordinador('hosp-01', 'usr-coord-1', 'usr-admin-1')
      expect(hospital.asignacionesCoordinador).toHaveLength(3)
      expect(hospital.coordinadorResponsableId).toBe('usr-coord-1')
    })

    it('registra auditoría del cambio con el motivo', async () => {
      await hospitales.asignarCoordinador('hosp-05', 'usr-coord-1', 'usr-admin-1', 'Zona nueva')
      const entrada = repositorios.auditoria.listar().find((e) => e.accion === 'ASIGNAR_COORDINADOR' && e.entidadId === 'hosp-05')
      expect(entrada).toMatchObject({ usuarioId: 'usr-admin-1', motivo: 'Zona nueva', instante: '2026-10-23T15:00:00.000Z' })
    })
  })
})
