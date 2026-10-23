import { afterEach, describe, expect, it } from 'vitest'
import {
  aInstanteUtc,
  descomponerEnColombia,
  establecerRelojParaPruebas,
  formatearFechaCorta,
  formatearHora12,
  hoyColombia,
  horaActualColombia,
  sumarDias,
} from '../../utilidades/horaColombia'

function fijarReloj(iso: string) {
  establecerRelojParaPruebas(() => new Date(iso))
}

describe('horaColombia', () => {
  afterEach(() => establecerRelojParaPruebas())

  it('cambia de día en Colombia a las 05:00 UTC, no a las 00:00 UTC', () => {
    fijarReloj('2026-10-24T04:59:59Z')
    expect(hoyColombia()).toBe('2026-10-23')
    expect(horaActualColombia()).toBe('23:59')

    fijarReloj('2026-10-24T05:00:00Z')
    expect(hoyColombia()).toBe('2026-10-24')
    expect(horaActualColombia()).toBe('00:00')
  })

  it('a la medianoche UTC todavía es la tarde-noche del día anterior en Colombia', () => {
    fijarReloj('2026-10-24T00:00:00Z')
    expect(hoyColombia()).toBe('2026-10-23')
    expect(horaActualColombia()).toBe('19:00')
  })

  it('maneja el cambio de año', () => {
    fijarReloj('2027-01-01T04:30:00Z')
    expect(hoyColombia()).toBe('2026-12-31')
    expect(descomponerEnColombia(new Date('2027-01-01T05:00:00Z')).anio).toBe(2027)
  })

  it('convierte una fecha y hora de Colombia a instante UTC', () => {
    expect(aInstanteUtc('2026-10-23', '07:00').toISOString()).toBe('2026-10-23T12:00:00.000Z')
    expect(aInstanteUtc('2026-10-23', '19:30').toISOString()).toBe('2026-10-24T00:30:00.000Z')
  })

  it('rechaza formatos inválidos', () => {
    expect(() => aInstanteUtc('23/10/2026', '07:00')).toThrow()
    expect(() => aInstanteUtc('2026-10-23', '7:00')).toThrow()
  })

  it('suma y resta días cruzando mes y año', () => {
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01')
    expect(sumarDias('2026-01-01', -1)).toBe('2025-12-31')
    expect(sumarDias('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('formatea la hora a 12 horas en hora de Colombia', () => {
    expect(formatearHora12(new Date('2026-10-23T14:42:00Z'))).toBe('09:42 a. m.')
    expect(formatearHora12(new Date('2026-10-23T17:00:00Z'))).toBe('12:00 p. m.')
    expect(formatearHora12(new Date('2026-10-24T05:05:00Z'))).toBe('12:05 a. m.')
  })

  it('formatea la fecha corta con día de la semana', () => {
    expect(formatearFechaCorta(new Date('2025-10-27T14:42:00Z'))).toBe('Lun, 27 Oct 2025')
  })
})
