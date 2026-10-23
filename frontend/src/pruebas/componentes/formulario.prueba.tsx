import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Boton } from '../../componentes/base/Boton'
import { Campo } from '../../componentes/base/Campo'
import { Selector } from '../../componentes/base/Selector'

describe('Boton', () => {
  it('no envía formularios por accidente: type="button" por defecto', () => {
    render(<Boton>Guardar</Boton>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('type', 'button')
  })

  it('ejecuta la acción al pulsarlo', async () => {
    const accion = vi.fn()
    render(<Boton onClick={accion}>Guardar</Boton>)
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(accion).toHaveBeenCalledTimes(1)
  })

  it('mientras carga queda deshabilitado y marcado como ocupado', async () => {
    const accion = vi.fn()
    render(<Boton cargando onClick={accion}>Guardar</Boton>)
    const boton = screen.getByRole('button', { name: 'Guardar' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(boton)
    expect(accion).not.toHaveBeenCalled()
  })

  it('aplica la variante pedida', () => {
    render(<Boton variante="peligro">Eliminar</Boton>)
    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveClass('boton--peligro')
  })
})

describe('Campo', () => {
  it('asocia la etiqueta con el control', async () => {
    render(<Campo etiqueta="Nombre" />)
    await userEvent.type(screen.getByLabelText('Nombre'), 'María')
    expect(screen.getByLabelText('Nombre')).toHaveValue('María')
  })

  it('indica por texto que es obligatorio', () => {
    render(<Campo etiqueta="Cédula" required />)
    expect(screen.getByLabelText(/Cédula/)).toBeRequired()
    expect(screen.getByText('(obligatorio)', { exact: false })).toBeInTheDocument()
  })

  it('muestra el error como alerta y lo enlaza con el control', () => {
    render(<Campo etiqueta="Latitud" ayuda="Entre -90 y 90" error="La latitud debe estar entre -90 y 90." />)
    const campo = screen.getByLabelText('Latitud')
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('La latitud debe estar entre -90 y 90.')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo.getAttribute('aria-describedby')).toContain(error.id)
    expect(campo.getAttribute('aria-describedby')).toContain(screen.getByText('Entre -90 y 90').id)
  })

  it('sin error no marca el campo como inválido', () => {
    render(<Campo etiqueta="Nombre" />)
    expect(screen.getByLabelText('Nombre')).not.toHaveAttribute('aria-invalid')
  })
})

describe('Selector', () => {
  const opciones = [
    { valor: 'a', etiqueta: 'Manizales' },
    { valor: 'b', etiqueta: 'Villamaría' },
  ]

  it('muestra las opciones y permite elegir', async () => {
    render(<Selector etiqueta="Municipio" opciones={opciones} textoVacio="Todos los municipios" />)
    const selector = screen.getByLabelText('Municipio')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Todos los municipios', 'Manizales', 'Villamaría'])
    await userEvent.selectOptions(selector, 'b')
    expect(selector).toHaveValue('b')
  })

  it('sin textoVacio no agrega opción vacía', () => {
    render(<Selector etiqueta="Municipio" opciones={opciones} />)
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('muestra el error enlazado al control', () => {
    render(<Selector etiqueta="Municipio" opciones={opciones} error="Elige un municipio." />)
    expect(screen.getByLabelText('Municipio')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Elige un municipio.')
  })
})
