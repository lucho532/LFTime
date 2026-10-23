import { describe, expect, it } from 'vitest'
import type { AlertaVisible } from '../../modelos/alerta'
import type { Hospital } from '../../modelos/hospital'
import type { FilaPersonalEnVivo } from '../../modelos/panel'
import type { Trabajador } from '../../modelos/trabajador'
import { calcularEfectivoHastaAhora } from '../../reglas/duraciones'
import {
  agruparPorEstado,
  calcularHorasDelDia,
  calcularIndicadores,
  calcularPromedioAlmuerzo,
  coincideConEstado,
  contarAlertasSinRevisar,
  FILTRO_SIN_TURNO,
  ordenarAlertasParaPanel,
  esClaveIndicador,
  perteneceAIndicador,
  porcentaje,
  resumirPorHospital,
} from '../../reglas/indicadoresPanel'
import { aInstanteUtc } from '../../utilidades/horaColombia'
import { FECHA_PRUEBA, jornadaCompleta, marca } from '../ayudas/jornadaDePrueba'

function trabajador(id: string, cambios: Partial<Trabajador> = {}): Trabajador {
  return {
    id, nombres: id, apellidos: 'Prueba', nombreCompleto: `${id} Prueba`, tipoDocumento: 'CC', numeroDocumento: '1', cargo: 'Enfermera',
    hospitalId: 'hosp-a', estado: 'ACTIVO', estaActivo: true, urlFoto: null, ...cambios,
  }
}

function fila(id: string, cambios: Partial<FilaPersonalEnVivo> = {}, personal: Partial<Trabajador> = {}): FilaPersonalEnVivo {
  return {
    trabajador: trabajador(id, personal), hospitalNombre: 'Hospital A', municipioNombre: 'Municipio', horarioTexto: '07:00 - 16:00',
    estado: 'EN_JORNADA', esperadoHoy: true, conEntrada: true, ultimaMarca: { tipo: 'ENTRADA', instante: '2026-10-21T12:00:00.000Z' },
    minutosRetrasoEntrada: 0, efectivoMinutos: 60, almuerzoMinutos: null, efectivoProgramadoMinutos: 480, almuerzoAutorizadoMinutos: 60,
    incidenciasAbiertas: 0, ...cambios,
  }
}

const enAlmuerzo = fila('b', { estado: 'EN_ALMUERZO', ultimaMarca: { tipo: 'SALIDA_ALMUERZO', instante: '2026-10-21T17:00:00.000Z' } })
const sinEntrada = fila('c', { estado: 'RETRASO', conEntrada: false, ultimaMarca: null, efectivoMinutos: null })
const entroTarde = fila('d', { minutosRetrasoEntrada: 28 })
const conIncidencia = fila('e', { estado: 'INCIDENCIA', incidenciasAbiertas: 2 })
const inactivo = fila('f', { estado: 'VACACIONES', esperadoHoy: false, conEntrada: false, ultimaMarca: null, incidenciasAbiertas: 1 }, { estado: 'VACACIONES', estaActivo: false })
const filas = [fila('a'), enAlmuerzo, sinEntrada, entroTarde, conIncidencia, inactivo]

describe('indicadores del panel (HU-01)', () => {
  it('cuenta sobre el personal activo con las definiciones provisionales', () => {
    expect(calcularIndicadores(filas)).toEqual({ total: 5, enJornada: 3, enAlmuerzo: 1, conRetraso: 2, sinEntrada: 1, conIncidencias: 1 })
  })

  it('el personal que no está activo no cuenta en ningún indicador, aunque tenga incidencias abiertas', () => {
    expect(perteneceAIndicador(inactivo, 'enJornada')).toBe(false)
    expect(calcularIndicadores([inactivo])).toEqual({ total: 0, enJornada: 0, enAlmuerzo: 0, conRetraso: 0, sinEntrada: 0, conIncidencias: 0 })
  })

  it('con retraso incluye a quien no ha entrado pasada la hora y a quien entró tarde; sin entrada solo al primero', () => {
    expect(perteneceAIndicador(sinEntrada, 'conRetraso')).toBe(true)
    expect(perteneceAIndicador(entroTarde, 'conRetraso')).toBe(true)
    expect(perteneceAIndicador(entroTarde, 'sinEntrada')).toBe(false)
    expect(perteneceAIndicador(sinEntrada, 'sinEntrada')).toBe(true)
  })

  it('el detalle de cada tarjeta coincide con su número', () => {
    const indicadores = calcularIndicadores(filas)
    for (const clave of ['enJornada', 'enAlmuerzo', 'conRetraso', 'sinEntrada'] as const) {
      expect(filas.filter((f) => perteneceAIndicador(f, clave))).toHaveLength(indicadores[clave])
    }
  })

  it('reconoce solo las claves de indicador válidas y calcula porcentajes sin dividir por cero', () => {
    expect(esClaveIndicador('enJornada')).toBe(true)
    expect(esClaveIndicador('otra')).toBe(false)
    expect(esClaveIndicador(null)).toBe(false)
    expect(porcentaje(37, 48)).toBe(77)
    expect(porcentaje(3, 0)).toBe(0)
  })
})

describe('resumen por hospital, horas, estados y almuerzo', () => {
  it('cuenta los presentes sobre los esperados de cada hospital', () => {
    const hospitales = [{ id: 'hosp-a', nombre: 'Hospital A', municipioId: 'm1' }, { id: 'hosp-b', nombre: 'Hospital B', municipioId: 'm1' }] as Hospital[]
    const resumen = resumirPorHospital(filas, hospitales, [{ id: 'm1', nombre: 'Manizales', departamento: 'Caldas' }])
    expect(resumen).toEqual([
      { hospitalId: 'hosp-a', nombre: 'Hospital A', municipio: 'Manizales', presentes: 4, esperados: 5 },
      { hospitalId: 'hosp-b', nombre: 'Hospital B', municipio: 'Manizales', presentes: 0, esperados: 0 },
    ])
  })

  it('suma el efectivo programado y el registrado de los esperados, sin mezclar el almuerzo', () => {
    expect(calcularHorasDelDia(filas)).toEqual({ programadasMinutos: 2400, registradasMinutos: 240, diferenciaMinutos: -2160 })
    expect(calcularHorasDelDia([])).toEqual({ programadasMinutos: 0, registradasMinutos: 0, diferenciaMinutos: 0 })
  })

  it('agrupa por estado en el orden del catálogo y deja a quien no tiene turno aparte', () => {
    const grupos = agruparPorEstado([...filas, fila('g', { estado: null, esperadoHoy: false })])
    expect(grupos.map((g) => [g.clave, g.cantidad])).toEqual([
      ['EN_JORNADA', 2], ['EN_ALMUERZO', 1], ['RETRASO', 1], ['INCIDENCIA', 1], ['SIN_TURNO', 1], ['VACACIONES', 1],
    ])
    expect(grupos.find((g) => g.clave === 'SIN_TURNO')?.texto).toBe('Sin turno por ahora')
  })

  it('promedia solo los almuerzos completos y los compara con lo autorizado más la tolerancia', () => {
    const almuerzos = [fila('h', { almuerzoMinutos: 50 }), fila('i', { almuerzoMinutos: 70 }), fila('j')]
    expect(calcularPromedioAlmuerzo(almuerzos, 0)).toEqual({ almuerzosCompletos: 2, promedioMinutos: 60, autorizadoMinutos: 60, dentroDeLoAutorizado: true })
    expect(calcularPromedioAlmuerzo([fila('k', { almuerzoMinutos: 75 })], 10)?.dentroDeLoAutorizado).toBe(false)
    expect(calcularPromedioAlmuerzo([fila('l')], 0)).toBeNull()
  })
})

describe('calcularEfectivoHastaAhora (avance parcial del día)', () => {
  const en = (hora: string) => aInstanteUtc(FECHA_PRUEBA, hora)

  it('sin entrada no hay efectivo', () => {
    expect(calcularEfectivoHastaAhora([], en('09:00'))).toBeNull()
  })

  it('cuenta el tramo abierto hasta ahora y deja de contar durante el almuerzo', () => {
    expect(calcularEfectivoHastaAhora([marca('ENTRADA', '07:00')], en('09:30'))).toBe(150)
    const almorzando = [marca('ENTRADA', '07:00'), marca('SALIDA_ALMUERZO', '12:00')]
    expect(calcularEfectivoHastaAhora(almorzando, en('12:40'))).toBe(300)
  })

  it('suma el segundo tramo tras el regreso y, con la jornada completa, coincide con el efectivo oficial', () => {
    const regreso = [marca('ENTRADA', '07:00'), marca('SALIDA_ALMUERZO', '12:00'), marca('REGRESO_ALMUERZO', '13:00')]
    expect(calcularEfectivoHastaAhora(regreso, en('14:00'))).toBe(360)
    expect(calcularEfectivoHastaAhora(jornadaCompleta(), en('18:00'))).toBe(480)
  })
})

describe('alertas y filtro de estado del panel', () => {
  const alerta = (id: string, revisada: boolean, creadaEn: string): AlertaVisible => ({
    id, incidenciaId: `inc-${id}`, creadaEn, revisada, tipo: 'ENTRADA_TARDIA', trabajadorId: 'a', hospitalId: 'hosp-a',
  })
  const alertas = [alerta('1', true, '2026-10-23T15:00:00Z'), alerta('2', false, '2026-10-23T13:00:00Z'), alerta('3', false, '2026-10-23T14:00:00Z')]

  it('cuenta las alertas sin revisar', () => {
    expect(contarAlertasSinRevisar(alertas)).toBe(2)
    expect(contarAlertasSinRevisar([])).toBe(0)
  })

  it('ordena primero las sin revisar y, dentro de cada grupo, las más recientes, sin modificar la lista original', () => {
    expect(ordenarAlertasParaPanel(alertas).map((a) => a.id)).toEqual(['3', '2', '1'])
    expect(alertas.map((a) => a.id)).toEqual(['1', '2', '3'])
  })

  it('el filtro de estado distingue un estado del catálogo de «sin turno por ahora»', () => {
    const sinTurno = fila('x', { estado: null })
    expect(coincideConEstado(sinTurno, FILTRO_SIN_TURNO)).toBe(true)
    expect(coincideConEstado(fila('y'), FILTRO_SIN_TURNO)).toBe(false)
    expect(coincideConEstado(fila('y'), 'EN_JORNADA')).toBe(true)
    expect(coincideConEstado(sinTurno, 'EN_JORNADA')).toBe(false)
  })
})
