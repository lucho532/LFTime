import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

async function abrir(ruta: string, usuarioId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

describe('panel de coordinación (HU-01)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:30:00Z'))
    repositorios.hospitales.listar() // inicializa la demostración antes de vaciar
    repositorios.marcaciones.reemplazarTodo([])
    repositorios.intentos.reemplazarTodo([])
    repositorios.incidencias.reemplazarTodo([])
    repositorios.alertas.reemplazarTodo([])
    repositorios.auditoria.reemplazarTodo([])
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    establecerRelojParaPruebas()
  })

  it('muestra saludo, tarjetas con enlace a su detalle, tabla, alertas, resumen por hospital, mapa y métricas', async () => {
    await abrir('/inicio', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Hola, Laura' })).toBeInTheDocument()
    const tarjetas = within(screen.getByRole('list', { name: 'Indicadores del día' }))
    expect(tarjetas.getByRole('link', { name: /Personal activo/ })).toHaveAttribute('href', '/personal')
    expect(tarjetas.getByRole('link', { name: /En jornada/ })).toHaveAttribute('href', expect.stringContaining('indicador=enJornada'))
    expect(tarjetas.getByRole('link', { name: /Con incidencias/ })).toHaveAttribute('href', '/incidencias')

    expect(screen.getByRole('heading', { name: 'Personal en tiempo real' })).toBeInTheDocument()
    for (const etiqueta of ['Buscar', 'Municipio', 'Estado']) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument()
    }
    expect(screen.getByText(/Mostrando 1 - 10 de 48/)).toBeInTheDocument()
    for (const titulo of ['Alertas e incidencias', 'Resumen por hospital', 'Ubicación de hospitales', 'Horas trabajadas hoy', 'Estados del personal', 'Promedio de almuerzo']) {
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument()
    }
    expect(screen.getByText('Todavía no hay almuerzos completos hoy.')).toBeInTheDocument()
    expect(screen.getByText(/Última actualización:/)).toHaveTextContent('08:30 a. m.')
    expect(screen.getAllByText(/Sin revisar/).length).toBeGreaterThan(0)
  })

  it('una tarjeta lleva a la tabla filtrada con el mismo número de personas', async () => {
    await abrir('/inicio', 'usr-coord-1')
    const tarjeta = await screen.findByRole('link', { name: /Sin entrada registrada/ })
    const cantidad = Number(tarjeta.querySelector('.tarjetas-indicadores__valor')?.textContent)
    expect(cantidad).toBeGreaterThan(0)
    await userEvent.click(tarjeta)
    expect(await screen.findByText(/Mostrando solo:/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`de ${cantidad}$`))).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Ver todo el personal' }))
    await waitFor(() => expect(screen.queryByText(/Mostrando solo:/)).not.toBeInTheDocument())
  })

  it('la búsqueda y el filtro por estado reducen la tabla', async () => {
    await abrir('/inicio', 'usr-coord-1')
    await userEvent.type(await screen.findByLabelText(/Buscar/), 'López')
    expect(await screen.findByText('María López')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Ramírez')).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'EN_ALMUERZO')
    expect(await screen.findByText(/Nadie coincide/)).toBeInTheDocument()
  })

  it('«Actualizar» y el intervalo configurado vuelven a pedir los datos sin perder la búsqueda', async () => {
    const pedir = vi.spyOn(servicios.panel, 'obtenerInstantanea')
    await abrir('/inicio', 'usr-coord-1')
    await userEvent.type(await screen.findByLabelText(/Buscar/), 'López')
    expect(pedir).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    await waitFor(() => expect(pedir).toHaveBeenCalledTimes(2))
    expect(screen.getByLabelText(/Buscar/)).toHaveValue('López')
  })

  it('el temporizador vuelve a pedir el panel cada 60 segundos', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const pedir = vi.spyOn(servicios.panel, 'obtenerInstantanea')
    await abrir('/inicio', 'usr-coord-1')
    await screen.findByRole('heading', { name: 'Personal en tiempo real' })
    expect(pedir).toHaveBeenCalledTimes(1)
    establecerRelojParaPruebas(() => new Date('2026-10-23T13:31:00Z'))
    await act(async () => {
      vi.advanceTimersByTime(59_000)
    })
    expect(pedir).toHaveBeenCalledTimes(1)
    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })
    await waitFor(() => expect(pedir).toHaveBeenCalledTimes(2))
    expect(screen.getByText(/Última actualización:/)).toHaveTextContent('08:31 a. m.')
  })

  it('si la actualización falla conserva lo mostrado y lo avisa', async () => {
    const pedir = vi.spyOn(servicios.panel, 'obtenerInstantanea')
    await abrir('/inicio', 'usr-coord-1')
    await screen.findByRole('heading', { name: 'Personal en tiempo real' })
    pedir.mockRejectedValueOnce(new Error('sin conexión'))
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/datos de la última actualización correcta/)
    expect(screen.getByRole('heading', { name: 'Personal en tiempo real' })).toBeInTheDocument()
  })

  it('el trabajador no entra al panel', async () => {
    await abrir('/inicio', 'usr-trab-001')
    expect(screen.queryByRole('heading', { name: 'Personal en tiempo real' })).not.toBeInTheDocument()
  })
})
