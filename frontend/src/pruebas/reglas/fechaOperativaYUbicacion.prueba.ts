import { describe, expect, it } from 'vitest'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { UbicacionDto } from '../../contratos/marcacion'
import { calcularDistanciaMetros } from '../../reglas/distanciaGeografica'
import { evaluarMarcacion, type LimitesUbicacion } from '../../reglas/evaluarMarcacion'
import { calcularFechaOperativa } from '../../reglas/fechaOperativa'
import { esDiaLaborable, resolverTurno } from '../../reglas/turnoProgramado'
import { aInstanteUtc } from '../../utilidades/horaColombia'
import { HORARIO_PRUEBA } from '../ayudas/jornadaDePrueba'

const NOCTURNO: AsignacionHorarioDto = { ...HORARIO_PRUEBA, horaEntrada: '22:00', horaSalida: '06:00', ventanaAlmuerzoDesde: '01:00', ventanaAlmuerzoHasta: '03:00' }

describe('resolverTurno y esDiaLaborable', () => {
  it('un turno diurno empieza y termina el mismo día', () => {
    const turno = resolverTurno(HORARIO_PRUEBA, '2026-10-21')
    expect(turno.inicio).toEqual(aInstanteUtc('2026-10-21', '07:00'))
    expect(turno.fin).toEqual(aInstanteUtc('2026-10-21', '16:00'))
    expect(turno.efectivoProgramadoMinutos).toBe(480)
  })

  it('un turno nocturno termina al día siguiente (D5)', () => {
    expect(resolverTurno(NOCTURNO, '2026-10-21').fin).toEqual(aInstanteUtc('2026-10-22', '06:00'))
  })

  it('respeta los días laborables (1 lunes … 7 domingo)', () => {
    const soloLunes = { ...HORARIO_PRUEBA, diasLaborables: [1] }
    expect(esDiaLaborable(soloLunes, '2026-10-19')).toBe(true)
    expect(esDiaLaborable(soloLunes, '2026-10-21')).toBe(false)
    expect(esDiaLaborable({ ...HORARIO_PRUEBA, diasLaborables: [7] }, '2026-10-25')).toBe(true)
  })
})

describe('calcularFechaOperativa (P-04, provisional)', () => {
  it('un turno diurno pertenece al día en que ocurre', () => {
    expect(calcularFechaOperativa(aInstanteUtc('2026-10-21', '12:00'), [HORARIO_PRUEBA], 'trab-prueba')).toBe('2026-10-21')
  })

  it('una marcación de madrugada de un turno nocturno pertenece al día en que empezó el turno', () => {
    const horarios = [NOCTURNO]
    expect(calcularFechaOperativa(aInstanteUtc('2026-10-21', '22:05'), horarios, 'trab-prueba')).toBe('2026-10-21')
    expect(calcularFechaOperativa(aInstanteUtc('2026-10-22', '00:30'), horarios, 'trab-prueba')).toBe('2026-10-21')
    expect(calcularFechaOperativa(aInstanteUtc('2026-10-22', '05:59'), horarios, 'trab-prueba')).toBe('2026-10-21')
  })

  it('una entrada anticipada antes de la medianoche se asigna al turno que empieza después', () => {
    const turnoDeMadrugada = { ...HORARIO_PRUEBA, horaEntrada: '00:30', horaSalida: '08:30' }
    expect(calcularFechaOperativa(aInstanteUtc('2026-10-21', '23:50'), [turnoDeMadrugada], 'trab-prueba')).toBe('2026-10-22')
  })

  it('sin horario usa la fecha de Colombia del instante, no la de UTC', () => {
    expect(calcularFechaOperativa(new Date('2026-10-22T03:00:00Z'), [], 'trab-prueba')).toBe('2026-10-21')
  })

  it('ignora los horarios de otros trabajadores', () => {
    expect(calcularFechaOperativa(aInstanteUtc('2026-10-22', '00:30'), [NOCTURNO], 'otra-persona')).toBe('2026-10-22')
  })
})

describe('calcularDistanciaMetros (Haversine, D19)', () => {
  it('es cero entre el mismo punto', () => {
    expect(calcularDistanciaMetros({ latitud: 4.6, longitud: -74.08 }, { latitud: 4.6, longitud: -74.08 })).toBe(0)
  })

  it('un grado de latitud mide unos 111,195 km', () => {
    expect(calcularDistanciaMetros({ latitud: 0, longitud: 0 }, { latitud: 1, longitud: 0 })).toBeCloseTo(111_195, -1)
  })

  it('un grado de longitud en el ecuador mide lo mismo; a 60° de latitud, la mitad', () => {
    expect(calcularDistanciaMetros({ latitud: 0, longitud: 0 }, { latitud: 0, longitud: 1 })).toBeCloseTo(111_195, -1)
    expect(calcularDistanciaMetros({ latitud: 60, longitud: 0 }, { latitud: 60, longitud: 1 })).toBeCloseTo(55_597, -1)
  })

  it('Bogotá a Medellín ronda los 240 km y es simétrica', () => {
    const bogota = { latitud: 4.711, longitud: -74.0721 }
    const medellin = { latitud: 6.2442, longitud: -75.5812 }
    const ida = calcularDistanciaMetros(bogota, medellin)
    expect(ida / 1000).toBeGreaterThan(235)
    expect(ida / 1000).toBeLessThan(245)
    expect(calcularDistanciaMetros(medellin, bogota)).toBeCloseTo(ida, 6)
  })
})

describe('evaluarMarcacion (D19, D23; 100 m y 25 m provisionales)', () => {
  const hospital = { coordenadas: { latitud: 4.6, longitud: -74.08, confirmadas: true, origen: 'MANUAL' as const } }
  const limites: LimitesUbicacion = { radioPermitidoMetros: 100, precisionMaximaMetros: 25 }
  const ubicacionA = (metrosAlNorte: number, precisionMetros = 10): UbicacionDto => ({
    latitud: 4.6 + metrosAlNorte / 111_195,
    longitud: -74.08,
    precisionMetros,
  })

  it('acepta una ubicación precisa dentro del radio', () => {
    const resultado = evaluarMarcacion(hospital, { ubicacion: ubicacionA(40) }, limites)
    expect(resultado.resultado).toBe('VALIDA')
  })

  it('el radio exacto es válido y un poco más allá se rechaza como fuera de radio', () => {
    const ubicacion = ubicacionA(100)
    const exacto = calcularDistanciaMetros(hospital.coordenadas, ubicacion)
    expect(evaluarMarcacion(hospital, { ubicacion }, { ...limites, radioPermitidoMetros: exacto }).resultado).toBe('VALIDA')
    expect(evaluarMarcacion(hospital, { ubicacion }, { ...limites, radioPermitidoMetros: exacto - 0.01 })).toMatchObject({
      resultado: 'RECHAZADA',
      motivo: 'FUERA_DE_RADIO',
      esFalloTecnico: false,
    })
  })

  it('con 100 m de radio, 99 m es válido y 101 m es fuera de radio', () => {
    expect(evaluarMarcacion(hospital, { ubicacion: ubicacionA(99) }, limites).resultado).toBe('VALIDA')
    expect(evaluarMarcacion(hospital, { ubicacion: ubicacionA(101) }, limites)).toMatchObject({ motivo: 'FUERA_DE_RADIO' })
  })

  it('una precisión de exactamente 25 m es válida y un poco peor es fallo técnico', () => {
    expect(evaluarMarcacion(hospital, { ubicacion: ubicacionA(10, 25) }, limites).resultado).toBe('VALIDA')
    expect(evaluarMarcacion(hospital, { ubicacion: ubicacionA(10, 25.01) }, limites)).toMatchObject({
      resultado: 'RECHAZADA',
      motivo: 'PRECISION_INSUFICIENTE',
      esFalloTecnico: true,
    })
  })

  it('con precisión insuficiente no afirma que estuviera fuera de zona aunque esté lejos (CA-14)', () => {
    const resultado = evaluarMarcacion(hospital, { ubicacion: ubicacionA(5_000, 80) }, limites)
    expect(resultado).toMatchObject({ motivo: 'PRECISION_INSUFICIENTE', esFalloTecnico: true })
  })

  it('un fallo del dispositivo es fallo técnico con su motivo y sin distancia', () => {
    const resultado = evaluarMarcacion(hospital, { falloTecnico: 'PERMISO_DENEGADO' }, limites)
    expect(resultado).toEqual({ resultado: 'RECHAZADA', motivo: 'PERMISO_DENEGADO', esFalloTecnico: true })
  })

  it('datos de ubicación no numéricos son un fallo técnico', () => {
    const resultado = evaluarMarcacion(hospital, { ubicacion: { latitud: NaN, longitud: -74, precisionMetros: 5 } }, limites)
    expect(resultado).toMatchObject({ motivo: 'UBICACION_NO_DISPONIBLE', esFalloTecnico: true })
  })

  it('un hospital sin coordenadas confirmadas no admite evaluar (D25)', () => {
    expect(evaluarMarcacion({ coordenadas: null }, { ubicacion: ubicacionA(0) }, limites)).toEqual({ resultado: 'HOSPITAL_SIN_COORDENADAS' })
    const sinConfirmar = { coordenadas: { ...hospital.coordenadas, confirmadas: false } }
    expect(evaluarMarcacion(sinConfirmar, { ubicacion: ubicacionA(0) }, limites).resultado).toBe('HOSPITAL_SIN_COORDENADAS')
  })
})
