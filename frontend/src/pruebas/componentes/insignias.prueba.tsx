import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Insignia } from '../../componentes/base/Insignia'
import { InsigniaEstado } from '../../componentes/base/InsigniaEstado'
import { PRESENTACION_ESTADO } from '../../componentes/base/presentacionEstado'
import { TEXTO_ESTADO_VISIBLE, type EstadoVisible } from '../../modelos/estadoVisible'

const ESTADOS = Object.keys(TEXTO_ESTADO_VISIBLE) as EstadoVisible[]

describe('Insignia', () => {
  it('muestra el texto y oculta el símbolo decorativo a lectores de pantalla', () => {
    const { container } = render(<Insignia texto="Retraso" tono="ambar" icono="▲" />)
    expect(screen.getByText('Retraso')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('▲')
  })
})

describe('InsigniaEstado (D31)', () => {
  it('el catálogo tiene los 13 estados confirmados', () => {
    expect(ESTADOS).toHaveLength(13)
    for (const nombre of ['Sin registrar', 'Salida anticipada', 'Almuerzo prolongado']) {
      expect(Object.values(TEXTO_ESTADO_VISIBLE)).toContain(nombre)
    }
  })

  it.each(ESTADOS)('el estado %s se comunica con texto, no solo con color', (estado) => {
    const { container } = render(<InsigniaEstado estado={estado} />)
    expect(container).toHaveTextContent(TEXTO_ESTADO_VISIBLE[estado])
    expect(TEXTO_ESTADO_VISIBLE[estado].trim().length).toBeGreaterThan(0)
    expect(PRESENTACION_ESTADO[estado].icono).not.toBe('')
  })

  it('cada estado tiene un texto distinto: dos estados nunca se distinguen solo por el color', () => {
    const textos = Object.values(TEXTO_ESTADO_VISIBLE)
    expect(new Set(textos).size).toBe(textos.length)
  })

  it('los estados críticos usan tono rojo y los de seguimiento tono verde o azul', () => {
    expect(PRESENTACION_ESTADO.SIN_REGISTRAR.tono).toBe('rojo')
    expect(PRESENTACION_ESTADO.EN_JORNADA.tono).toBe('verde')
    expect(PRESENTACION_ESTADO.EN_ALMUERZO.tono).toBe('azul')
  })
})
