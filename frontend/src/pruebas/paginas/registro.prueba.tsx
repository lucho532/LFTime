import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'
import { obtenerUbicacionActual, type ResultadoUbicacion } from '../../utilidades/geolocalizacion'

// La geolocalización real del navegador no existe en jsdom: solo en las pruebas se sustituye por una respuesta controlada.
vi.mock('../../utilidades/geolocalizacion', () => ({ obtenerUbicacionActual: vi.fn() }))
const ubicacionDelDispositivo = vi.mocked(obtenerUbicacionActual)

function responder(resultado: ResultadoUbicacion) {
  ubicacionDelDispositivo.mockResolvedValue(resultado)
}

function ubicacionEnHospital(desplazamientoGrados = 0, precisionMetros = 10): ResultadoUbicacion {
  const { latitud, longitud } = repositorios.hospitales.obtenerPorId('hosp-01')!.coordenadas!
  return { exito: true, ubicacion: { latitud: latitud + desplazamientoGrados, longitud, precisionMetros } }
}

async function abrirRegistro(usuarioId = 'usr-trab-001') {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={['/registro']}>
      <App />
    </MemoryRouter>,
  )
}

describe('pantalla de registro del trabajador (HU-05, CA-1 a CA-5, CA-11)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T12:00:00Z'))
    ubicacionDelDispositivo.mockReset()
    repositorios.hospitales.listar() // inicializa la demostración antes de vaciar
    repositorios.marcaciones.reemplazarTodo([])
    repositorios.intentos.reemplazarTodo([])
    repositorios.incidencias.reemplazarTodo([])
    repositorios.alertas.reemplazarTodo([])
  })

  it('ofrece solo la entrada y declara que la ubicación no la valida un servidor', async () => {
    await abrirRegistro()
    expect(await screen.findByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Registrar (salida|regreso)/ })).not.toBeInTheDocument()
    expect(screen.getAllByText(/ningún servidor la valida|no están validadas por el servidor/).length).toBeGreaterThan(0)
  })

  it('registra con la ubicación del dispositivo y pasa a ofrecer solo la acción siguiente', async () => {
    responder(ubicacionEnHospital(0.0002))
    await abrirRegistro()
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar entrada' }))
    expect(await screen.findByText('Registro guardado en esta demostración.')).toBeInTheDocument()
    expect(screen.getByText(/no está validada por un servidor/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Registrar salida a almuerzo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar entrada' })).not.toBeInTheDocument()
    expect(screen.getByText(/Tiempo desde tu entrada/)).toBeInTheDocument()
  })

  it('muestra los tres tiempos por separado y «Incompleto» mientras falta una marca (D16, D21)', async () => {
    responder(ubicacionEnHospital())
    await abrirRegistro()
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar entrada' }))
    await screen.findByRole('button', { name: 'Registrar salida a almuerzo' })
    for (const rotulo of ['Tiempo efectivo', 'Tiempo de almuerzo', 'Total de la jornada']) {
      expect(screen.getByText(rotulo).nextElementSibling).toHaveTextContent('Incompleto')
    }
  })

  it('un intento fuera de radio no registra nada, explica el motivo y queda en intentos rechazados (CA-3, CA-5)', async () => {
    responder(ubicacionEnHospital(0.002))
    await abrirRegistro()
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar entrada' }))
    expect(await screen.findByText(/del hospital y el máximo permitido \(valor provisional\) es 100 m/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
    const tablaIntentos = await screen.findByRole('table', { name: /intentos de marcación rechazados/ })
    expect(within(tablaIntentos).getByText('Ubicación fuera del radio del hospital')).toBeInTheDocument()
    expect(screen.getByText('Todavía no has registrado nada hoy.')).toBeInTheDocument()
  })

  it('un fallo técnico no se presenta como ubicación indebida y el reintento vuelve a pedir la ubicación (CA-14, D13)', async () => {
    responder({ exito: false, motivo: 'PERMISO_BLOQUEADO' })
    await abrirRegistro()
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar entrada' }))
    expect(await screen.findByText(/Configuración del sitio/)).toBeInTheDocument()
    expect(screen.getByText('No se registró (fallo técnico).')).toBeInTheDocument()
    expect(ubicacionDelDispositivo).toHaveBeenCalledTimes(1)

    responder(ubicacionEnHospital())
    await userEvent.click(screen.getByRole('button', { name: 'Registrar entrada' }))
    expect(await screen.findByText('Registro guardado en esta demostración.')).toBeInTheDocument()
    expect(ubicacionDelDispositivo).toHaveBeenCalledTimes(2)
    expect(repositorios.incidencias.listar()).toHaveLength(0)
  })

  it('en un hospital sin coordenadas confirmadas explica la situación y no ofrece ningún botón de marcar (CA-11)', async () => {
    await abrirRegistro('usr-trab-016')
    expect(await screen.findByText(/necesita configuración antes de habilitar el registro/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Registrar/ })).not.toBeInTheDocument()
    expect(ubicacionDelDispositivo).not.toHaveBeenCalled()
  })

  it('el coordinador no puede abrir la pantalla de registro', async () => {
    await abrirRegistro('usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Pantalla no disponible para tu rol' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar entrada' })).not.toBeInTheDocument()
  })
})
