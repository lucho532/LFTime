import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Aviso } from '../../componentes/base/Aviso'
import { Tarjeta } from '../../componentes/base/Tarjeta'
import { Confirmacion } from '../../componentes/estados/Confirmacion'
import { EstadoCarga } from '../../componentes/estados/EstadoCarga'
import { EstadoError } from '../../componentes/estados/EstadoError'
import { EstadoVacio } from '../../componentes/estados/EstadoVacio'

describe('Aviso', () => {
  it.each([
    ['info', 'Información', 'status'],
    ['exito', 'Listo', 'status'],
    ['advertencia', 'Atención', 'status'],
    ['error', 'Error', 'alert'],
  ] as const)('el tipo %s se comunica con el rótulo «%s» y el rol %s', (tipo, rotulo, rol) => {
    render(<Aviso tipo={tipo}>Mensaje</Aviso>)
    const aviso = screen.getByRole(rol)
    expect(aviso).toHaveTextContent(`${rotulo}.`)
    expect(aviso).toHaveTextContent('Mensaje')
  })

  it('permite un título propio', () => {
    render(<Aviso titulo="Importante">Revisa los datos</Aviso>)
    expect(screen.getByRole('status')).toHaveTextContent('Importante.')
  })
})

describe('Tarjeta', () => {
  it('muestra el título como encabezado y las acciones', () => {
    render(
      <Tarjeta titulo="Alertas" acciones={<a href="/alertas">Ver todas</a>}>
        Contenido
      </Tarjeta>,
    )
    expect(screen.getByRole('heading', { name: 'Alertas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas' })).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('sin título ni acciones no dibuja encabezado', () => {
    render(<Tarjeta>Solo contenido</Tarjeta>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})

describe('estados de pantalla', () => {
  it('EstadoCarga se anuncia como estado, con mensaje por defecto y personalizable', () => {
    const { rerender } = render(<EstadoCarga />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…')
    rerender(<EstadoCarga mensaje="Cargando personal…" />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando personal…')
  })

  it('EstadoError se anuncia como alerta y ofrece reintentar solo si se le da la acción', async () => {
    const reintentar = vi.fn()
    const { rerender } = render(<EstadoError mensaje="No se pudo cargar el personal." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un problema. No se pudo cargar el personal.')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
    rerender(<EstadoError mensaje="No se pudo cargar el personal." onReintentar={reintentar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reintentar).toHaveBeenCalledTimes(1)
  })

  it('EstadoVacio explica qué pasa y ofrece una acción opcional', () => {
    render(<EstadoVacio titulo="Sin incidencias" descripcion="No hay incidencias pendientes." accion={<button type="button">Ver historial</button>} />)
    expect(screen.getByRole('heading', { name: 'Sin incidencias' })).toBeInTheDocument()
    expect(screen.getByText('No hay incidencias pendientes.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver historial' })).toBeInTheDocument()
  })

  it('Confirmacion lleva el rótulo «Listo» y se cierra solo si se le da la acción', async () => {
    const cerrar = vi.fn()
    const { rerender } = render(<Confirmacion mensaje="Hospital guardado en esta demostración." />)
    expect(screen.getByRole('status')).toHaveTextContent('Listo. Hospital guardado en esta demostración.')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<Confirmacion mensaje="Hospital guardado en esta demostración." onCerrar={cerrar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar mensaje' }))
    expect(cerrar).toHaveBeenCalledTimes(1)
  })
})
