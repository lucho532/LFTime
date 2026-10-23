import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { reiniciarAlmacenamientoParaPruebas } from '../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../repositorios/demo/inicializacionDemo'
import { servicios } from '../servicios/fabrica'

function renderizar(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

async function ingresarComo(nombre: string) {
  await userEvent.click(await screen.findByRole('button', { name: new RegExp(`Ingresar como ${nombre}`) }))
}

function enlacesDelMenu() {
  const menu = screen.getByRole('navigation', { name: 'Navegación principal' })
  return within(menu).getAllByRole('link').map((enlace) => enlace.textContent)
}

describe('App: ingreso simulado, menú y acceso por rol (D9, D27)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
  })

  it('sin sesión lleva al ingreso, que ofrece los 8 usuarios de prueba y el aviso de demostración', async () => {
    renderizar('/inicio')
    expect(await screen.findByRole('heading', { name: 'Ingreso a la demostración' })).toBeInTheDocument()
    expect(await screen.findAllByRole('button', { name: /^Ingresar como/ })).toHaveLength(8)
    expect(screen.getByText(/control de acceso por rol es solo visual/i)).toBeInTheDocument()
    expect(screen.getByText(/No hay contraseñas/i)).toBeInTheDocument()
  })

  it('un coordinador llega al panel y ve su menú, sin Registro ni Configuración', async () => {
    renderizar('/')
    await ingresarComo('Laura Gómez')
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
    expect(enlacesDelMenu()).toEqual(['Inicio', 'Personal', 'Hospitales / Municipios', 'Jornadas', 'Incidencias', 'Reportes'])
  })

  it('un administrador ve además la Configuración', async () => {
    renderizar('/')
    await ingresarComo('Carolina Mejía')
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
    expect(enlacesDelMenu()).toContain('Configuración')
    expect(enlacesDelMenu()).not.toContain('Registro')
  })

  it('un trabajador aterriza en el registro y ve solo lo propio', async () => {
    renderizar('/')
    await ingresarComo('María López')
    expect(await screen.findByRole('heading', { name: 'Registro de jornada' })).toBeInTheDocument()
    expect(enlacesDelMenu()).toEqual(['Mi ficha', 'Mi horario', 'Registro', 'Mis incidencias'])
  })

  it('el menú marca la página actual con aria-current', async () => {
    renderizar('/')
    await ingresarComo('Laura Gómez')
    await screen.findByRole('heading', { name: 'Inicio' })
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('link', { name: 'Reportes' }))
    expect(screen.getByRole('link', { name: 'Reportes' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current')
  })

  it.each([
    ['usr-coord-1', 'Coordinador', '/configuracion'],
    ['usr-coord-1', 'Coordinador', '/registro'],
    ['usr-trab-001', 'Trabajador', '/hospitales'],
    ['usr-trab-001', 'Trabajador', '/inicio'],
  ])('con sesión de %s (%s), la pantalla %s no está disponible y se explica que es solo visual', async (usuarioId, _rol, ruta) => {
    await servicios.sesion.iniciarSesion(usuarioId)
    renderizar(ruta)
    expect(await screen.findByRole('heading', { name: 'Pantalla no disponible para tu rol' })).toBeInTheDocument()
    expect(screen.getAllByText(/solo visual/i).length).toBeGreaterThan(0)
  })

  it('recuerda a dónde se quería ir si el rol lo permite, y si no lleva a su inicio', async () => {
    renderizar('/reportes')
    await ingresarComo('Laura Gómez')
    expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
  })

  it('al ingresar con un rol sin acceso al destino recordado, va a su pantalla de inicio', async () => {
    renderizar('/reportes')
    await ingresarComo('María López')
    expect(await screen.findByRole('heading', { name: 'Registro de jornada' })).toBeInTheDocument()
  })

  it('la sesión se recuerda al volver a abrir la aplicación', async () => {
    const primera = renderizar('/')
    await ingresarComo('Laura Gómez')
    await screen.findByRole('heading', { name: 'Inicio' })
    primera.unmount()
    renderizar('/')
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ingreso a la demostración' })).not.toBeInTheDocument()
  })

  it('cerrar sesión desde el menú del perfil vuelve al ingreso y borra la sesión', async () => {
    renderizar('/')
    await ingresarComo('Laura Gómez')
    await screen.findByRole('heading', { name: 'Inicio' })
    const botonPerfil = screen.getByRole('button', { name: /Laura Gómez/ })
    expect(botonPerfil).toHaveAttribute('aria-expanded', 'false')
    expect(botonPerfil).toHaveTextContent('Coordinador')
    await userEvent.click(botonPerfil)
    expect(botonPerfil).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Ingreso a la demostración' })).toBeInTheDocument()
    expect(window.localStorage.getItem('lftime.demo.sesion')).toBeNull()
  })

  it('el menú del perfil se cierra con Escape', async () => {
    renderizar('/')
    await ingresarComo('Laura Gómez')
    await screen.findByRole('heading', { name: 'Inicio' })
    await userEvent.click(screen.getByRole('button', { name: /Laura Gómez/ }))
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('el botón de menú abre y cierra la navegación y se cierra al cambiar de página', async () => {
    renderizar('/')
    await ingresarComo('Laura Gómez')
    await screen.findByRole('heading', { name: 'Inicio' })
    const boton = screen.getByRole('button', { name: 'Menú de navegación' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toHaveClass('barra-lateral--abierta')
    await userEvent.click(screen.getByRole('link', { name: 'Personal' }))
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('muestra la marca y el aviso permanente de modo demostración con la acción de restablecer', async () => {
    renderizar('/')
    await ingresarComo('Laura Gómez')
    await screen.findByRole('heading', { name: 'Inicio' })
    expect(screen.getByText('Cada minuto cuenta')).toBeInTheDocument()
    expect(screen.getByText(/Modo demostración/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Restablecer datos de demostración/i })).toBeInTheDocument()
  })

  it('restablecer borra los datos guardados y recarga la página', async () => {
    const recargar = vi.fn()
    Object.defineProperty(window, 'location', { value: { ...window.location, reload: recargar }, writable: true })
    renderizar('/ingreso')
    await waitFor(() => expect(window.localStorage.getItem('lftime.demo.version')).toBe('2'))
    window.localStorage.setItem('lftime.demo.configuracion', '{"toleranciaSalidaMinutos":99}')
    await userEvent.click(screen.getByRole('button', { name: /Restablecer datos de demostración/i }))
    await waitFor(() => expect(recargar).toHaveBeenCalledTimes(1))
    expect(window.localStorage.getItem('lftime.demo.configuracion')).toBeNull()
    expect(window.localStorage.getItem('lftime.demo.version')).toBe('2')
  })

  it('advierte cuando los datos guardados son de otra versión', async () => {
    window.localStorage.setItem('lftime.demo.version', '0')
    renderizar('/ingreso')
    expect(await screen.findByText(/otra versión de la demostración/i)).toBeInTheDocument()
  })
})
