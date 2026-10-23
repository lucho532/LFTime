import { describe, expect, it } from 'vitest'
import type { DatosHorario } from '../../modelos/horario'
import type { DatosTrabajador } from '../../modelos/trabajador'
import { validarDatosHorario } from '../../validadores/horario'
import { normalizarDocumento, validarDatosTrabajador } from '../../validadores/trabajador'
import { esHoraValida, minutosEntre } from '../../utilidades/horas'
import { resumirDias } from '../../utilidades/diasSemana'

const TRABAJADOR_VALIDO: DatosTrabajador = {
  nombres: 'María', apellidos: 'López', tipoDocumento: 'CC', numeroDocumento: '1.053.842.671',
  cargo: 'Enfermera', telefono: '', hospitalId: 'hosp-01', estado: 'ACTIVO',
}

describe('validarDatosTrabajador (límites de interfaz, P-13 provisional)', () => {
  it('acepta un trabajador completo, con o sin teléfono', () => {
    expect(validarDatosTrabajador(TRABAJADOR_VALIDO)).toEqual({})
    expect(validarDatosTrabajador({ ...TRABAJADOR_VALIDO, telefono: '+57 300 123 4567' })).toEqual({})
  })

  it('exige los campos obligatorios y los muestra todos juntos', () => {
    const errores = validarDatosTrabajador({ ...TRABAJADOR_VALIDO, nombres: ' ', apellidos: '', cargo: '', hospitalId: '', numeroDocumento: '', tipoDocumento: '' })
    expect(Object.keys(errores).sort()).toEqual(['apellidos', 'cargo', 'hospitalId', 'nombres', 'numeroDocumento', 'tipoDocumento'])
  })

  it('normaliza el documento: puntos, espacios y guiones no cuentan', () => {
    expect(normalizarDocumento(' 1.053.842-671 ')).toBe('1053842671')
    expect(normalizarDocumento('ab 123-45')).toBe('AB12345')
  })

  it.each([
    ['1234', 'CC', /entre 5 y 15/],
    ['1'.repeat(16), 'CC', /entre 5 y 15/],
    ['12A456', 'CC', /solo lleva números/],
    ['12A456', 'CE', /solo lleva números/],
    ['AB#123', 'PA', /letras y números/],
  ])('rechaza el documento %s de tipo %s', (numero, tipo, mensaje) => {
    expect(validarDatosTrabajador({ ...TRABAJADOR_VALIDO, tipoDocumento: tipo, numeroDocumento: numero }).numeroDocumento).toMatch(mensaje)
  })

  it('un pasaporte puede llevar letras y números', () => {
    expect(validarDatosTrabajador({ ...TRABAJADOR_VALIDO, tipoDocumento: 'PA', numeroDocumento: 'AB123456' })).toEqual({})
  })

  it.each(['abc', '12', '300-abc-1234', '1'.repeat(16)])('rechaza el teléfono %s', (telefono) => {
    expect(validarDatosTrabajador({ ...TRABAJADOR_VALIDO, telefono }).telefono).toMatch(/teléfono válido/)
  })
})

const HORARIO_VALIDO: DatosHorario = {
  vigenteDesde: '2026-10-24', diasLaborables: [1, 2, 3, 4, 5], horaEntrada: '07:00', horaSalida: '16:00',
  ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '14:00', duracionAlmuerzoMinutos: 60,
}
const CONTEXTO = { hoy: '2026-10-23', vigenciasExistentes: ['2026-01-01', '2026-09-01', '2026-11-01'] }
const validar = (cambios: Partial<DatosHorario>) => validarDatosHorario({ ...HORARIO_VALIDO, ...cambios }, CONTEXTO)

describe('validarDatosHorario (P-07 provisional)', () => {
  it('acepta un horario válido, también con vigencia desde hoy', () => {
    expect(validar({})).toEqual({})
    expect(validar({ vigenteDesde: '2026-10-23' })).toEqual({})
  })

  it('acepta un turno que cruza la medianoche con el almuerzo también después de medianoche (D5)', () => {
    expect(validar({ horaEntrada: '19:00', horaSalida: '04:00', ventanaAlmuerzoDesde: '23:00', ventanaAlmuerzoHasta: '01:00' })).toEqual({})
    expect(validar({ horaEntrada: '19:00', horaSalida: '04:00', ventanaAlmuerzoDesde: '00:30', ventanaAlmuerzoHasta: '02:00' })).toEqual({})
  })

  it('no reescribe el pasado ni repite la fecha de otro horario', () => {
    expect(validar({ vigenteDesde: '2026-10-22' }).vigenteDesde).toMatch(/desde hoy o desde una fecha futura/)
    expect(validar({ vigenteDesde: '2026-11-01' }).vigenteDesde).toMatch(/Ya existe un horario que empieza ese día/)
  })

  it.each(['', '2026-13-01', '2026-02-30', '24/10/2026', 'mañana'])('rechaza la fecha %j', (fecha) => {
    expect(validar({ vigenteDesde: fecha }).vigenteDesde).toMatch(/Elige la fecha/)
  })

  it('exige al menos un día laborable', () => {
    expect(validar({ diasLaborables: [] }).diasLaborables).toBe('Elige al menos un día laborable.')
  })

  it.each(['', '7:00', '25:00', '12:60', 'abc'])('rechaza la hora %j', (hora) => {
    expect(validar({ horaEntrada: hora }).horaEntrada).toMatch(/formato HH:mm/)
    expect(validar({ ventanaAlmuerzoDesde: hora }).ventanaAlmuerzoDesde).toMatch(/formato HH:mm/)
  })

  it('la salida no puede ser igual a la entrada', () => {
    expect(validar({ horaSalida: '07:00' }).horaSalida).toMatch(/distinta de la entrada/)
  })

  it('el intervalo de almuerzo debe estar dentro de la jornada y terminar después de empezar', () => {
    expect(validar({ ventanaAlmuerzoDesde: '14:00', ventanaAlmuerzoHasta: '12:00' }).ventanaAlmuerzoHasta).toMatch(/dentro de la jornada/)
    expect(validar({ ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '17:00' }).ventanaAlmuerzoHasta).toMatch(/dentro de la jornada/)
    expect(validar({ ventanaAlmuerzoDesde: '06:00', ventanaAlmuerzoHasta: '08:00' }).ventanaAlmuerzoHasta).toMatch(/dentro de la jornada/)
    expect(validar({ ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '12:00' }).ventanaAlmuerzoHasta).toMatch(/dentro de la jornada/)
  })

  it.each([0, -5, 1.5, 241, Number.NaN])('rechaza la duración de almuerzo %s', (minutos) => {
    expect(validar({ duracionAlmuerzoMinutos: minutos }).duracionAlmuerzoMinutos).toMatch(/entero de minutos, entre 1 y 240/)
  })

  it('la duración del almuerzo debe caber en el intervalo permitido', () => {
    expect(validar({ ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '12:30', duracionAlmuerzoMinutos: 60 }).duracionAlmuerzoMinutos).toMatch(/no cabe/)
    expect(validar({ ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '13:00', duracionAlmuerzoMinutos: 60 })).toEqual({})
  })

  it('muestra todos los errores juntos', () => {
    const errores = validar({ vigenteDesde: '', diasLaborables: [], horaEntrada: 'x', duracionAlmuerzoMinutos: 0 })
    expect(Object.keys(errores).sort()).toEqual(['diasLaborables', 'duracionAlmuerzoMinutos', 'horaEntrada', 'vigenteDesde'])
  })
})

describe('utilidades de horas y días', () => {
  it('valida horas HH:mm y mide minutos entre horas, también cruzando la medianoche', () => {
    expect(['00:00', '23:59', '07:05'].every(esHoraValida)).toBe(true)
    expect(['24:00', '7:00', '12:60', ''].some(esHoraValida)).toBe(false)
    expect(minutosEntre('07:00', '16:00')).toBe(540)
    expect(minutosEntre('19:00', '04:00')).toBe(540)
    expect(minutosEntre('10:00', '10:00')).toBe(0)
  })

  it('resume los días laborables', () => {
    expect(resumirDias([1, 2, 3, 4, 5, 6, 7])).toBe('Todos los días')
    expect(resumirDias([5, 1, 3, 2, 4])).toBe('Lun a Vie')
    expect(resumirDias([1, 3, 5])).toBe('Lun, Mié, Vie')
    expect(resumirDias([6, 7])).toBe('Sáb, Dom')
    expect(resumirDias([])).toBe('Sin días')
  })
})
