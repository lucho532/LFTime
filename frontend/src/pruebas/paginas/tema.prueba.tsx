import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { servicios } from '../../servicios/fabrica'
import { aplicarTema, CLAVE_PREFERENCIA_TEMA, guardarTema, leerTemaGuardado, obtenerTemaInicial } from '../../utilidades/tema'

function simularSistemaOscuro(oscuro: boolean) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({ matches: oscuro && consulta.includes('dark'), media: consulta }))
}

describe('tema claro y oscuro (D32, T-12.3)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    delete document.documentElement.dataset.tema
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.tema
  })

  it('sin preferencia guardada sigue al sistema; con preferencia guardada manda la preferencia', () => {
    simularSistemaOscuro(true)
    expect(obtenerTemaInicial()).toBe('oscuro')
    guardarTema('claro')
    expect(leerTemaGuardado()).toBe('claro')
    expect(obtenerTemaInicial()).toBe('claro')
  })

  it('ignora una preferencia guardada inválida y usa claro si el navegador no informa el tema del sistema', () => {
    window.localStorage.setItem(CLAVE_PREFERENCIA_TEMA, 'morado')
    vi.stubGlobal('matchMedia', undefined)
    expect(leerTemaGuardado()).toBeNull()
    expect(obtenerTemaInicial()).toBe('claro')
  })

  it('la preferencia no se borra al restablecer los datos de demostración (otro prefijo)', () => {
    expect(CLAVE_PREFERENCIA_TEMA.startsWith('lftime.demo.')).toBe(false)
  })

  it('el menú del perfil dice a qué tema cambia, lo aplica a toda la pantalla y guarda la preferencia', async () => {
    simularSistemaOscuro(false)
    aplicarTema(obtenerTemaInicial())
    await servicios.sesion.iniciarSesion('usr-coord-1')
    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <App />
      </MemoryRouter>,
    )
    await userEvent.click(await screen.findByRole('button', { name: /Laura Gómez/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }))
    expect(document.documentElement.dataset.tema).toBe('oscuro')
    expect(leerTemaGuardado()).toBe('oscuro')

    // El menú sigue abierto y el botón ahora dice a qué tema vuelve.
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }))
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(leerTemaGuardado()).toBe('claro')
  })
})
