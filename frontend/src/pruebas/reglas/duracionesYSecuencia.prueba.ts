import { describe, expect, it } from 'vitest'
import { calcularDuraciones } from '../../reglas/duraciones'
import { siguienteMarcacion, validarSecuencia } from '../../reglas/secuencia'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { jornadaCompleta, marca } from '../ayudas/jornadaDePrueba'

describe('calcularDuraciones (D16, spec §6)', () => {
  it('reproduce el ejemplo de la spec: efectivo 8 h, almuerzo 1 h, total 9 h', () => {
    expect(calcularDuraciones(jornadaCompleta())).toEqual({ efectivoMinutos: 480, almuerzoMinutos: 60, totalMinutos: 540, completa: true })
  })

  it('el total es siempre efectivo + almuerzo', () => {
    const resultado = calcularDuraciones([
      marca('ENTRADA', '06:47'), marca('SALIDA_ALMUERZO', '11:58'), marca('REGRESO_ALMUERZO', '12:53'), marca('SALIDA_FINAL', '16:04'),
    ])
    expect(resultado.totalMinutos).toBe(resultado.efectivoMinutos! + resultado.almuerzoMinutos!)
  })

  it('ignora los segundos para que las duraciones sean enteras', () => {
    const marcaciones = jornadaCompleta().map((m) => ({ ...m, instante: m.instante.replace(':00.000Z', ':45.000Z') }))
    expect(calcularDuraciones(marcaciones).totalMinutos).toBe(540)
  })

  it('sin salida final el cómputo es incompleto y no entrega efectivo ni total', () => {
    const resultado = calcularDuraciones(jornadaCompleta().slice(0, 3))
    expect(resultado).toEqual({ efectivoMinutos: null, almuerzoMinutos: 60, totalMinutos: null, completa: false })
  })

  it('sin regreso del almuerzo no hay almuerzo, efectivo ni total', () => {
    const resultado = calcularDuraciones([marca('ENTRADA', '07:00'), marca('SALIDA_ALMUERZO', '12:00'), marca('SALIDA_FINAL', '16:00')])
    expect(resultado).toEqual({ efectivoMinutos: null, almuerzoMinutos: null, totalMinutos: null, completa: false })
  })

  it('sin ninguna marcación todo es nulo', () => {
    expect(calcularDuraciones([])).toEqual({ efectivoMinutos: null, almuerzoMinutos: null, totalMinutos: null, completa: false })
  })

  it('marcaciones desordenadas se consideran incompletas, no se inventa un valor', () => {
    const resultado = calcularDuraciones([
      marca('ENTRADA', '07:00'), marca('SALIDA_ALMUERZO', '13:00'), marca('REGRESO_ALMUERZO', '12:00'), marca('SALIDA_FINAL', '16:00'),
    ])
    expect(resultado.completa).toBe(false)
    expect(resultado.efectivoMinutos).toBeNull()
    expect(resultado.almuerzoMinutos).toBeNull()
  })

  it('un turno que cruza la medianoche se calcula con los instantes reales', () => {
    const resultado = calcularDuraciones([
      marca('ENTRADA', '22:00', '2026-10-21'), marca('SALIDA_ALMUERZO', '02:00', '2026-10-22'),
      marca('REGRESO_ALMUERZO', '03:00', '2026-10-22'), marca('SALIDA_FINAL', '06:00', '2026-10-22'),
    ])
    expect(resultado).toEqual({ efectivoMinutos: 420, almuerzoMinutos: 60, totalMinutos: 480, completa: true })
  })
})

describe('secuencia de marcaciones (HU-05)', () => {
  const tipos = (...lista: TipoMarcacion[]) => lista

  it('ofrece solo la acción siguiente en cada punto de la jornada', () => {
    expect(siguienteMarcacion([])).toBe('ENTRADA')
    expect(siguienteMarcacion(tipos('ENTRADA'))).toBe('SALIDA_ALMUERZO')
    expect(siguienteMarcacion(tipos('ENTRADA', 'SALIDA_ALMUERZO'))).toBe('REGRESO_ALMUERZO')
    expect(siguienteMarcacion(tipos('ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO'))).toBe('SALIDA_FINAL')
    expect(siguienteMarcacion(tipos('ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL'))).toBeNull()
  })

  it('permite exactamente la transición que sigue', () => {
    expect(validarSecuencia([], 'ENTRADA')).toEqual({ permitida: true })
    expect(validarSecuencia(tipos('ENTRADA'), 'SALIDA_ALMUERZO')).toEqual({ permitida: true })
    expect(validarSecuencia(tipos('ENTRADA', 'SALIDA_ALMUERZO'), 'REGRESO_ALMUERZO')).toEqual({ permitida: true })
    expect(validarSecuencia(tipos('ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO'), 'SALIDA_FINAL')).toEqual({ permitida: true })
  })

  it('rechaza los eventos duplicados', () => {
    expect(validarSecuencia(tipos('ENTRADA'), 'ENTRADA')).toEqual({ permitida: false, motivo: 'DUPLICADA' })
    expect(validarSecuencia(tipos('ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL'), 'SALIDA_FINAL')).toEqual({ permitida: false, motivo: 'DUPLICADA' })
  })

  it('rechaza cualquier evento sin entrada, incluida la salida final sin jornada abierta', () => {
    for (const tipo of ['SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL'] as const) {
      expect(validarSecuencia([], tipo)).toEqual({ permitida: false, motivo: 'SIN_JORNADA_ABIERTA' })
    }
  })

  it('rechaza saltarse un paso', () => {
    expect(validarSecuencia(tipos('ENTRADA'), 'REGRESO_ALMUERZO')).toEqual({ permitida: false, motivo: 'FUERA_DE_SECUENCIA' })
    expect(validarSecuencia(tipos('ENTRADA'), 'SALIDA_FINAL')).toEqual({ permitida: false, motivo: 'FUERA_DE_SECUENCIA' })
    expect(validarSecuencia(tipos('ENTRADA', 'SALIDA_ALMUERZO'), 'SALIDA_FINAL')).toEqual({ permitida: false, motivo: 'FUERA_DE_SECUENCIA' })
  })
})
