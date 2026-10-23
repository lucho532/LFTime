import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { CAMPOS_REGLAS } from '../../configuracion/camposReglas'
import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { servicios } from '../../servicios/fabrica'
import { validarReglasProvisionales } from '../../validadores/reglasProvisionales'

async function abrir(ruta: string, usuarioId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

const textosPorDefecto = () =>
  Object.fromEntries(Object.entries(REGLAS_PROVISIONALES_POR_DEFECTO).map(([clave, valor]) => [clave, String(valor)])) as Record<keyof typeof REGLAS_PROVISIONALES_POR_DEFECTO, string>

describe('validarReglasProvisionales', () => {
  it('acepta los valores por defecto', () => {
    expect(validarReglasProvisionales(textosPorDefecto())).toEqual({ valores: REGLAS_PROVISIONALES_POR_DEFECTO, errores: {} })
  })

  it('rechaza vacíos, decimales y valores fuera de rango, todos juntos, y no entrega valores', () => {
    const resultado = validarReglasProvisionales({ ...textosPorDefecto(), toleranciaEntradaMinutos: '', umbralAusenciaMinutos: '0', radioPermitidoMetros: '12.5', intervaloActualizacionSegundos: '99999' })
    expect(resultado.valores).toBeNull()
    expect(Object.keys(resultado.errores).sort()).toEqual(['intervaloActualizacionSegundos', 'radioPermitidoMetros', 'toleranciaEntradaMinutos', 'umbralAusenciaMinutos'])
    expect(resultado.errores.umbralAusenciaMinutos).toBe('Debe estar entre 1 y 480 minutos.')
  })
})

describe('pantalla de configuración (HU-09, T-12.1)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
  })

  it('el administrador ve todas las reglas rotuladas «Provisional», los usuarios de prueba y el restablecimiento', async () => {
    await abrir('/configuracion', 'usr-admin-1')
    expect(await screen.findByRole('heading', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.getAllByText('Provisional')).toHaveLength(CAMPOS_REGLAS.length)
    expect(screen.getByLabelText(/Tolerancia de entrada/)).toHaveValue(0)
    expect(screen.getByRole('heading', { name: 'Usuarios de prueba' })).toBeInTheDocument()
    expect(screen.getAllByText('Ricardo Pardo').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Restablecer datos de demostración…' })).toBeInTheDocument()
  })

  it('guarda una regla válida en el servicio y avisa que sigue siendo provisional', async () => {
    await abrir('/configuracion', 'usr-admin-1')
    const campo = await screen.findByLabelText(/Umbral de ausencia aparente/)
    await userEvent.clear(campo)
    await userEvent.type(campo, '45')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar reglas' }))
    expect(await screen.findByText(/Siguen siendo provisionales/)).toBeInTheDocument()
    expect((await servicios.configuracion.obtenerReglas()).umbralAusenciaMinutos).toBe(45)
  })

  it('un valor inválido muestra el error y no guarda nada', async () => {
    await abrir('/configuracion', 'usr-admin-1')
    const campo = await screen.findByLabelText(/Radio permitido/)
    await userEvent.clear(campo)
    await userEvent.type(campo, '1')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar reglas' }))
    expect(await screen.findByText('Debe estar entre 10 y 5000 metros.')).toBeInTheDocument()
    expect((await servicios.configuracion.obtenerReglas()).radioPermitidoMetros).toBe(100)
  })

  it('«Restablecer valores por defecto» devuelve los valores y los muestra', async () => {
    await servicios.sesion.iniciarSesion('usr-admin-1')
    await servicios.configuracion.guardarReglas({ ...REGLAS_PROVISIONALES_POR_DEFECTO, umbralAusenciaMinutos: 200 })
    render(
      <MemoryRouter initialEntries={['/configuracion']}>
        <App />
      </MemoryRouter>,
    )
    const campo = await screen.findByLabelText(/Umbral de ausencia aparente/)
    expect(campo).toHaveValue(200)
    await userEvent.click(screen.getByRole('button', { name: 'Restablecer valores por defecto' }))
    await waitFor(() => expect(screen.getByLabelText(/Umbral de ausencia aparente/)).toHaveValue(60))
  })

  it('restablecer los datos de demostración pide confirmación antes de actuar', async () => {
    await abrir('/configuracion', 'usr-admin-1')
    await userEvent.click(await screen.findByRole('button', { name: /Restablecer datos de demostración…/ }))
    const confirmacion = screen.getByText(/¿Seguro\?/)
    expect(confirmacion).toBeInTheDocument()
    await userEvent.click(within(confirmacion.closest('.restablecer-datos-demo')!).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText(/¿Seguro\?/)).not.toBeInTheDocument()
  })

  it('el coordinador no entra a la configuración', async () => {
    await abrir('/configuracion', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Pantalla no disponible para tu rol' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Configuración' })).not.toBeInTheDocument()
  })
})
