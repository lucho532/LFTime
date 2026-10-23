import { describe, expect, it } from 'vitest'
import { calcularSegmentosAnillo } from '../../utilidades/segmentosAnillo'

describe('calcularSegmentosAnillo', () => {
  it('reparte la circunferencia en proporción y cada tramo empieza donde termina el anterior', () => {
    const segmentos = calcularSegmentosAnillo([
      { clave: 'a', cantidad: 1 },
      { clave: 'b', cantidad: 3 },
    ])
    expect(segmentos).toEqual([
      { clave: 'a', largo: 25, inicio: 0 },
      { clave: 'b', largo: 75, inicio: 25 },
    ])
  })

  it('omite los grupos sin cantidad y no dibuja nada si el total es cero', () => {
    expect(calcularSegmentosAnillo([{ clave: 'a', cantidad: 0 }, { clave: 'b', cantidad: 2 }])).toEqual([{ clave: 'b', largo: 100, inicio: 0 }])
    expect(calcularSegmentosAnillo([{ clave: 'a', cantidad: 0 }])).toEqual([])
    expect(calcularSegmentosAnillo([])).toEqual([])
  })
})
