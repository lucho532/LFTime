import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TablaDeInforme } from '../../componentes/reportes/TablaDeInforme'
import type { TablaInforme } from '../../modelos/informe'

const TABLA: TablaInforme = {
  tipo: 'HORAS_POR_TRABAJADOR',
  periodo: '2026-10-21',
  columnas: ['Trabajador', 'Diferencia'],
  filas: [['Ana Prueba', '−1 h 00 min'], ['Beatriz Prueba', '+15 min'], ['Carla Prueba', '0 min']],
}

describe('TablaDeInforme: tiempos en contra', () => {
  it('resalta en rojo solo los tiempos por debajo de lo programado, que además llevan el signo −', () => {
    render(<TablaDeInforme tabla={TABLA} />)
    const enRojo = screen.getByText('−1 h 00 min')
    expect(enRojo).toHaveClass('tabla-de-informe__en-contra')
    expect(screen.getByText('+15 min')).not.toHaveClass('tabla-de-informe__en-contra')
    expect(screen.getByText('0 min')).not.toHaveClass('tabla-de-informe__en-contra')
  })

  it('aclara que la diferencia es provisional y no es una sanción, y solo cuando hay una columna de diferencia', () => {
    const { rerender } = render(<TablaDeInforme tabla={TABLA} />)
    expect(screen.getByText(/no es una sanción ni un descuento/)).toBeInTheDocument()
    rerender(<TablaDeInforme tabla={{ ...TABLA, columnas: ['Trabajador', 'Horas'] }} />)
    expect(screen.queryByText(/no es una sanción ni un descuento/)).not.toBeInTheDocument()
  })
})
