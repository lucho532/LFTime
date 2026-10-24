import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { servicios } from '../../servicios/fabrica'

vi.mock('../../repositorios/demo/almacenFotos', async () => {
  const { AlmacenFotosEnMemoria } = await import('../ayudas/almacenFotosEnMemoria')
  return { almacenFotos: new AlmacenFotosEnMemoria() }
})

async function abrir(ruta: string, usuarioId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

describe('ficha de administrador y coordinador (P-13)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
  })

  it('el coordinador abre su ficha desde el menú del perfil y ve sus datos, su rol y sus hospitales a cargo', async () => {
    await abrir('/inicio', 'usr-coord-1')
    await userEvent.click(await screen.findByRole('button', { name: /Laura Gómez/ }))
    await userEvent.click(screen.getByRole('link', { name: 'Mi ficha' }))
    expect(await screen.findByRole('heading', { name: 'Laura Gómez' })).toBeInTheDocument()
    const datos = screen.getByText('Documento').closest('dl')!
    expect(within(datos).getByText('CC 1.020.304.052')).toBeInTheDocument()
    expect(within(datos).getByText('Coordinadora de personal de salud')).toBeInTheDocument()
    expect(within(datos).getByText('Coordinador')).toBeInTheDocument()
    expect(within(datos).getByText('Hospital San José, Hospital La Merced')).toBeInTheDocument()
  })

  it('el lápiz dentro de la tarjeta edita los datos y el menú refleja el nombre nuevo', async () => {
    await abrir('/usuarios/usr-coord-1', 'usr-coord-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Editar datos personales' }))
    const dialogo = screen.getByRole('dialog', { name: 'Editar datos personales' })
    const nombres = within(dialogo).getByLabelText(/Nombres/)
    await userEvent.clear(nombres)
    await userEvent.type(nombres, 'Laura Elena')
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar datos' }))
    expect(await screen.findByText('Datos guardados en esta demostración.')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Laura Elena Gómez' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Laura Elena Gómez/ })).toBeInTheDocument()
  })

  it('un dato inválido muestra el error y no guarda', async () => {
    await abrir('/usuarios/usr-admin-1', 'usr-admin-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Editar datos personales' }))
    const dialogo = screen.getByRole('dialog', { name: 'Editar datos personales' })
    await userEvent.clear(within(dialogo).getByLabelText(/Cargo o servicio/))
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar datos' }))
    expect(await within(dialogo).findByText('Escribe el cargo o servicio que presta.')).toBeInTheDocument()
    expect((await servicios.usuarios.obtenerPorId('usr-admin-1'))?.cargo).toBe('Administradora general')
  })

  it('el administrador abre la ficha de otra persona desde Configuración y puede editarla', async () => {
    await abrir('/configuracion', 'usr-admin-1')
    await userEvent.click(await screen.findByRole('link', { name: 'Andrés Salazar' }))
    expect(await screen.findByRole('heading', { name: 'Andrés Salazar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar datos personales' })).toBeInTheDocument()
  })

  it('el coordinador no puede abrir la ficha de otro coordinador', async () => {
    await abrir('/usuarios/usr-coord-2', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Pantalla no disponible para tu rol' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar datos personales' })).not.toBeInTheDocument()
  })

  it('el trabajador va a su ficha desde la tarjeta de la pantalla principal y desde la pestaña Perfil', async () => {
    await abrir('/registro', 'usr-trab-001')
    const tarjeta = await screen.findByRole('link', { name: /Abrir mi ficha/ })
    expect(tarjeta).toHaveAttribute('href', '/personal/trab-001')
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/personal/trab-001')
  })
})
