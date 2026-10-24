import { describe, expect, it } from 'vitest'
import type { IncidenciaDto } from '../../contratos/incidencia'
import type { IntentoMarcacionDto, MarcacionDto, TipoMarcacion } from '../../contratos/marcacion'
import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import type { Hospital } from '../../modelos/hospital'
import type { DatosInformes, FiltrosInforme } from '../../modelos/informe'
import type { Trabajador } from '../../modelos/trabajador'
import { esTiempoEnContra, textoDiferencia, textoDiferenciaDeJornada } from '../../reglas/informes/formatoInforme'
import { construirInforme } from '../../reglas/informes/construirInforme'
import { DIAS_MAXIMOS_PERIODO, fechasDelPeriodo, validarPeriodo } from '../../reglas/informes/periodo'
import { aInstanteUtc } from '../../utilidades/horaColombia'
import { FECHA_PRUEBA, HORARIO_PRUEBA } from '../ayudas/jornadaDePrueba'

const HOSPITAL = { id: 'hosp-a', nombre: 'Hospital A', municipioId: 'm1', admiteMarcaciones: true } as Hospital

function trabajador(id: string, nombre: string, cambios: Partial<Trabajador> = {}): Trabajador {
  return { id, nombres: nombre, apellidos: 'Prueba', nombreCompleto: `${nombre} Prueba`, tipoDocumento: 'CC', numeroDocumento: `doc-${id}`, cargo: 'Enfermera', hospitalId: 'hosp-a', estado: 'ACTIVO', estaActivo: true, urlFoto: null, ...cambios }
}

function marcacion(trabajadorId: string, tipo: TipoMarcacion, hora: string): MarcacionDto {
  return {
    id: `${trabajadorId}-${tipo}`, trabajadorId, hospitalId: 'hosp-a', tipo, instante: aInstanteUtc(FECHA_PRUEBA, hora).toISOString(), fechaOperativa: FECHA_PRUEBA,
    ubicacion: { latitud: 5, longitud: -75, precisionMetros: 5 }, distanciaAlHospitalMetros: 10, origen: 'TRABAJADOR',
  }
}

const INTENTO: IntentoMarcacionDto = {
  id: 'int-1', trabajadorId: 'b', hospitalId: 'hosp-a', tipo: 'ENTRADA', instante: aInstanteUtc(FECHA_PRUEBA, '07:10').toISOString(), fechaOperativa: FECHA_PRUEBA,
  motivo: 'FUERA_DE_RADIO', esFalloTecnico: false, ubicacion: { latitud: 5, longitud: -75, precisionMetros: 12 }, distanciaAlHospitalMetros: 840.4, incidenciaId: 'inc-1',
}

const INCIDENCIA: IncidenciaDto = {
  id: 'inc-1', tipo: 'UBICACION_NO_AUTORIZADA', estado: 'NO_JUSTIFICADA', trabajadorId: 'b', hospitalId: 'hosp-a', fechaOperativa: FECHA_PRUEBA, detectadaEn: INTENTO.instante,
  revisorPrincipalId: 'usr-1', asignacion: 'ASIGNADA', intentosIds: ['int-1'], justificaciones: [],
  historial: [{ id: 'h1', accion: 'RESUELTA', usuarioId: 'usr-1', instante: INTENTO.instante, motivo: 'Sin soporte', estadoNuevo: 'NO_JUSTIFICADA' }],
}

/** A: jornada completa (07:00, 12:00, 13:00, 16:00). B: entra 07:30 y no registra más. C: vacaciones. Foto: 22 de octubre, 12:00 Colombia. */
const DATOS: DatosInformes = {
  ahora: aInstanteUtc('2026-10-22', '12:00').toISOString(),
  reglas: REGLAS_PROVISIONALES_POR_DEFECTO,
  trabajadores: [trabajador('a', 'Ana'), trabajador('b', 'Beatriz'), trabajador('c', 'Carla', { estado: 'VACACIONES', estaActivo: false })],
  hospitales: [HOSPITAL],
  municipios: [{ id: 'm1', nombre: 'Manizales', departamento: 'Caldas' }],
  nombresUsuarios: { 'usr-1': 'Laura Gómez' },
  horarios: ['a', 'b', 'c'].map((id) => ({ ...HORARIO_PRUEBA, id: `h-${id}`, trabajadorId: id })),
  marcaciones: [
    marcacion('a', 'ENTRADA', '07:00'), marcacion('a', 'SALIDA_ALMUERZO', '12:00'), marcacion('a', 'REGRESO_ALMUERZO', '13:00'), marcacion('a', 'SALIDA_FINAL', '16:00'),
    marcacion('b', 'ENTRADA', '07:30'),
  ],
  intentos: [INTENTO],
  incidencias: [INCIDENCIA],
}

const FILTROS: FiltrosInforme = { trabajadorId: '', hospitalId: '', municipioId: '', soloConIncidencias: false, desde: FECHA_PRUEBA, hasta: FECHA_PRUEBA }

describe('periodo de los informes', () => {
  it('valida fechas completas, orden y largo máximo', () => {
    expect(validarPeriodo('', '2026-10-23')).toMatch(/fecha inicial y la final/)
    expect(validarPeriodo('2026-10-23', '2026-10-22')).toMatch(/no puede ser posterior/)
    expect(validarPeriodo('2026-01-01', '2026-12-31')).toContain(`${DIAS_MAXIMOS_PERIODO} días`)
    expect(validarPeriodo('2026-10-17', '2026-10-23')).toBeNull()
  })

  it('no evalúa los días futuros', () => {
    expect(fechasDelPeriodo('2026-10-21', '2026-10-25', '2026-10-23')).toEqual(['2026-10-21', '2026-10-22', '2026-10-23'])
    expect(fechasDelPeriodo('2026-10-24', '2026-10-25', '2026-10-23')).toEqual([])
  })

  it('rechaza construir un informe con un periodo inválido', () => {
    expect(() => construirInforme('INCIDENCIAS', DATOS, { ...FILTROS, desde: '2026-10-23', hasta: '2026-10-22' })).toThrow(/no puede ser posterior/)
  })
})

describe('informes (HU-08)', () => {
  it('asistencia diaria: una fila por trabajador con la hora de cada evento y su estado; quien está de vacaciones no aparece', () => {
    const { columnas, filas } = construirInforme('ASISTENCIA_DIARIA', DATOS, FILTROS)
    expect(columnas).toHaveLength(12)
    expect(filas.map((f) => f[1])).toEqual(['Ana Prueba', 'Beatriz Prueba'])
    expect(filas[0]).toEqual([FECHA_PRUEBA, 'Ana Prueba', 'doc-a', 'Hospital A', 'Manizales', '07:00 a. m.', '12:00 p. m.', '01:00 p. m.', '04:00 p. m.', 'Finalizada', '—', '0 min'])
    expect(filas[1].slice(5, 9)).toEqual(['07:30 a. m.', '—', '—', '—'])
    expect(filas[1][9]).toBe('Sin registrar')
    expect(filas[1].slice(10)).toEqual(['Ubicación no autorizada', 'Incompleto'])
  })

  it('horas por trabajador: separa efectivo, almuerzo y total, y no estima las jornadas incompletas (D16)', () => {
    const { filas } = construirInforme('HORAS_POR_TRABAJADOR', DATOS, FILTROS)
    expect(filas[0]).toEqual(['Ana Prueba', FECHA_PRUEBA, '8 h 00 min', '8 h 00 min', '1 h 00 min', '9 h 00 min', '0 min', 'Sí'])
    expect(filas[1]).toEqual(['Beatriz Prueba', FECHA_PRUEBA, '8 h 00 min', '0 min', '0 min', '0 min', '0 min', 'No (1 jornada incompleta)'])
  })

  it('incidencias: estado, revisor, resolución con su motivo y número de intentos', () => {
    const { filas } = construirInforme('INCIDENCIAS', DATOS, FILTROS)
    expect(filas).toHaveLength(1)
    expect(filas[0]).toEqual(['inc-1', 'Ubicación no autorizada', 'No justificada', 'Beatriz Prueba', 'Hospital A', FECHA_PRUEBA, `${FECHA_PRUEBA} 07:10 a. m.`, 'Laura Gómez', 'No justificada: Sin soporte', 1, '07:30 a. m.', '—', '—', '—', 'Incompleto'])
  })

  it('intentos rechazados: aparte de las marcaciones, con motivo, distancia, precisión e incidencia', () => {
    const { filas } = construirInforme('INTENTOS_RECHAZADOS', DATOS, FILTROS)
    expect(filas).toEqual([[`${FECHA_PRUEBA} 07:10 a. m.`, 'Beatriz Prueba', 'Hospital A', 'Entrada', 'Ubicación fuera del radio del hospital', 'No', '840 m', '12 m', 'inc-1']])
  })

  it('cumplimiento por hospital: cuenta jornadas, retrasos, salidas anticipadas e incidencias pendientes y resueltas', () => {
    const { filas } = construirInforme('CUMPLIMIENTO_POR_HOSPITAL', DATOS, FILTROS)
    expect(filas).toEqual([['Hospital A', 'Manizales', FECHA_PRUEBA, 2, 2, 1, 0, 0, 1]])
  })

  it('los filtros por trabajador, hospital y municipio reducen cada informe', () => {
    expect(construirInforme('ASISTENCIA_DIARIA', DATOS, { ...FILTROS, trabajadorId: 'a' }).filas).toHaveLength(1)
    expect(construirInforme('INCIDENCIAS', DATOS, { ...FILTROS, trabajadorId: 'a' }).filas).toHaveLength(0)
    expect(construirInforme('INTENTOS_RECHAZADOS', DATOS, { ...FILTROS, hospitalId: 'otro' }).filas).toHaveLength(0)
    expect(construirInforme('CUMPLIMIENTO_POR_HOSPITAL', DATOS, { ...FILTROS, municipioId: 'm2' }).filas).toHaveLength(0)
  })

  it('un periodo sin registros da tablas vacías pero con sus columnas', () => {
    const tabla = construirInforme('INCIDENCIAS', DATOS, { ...FILTROS, desde: '2026-10-01', hasta: '2026-10-02' })
    expect(tabla.filas).toEqual([])
    expect(tabla.columnas.length).toBeGreaterThan(0)
  })
})

describe('filtro «solo personal con incidencias», horarios de registro y tiempo en contra', () => {
  it('con el filtro solo entra el personal con alguna incidencia en el periodo, en todos los informes', () => {
    const solo = { ...FILTROS, soloConIncidencias: true }
    expect(construirInforme('ASISTENCIA_DIARIA', DATOS, solo).filas.map((f) => f[1])).toEqual(['Beatriz Prueba'])
    expect(construirInforme('HORAS_POR_TRABAJADOR', DATOS, solo).filas.map((f) => f[0])).toEqual(['Beatriz Prueba'])
    expect(construirInforme('CUMPLIMIENTO_POR_HOSPITAL', DATOS, solo).filas[0][3]).toBe(1)
    expect(construirInforme('ASISTENCIA_DIARIA', DATOS, { ...solo, desde: '2026-10-01', hasta: '2026-10-02' }).filas).toEqual([])
  })

  it('una jornada completa con menos tiempo efectivo que el programado queda con diferencia negativa, con signo', () => {
    const corta = [marcacion('a', 'ENTRADA', '07:00'), marcacion('a', 'SALIDA_ALMUERZO', '12:00'), marcacion('a', 'REGRESO_ALMUERZO', '13:00'), marcacion('a', 'SALIDA_FINAL', '15:00')]
    const datos = { ...DATOS, marcaciones: [...corta, ...DATOS.marcaciones.filter((m) => m.trabajadorId !== 'a')] }
    const asistencia = construirInforme('ASISTENCIA_DIARIA', datos, { ...FILTROS, trabajadorId: 'a' })
    expect(asistencia.filas[0][11]).toBe('−1 h 00 min')
    expect(construirInforme('HORAS_POR_TRABAJADOR', datos, { ...FILTROS, trabajadorId: 'a' }).filas[0][6]).toBe('−1 h 00 min')
  })

  it('el signo menos marca los tiempos en contra; «Incompleto» y «—» no se estiman', () => {
    expect(textoDiferencia(-75)).toBe('−1 h 15 min')
    expect(textoDiferencia(15)).toBe('+15 min')
    expect(textoDiferencia(0)).toBe('0 min')
    expect(esTiempoEnContra('−5 min')).toBe(true)
    expect(esTiempoEnContra('+5 min')).toBe(false)
    expect(esTiempoEnContra(3)).toBe(false)
    expect(textoDiferenciaDeJornada(false, null)).toBe('—')
    expect(textoDiferenciaDeJornada(true, null)).toBe('Incompleto')
  })
})
