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

/** Flujo de la aplicación móvil: el botón de la pantalla principal abre la confirmación, y esta lo registra. */
async function registrar(nombre: string) {
  await userEvent.click(await screen.findByRole('button', { name: nombre }))
  await userEvent.click(await screen.findByRole('button', { name: nombre }))
}

describe('aplicación móvil del trabajador: registro (HU-05, CA-1 a CA-5, CA-11)', () => {
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

  it('lo primero que se ve es el cronómetro en vivo con el botón de la acción; la persona y la campana van arriba a la derecha', async () => {
    await abrirRegistro()
    expect(await screen.findByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Registrar (salida|regreso)/ })).not.toBeInTheDocument()
    const cronometro = screen.getByRole('timer', { name: 'Tiempo trabajado hoy' })
    expect(cronometro).toHaveTextContent('--:--:--')
    // El cronómetro y el botón van antes que la tarjeta del hospital.
    const botonRegistrar = screen.getByRole('button', { name: 'Registrar entrada' })
    expect(cronometro.compareDocumentPosition(botonRegistrar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(botonRegistrar.compareDocumentPosition(screen.getByText('Hospital San José')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const barra = screen.getByRole('banner')
    expect(within(barra).getByRole('link', { name: 'Abrir mi ficha: María López' })).toHaveAttribute('href', '/personal/trab-001')
    expect(within(barra).getByRole('link', { name: /^Mis incidencias: / })).toHaveAttribute('href', '/incidencias')
    expect(screen.getByRole('button', { name: 'Ver detalle de la jornada' })).toBeInTheDocument()
    expect(screen.getByText(/07:00/)).toBeInTheDocument()
    expect(screen.getByText(/hora de Colombia/)).toBeInTheDocument()
    expect(screen.getByText(/Recuerda:/)).toBeInTheDocument()
    expect(screen.getAllByText(/ningún servidor la valida|no están validadas por el servidor/).length).toBeGreaterThan(0)
  })

  it('registra con la ubicación del dispositivo y pasa a ofrecer solo la acción siguiente', async () => {
    responder(ubicacionEnHospital(0.0002))
    await abrirRegistro()
    await registrar('Registrar entrada')
    expect(await screen.findByText('Registro guardado en esta demostración.')).toBeInTheDocument()
    expect(screen.getByText(/No está validada por un servidor/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Abrir en Maps la ubicación/ })).toHaveAttribute('href', expect.stringContaining('google.com/maps/search/?api=1&query='))
    expect(await screen.findByRole('button', { name: 'Registrar salida a almuerzo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar entrada' })).not.toBeInTheDocument()
    expect(screen.getByText('En jornada')).toBeInTheDocument()
    expect(screen.getByText('Tu registro de entrada se ha guardado.')).toBeInTheDocument()
  })

  it('el almuerzo tiene su pantalla de confirmación y se puede cancelar sin registrar nada', async () => {
    responder(ubicacionEnHospital())
    await abrirRegistro()
    await registrar('Registrar entrada')
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar salida a almuerzo' }))
    expect(screen.getByRole('heading', { name: '¿Salir a almorzar?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByRole('button', { name: 'Registrar salida a almuerzo' })).toBeInTheDocument()
    expect(repositorios.marcaciones.listar()).toHaveLength(1)
  })

  it('el enlace «Ver detalle de la jornada» abre las marcaciones con su hora programada y el resumen del día', async () => {
    responder(ubicacionEnHospital())
    await abrirRegistro()
    await registrar('Registrar entrada')
    await userEvent.click(await screen.findByRole('button', { name: 'Ver detalle de la jornada' }))
    expect(screen.getByRole('heading', { name: 'Detalle de la jornada de hoy' })).toBeInTheDocument()
    const tabla = screen.getByRole('table')
    expect(within(tabla).getByRole('rowheader', { name: 'Entrada laboral' })).toBeInTheDocument()
    expect(within(tabla).getAllByText('07:00 a. m.', { selector: 'td' })).toHaveLength(2)
    expect(screen.getByText('Resumen del día')).toBeInTheDocument()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(await screen.findByRole('button', { name: 'Registrar salida a almuerzo' })).toBeInTheDocument()
    expect(screen.getByRole('timer', { name: 'Tiempo trabajado hoy' })).toHaveTextContent(/\d\d:\d\d:\d\d/)
  })

  it('el resumen del historial muestra los tres tiempos por separado y «Incompleto» mientras falta una marca (D16, D21)', async () => {
    responder(ubicacionEnHospital())
    await abrirRegistro()
    await registrar('Registrar entrada')
    await screen.findByRole('button', { name: 'Registrar salida a almuerzo' })
    await userEvent.click(screen.getByRole('link', { name: 'Historial' }))
    expect(await screen.findByRole('heading', { name: 'Historial de registros' })).toBeInTheDocument()
    const lista = screen.getByRole('list', { name: 'Registros del día' })
    expect(within(lista).getByText('Entrada')).toBeInTheDocument()
    expect(within(lista).getByText('Hospital San José')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver resumen de la jornada' }))
    for (const rotulo of ['Tiempo efectivo', 'Tiempo de almuerzo', 'Total de la jornada']) {
      expect(screen.getByText(rotulo).nextElementSibling).toHaveTextContent('Incompleto')
    }
    expect(screen.getByText('Horario programado')).toBeInTheDocument()
  })

  it('un intento fuera de radio no registra nada, explica el motivo y queda en intentos rechazados (CA-3, CA-5)', async () => {
    responder(ubicacionEnHospital(0.002))
    await abrirRegistro()
    await registrar('Registrar entrada')
    expect(await screen.findByText(/del hospital y el máximo permitido \(valor provisional\) es 100 m/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Historial' }))
    const intentos = await screen.findByRole('list', { name: 'Intentos rechazados del día' })
    expect(within(intentos).getByText('Ubicación fuera del radio del hospital')).toBeInTheDocument()
    expect(screen.getByText('Sin registros este día')).toBeInTheDocument()
    expect(repositorios.marcaciones.listar()).toHaveLength(0)
  })

  it('un fallo técnico lleva a «Se requiere tu ubicación», no se presenta como ubicación indebida y «Activar ubicación» vuelve a pedirla (CA-14, D13)', async () => {
    responder({ exito: false, motivo: 'PERMISO_BLOQUEADO' })
    await abrirRegistro()
    await registrar('Registrar entrada')
    expect(await screen.findByRole('heading', { name: 'Se requiere tu ubicación' })).toBeInTheDocument()
    expect(screen.getByText(/Configuración del sitio/)).toBeInTheDocument()
    expect(screen.getByText('No se registró (fallo técnico).')).toBeInTheDocument()
    expect(ubicacionDelDispositivo).toHaveBeenCalledTimes(1)
    const incidenciasAntes = repositorios.incidencias.listar().length

    responder(ubicacionEnHospital())
    await userEvent.click(screen.getByRole('button', { name: 'Activar ubicación' }))
    expect(await screen.findByText('Registro guardado en esta demostración.')).toBeInTheDocument()
    expect(ubicacionDelDispositivo).toHaveBeenCalledTimes(2)
    // Un fallo técnico no abre ninguna incidencia nueva.
    expect(repositorios.incidencias.listar()).toHaveLength(incidenciasAntes)
  })

  it('«Cancelar» en la pantalla de ubicación vuelve al inicio sin registrar ni dejar el mensaje', async () => {
    responder({ exito: false, motivo: 'PERMISO_DENEGADO' })
    await abrirRegistro()
    await registrar('Registrar entrada')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
    expect(screen.queryByText('No se registró (fallo técnico).')).not.toBeInTheDocument()
    expect(repositorios.marcaciones.listar()).toHaveLength(0)
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
