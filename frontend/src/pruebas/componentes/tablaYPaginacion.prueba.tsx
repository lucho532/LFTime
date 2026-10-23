import { act, render, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Paginacion } from '../../componentes/base/Paginacion'
import { Tabla, type ColumnaTabla } from '../../componentes/base/Tabla'
import { useTablaPaginada } from '../../hooks/useTablaPaginada'
import { contieneTexto, normalizarTexto } from '../../utilidades/texto'

interface Fila {
  id: string
  nombre: string
  municipio: string
}

const COLUMNAS: ColumnaTabla<Fila>[] = [
  { clave: 'nombre', titulo: 'Nombre', render: (f) => f.nombre },
  { clave: 'municipio', titulo: 'Municipio', render: (f) => f.municipio },
]

function crearFilas(cantidad: number): Fila[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: `f${i + 1}`,
    nombre: i === 0 ? 'María Pérez' : `Persona ${i + 1}`,
    municipio: i % 2 === 0 ? 'Manizales' : 'Villamaría',
  }))
}

const opciones = {
  textoBuscable: (f: Fila) => `${f.nombre} ${f.municipio}`,
  filtros: { municipio: (f: Fila, valor: string) => f.municipio === valor },
}

describe('utilidades de texto', () => {
  it('normaliza sin tildes ni mayúsculas', () => {
    expect(normalizarTexto('  PÉREZ  ')).toBe('perez')
    expect(contieneTexto('María Pérez', 'perez')).toBe(true)
    expect(contieneTexto('María Pérez', '')).toBe(true)
    expect(contieneTexto('María Pérez', 'lopez')).toBe(false)
  })
})

describe('Tabla', () => {
  it('dibuja encabezados, filas y etiquetas por celda para la vista móvil', () => {
    render(<Tabla columnas={COLUMNAS} filas={crearFilas(2)} clavePorFila={(f) => f.id} descripcion="Personal" />)
    const tabla = screen.getByRole('table', { name: 'Personal' })
    expect(within(tabla).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Nombre', 'Municipio'])
    expect(within(tabla).getAllByRole('row')).toHaveLength(3)
    expect(within(tabla).getByText('María Pérez')).toHaveAttribute('data-etiqueta', 'Nombre')
  })

  it('sin filas muestra el estado vacío indicado en lugar de la tabla', () => {
    render(<Tabla columnas={COLUMNAS} filas={[]} clavePorFila={(f) => f.id} descripcion="Personal" vacio={<p>Nadie por aquí</p>} />)
    expect(screen.getByText('Nadie por aquí')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('Paginacion', () => {
  it('muestra el resumen y marca la página actual con aria-current', () => {
    render(<Paginacion paginaActual={2} totalPaginas={5} total={48} desde={11} hasta={20} onCambiarPagina={() => undefined} />)
    expect(screen.getByText('Mostrando 11 - 20 de 48')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Página 3' })).not.toHaveAttribute('aria-current')
  })

  it('cambia de página con los botones y deshabilita Anterior en la primera y Siguiente en la última', async () => {
    const cambiar = vi.fn()
    const { rerender } = render(<Paginacion paginaActual={1} totalPaginas={3} total={25} desde={1} hasta={10} onCambiarPagina={cambiar} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(cambiar).toHaveBeenLastCalledWith(2)
    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(cambiar).toHaveBeenLastCalledWith(3)
    rerender(<Paginacion paginaActual={3} totalPaginas={3} total={25} desde={21} hasta={25} onCambiarPagina={cambiar} />)
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('sin resultados lo dice y con una sola página no muestra botones', () => {
    const { rerender } = render(<Paginacion paginaActual={1} totalPaginas={1} total={0} desde={0} hasta={0} onCambiarPagina={() => undefined} />)
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<Paginacion paginaActual={1} totalPaginas={1} total={4} desde={1} hasta={4} onCambiarPagina={() => undefined} />)
    expect(screen.getByText('Mostrando 1 - 4 de 4')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('muestra como máximo cinco páginas numeradas', () => {
    render(<Paginacion paginaActual={8} totalPaginas={20} total={200} desde={71} hasta={80} onCambiarPagina={() => undefined} />)
    expect(screen.getAllByRole('button', { name: /^Página/ }).map((b) => b.textContent)).toEqual(['6', '7', '8', '9', '10'])
  })
})

describe('useTablaPaginada', () => {
  it('pagina de 10 en 10: 48 filas son 5 páginas y la última muestra 8', () => {
    const { result } = renderHook(() => useTablaPaginada(crearFilas(48), opciones))
    expect(result.current).toMatchObject({ total: 48, totalPaginas: 5, paginaActual: 1, desde: 1, hasta: 10 })
    act(() => result.current.irAPagina(5))
    expect(result.current).toMatchObject({ paginaActual: 5, desde: 41, hasta: 48 })
    expect(result.current.filasPagina).toHaveLength(8)
  })

  it('no sale del rango de páginas', () => {
    const { result } = renderHook(() => useTablaPaginada(crearFilas(48), opciones))
    act(() => result.current.irAPagina(99))
    expect(result.current.paginaActual).toBe(5)
    act(() => result.current.irAPagina(-3))
    expect(result.current.paginaActual).toBe(1)
  })

  it('busca ignorando mayúsculas y tildes, y vuelve a la página 1', () => {
    const { result } = renderHook(() => useTablaPaginada(crearFilas(48), opciones))
    act(() => result.current.irAPagina(3))
    act(() => result.current.setBusqueda('MARIA perez'))
    expect(result.current.paginaActual).toBe(1)
    expect(result.current.filasPagina.map((f) => f.nombre)).toEqual(['María Pérez'])
    expect(result.current.total).toBe(1)
  })

  it('aplica filtros, un valor vacío no filtra y se combinan con la búsqueda', () => {
    const { result } = renderHook(() => useTablaPaginada(crearFilas(48), opciones))
    act(() => result.current.setFiltro('municipio', 'Villamaría'))
    expect(result.current.total).toBe(24)
    act(() => result.current.setFiltro('municipio', ''))
    expect(result.current.total).toBe(48)
    act(() => {
      result.current.setFiltro('municipio', 'Manizales')
      result.current.setBusqueda('Persona 31')
    })
    expect(result.current.filasPagina.map((f) => f.nombre)).toEqual(['Persona 31'])
  })

  it('sin coincidencias informa 0 resultados con una página', () => {
    const { result } = renderHook(() => useTablaPaginada(crearFilas(48), opciones))
    act(() => result.current.setBusqueda('no existe'))
    expect(result.current).toMatchObject({ total: 0, totalPaginas: 1, desde: 0, hasta: 0 })
    expect(result.current.filasPagina).toEqual([])
  })
})
