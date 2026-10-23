import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormularioCoordenadas } from '../../componentes/hospitales/FormularioCoordenadas'
import { HOSPITALES_DEMO } from '../../datos-demo/hospitales'
import { aHospital } from '../../mapeadores/hospitalMapeador'
import * as geolocalizacion from '../../utilidades/geolocalizacion'

vi.mock('../../utilidades/geolocalizacion', () => ({ obtenerUbicacionActual: vi.fn() }))
const obtenerUbicacion = vi.mocked(geolocalizacion.obtenerUbicacionActual)

const hospitalSinCoordenadas = aHospital(HOSPITALES_DEMO.find((h) => h.id === 'hosp-04')!, '2026-10-23')

function mostrar(onConfirmar = vi.fn(async () => undefined)) {
  render(<FormularioCoordenadas hospital={hospitalSinCoordenadas} onConfirmar={onConfirmar} />)
  return onConfirmar
}

describe('FormularioCoordenadas: modo manual (CA-7)', () => {
  beforeEach(() => obtenerUbicacion.mockReset())

  it('ofrece las dos formas de configurar y arranca en la manual', () => {
    mostrar()
    expect(screen.getByRole('radio', { name: /Escribir latitud y longitud/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Usar mi ubicación GPS actual/ })).not.toBeChecked()
  })

  it('muestra todos los errores juntos y no confirma si faltan datos o hay valores inválidos', async () => {
    const confirmar = mostrar()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar coordenadas' }))
    expect(screen.getByText('La latitud es obligatoria.')).toBeInTheDocument()
    expect(screen.getByText('La longitud es obligatoria.')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Latitud'), '95')
    await userEvent.type(screen.getByLabelText('Longitud'), 'abc')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar coordenadas' }))
    expect(screen.getByText('La latitud debe estar entre -90 y 90.')).toBeInTheDocument()
    expect(screen.getByText(/La longitud debe ser un número/)).toBeInTheDocument()
    expect(confirmar).not.toHaveBeenCalled()
  })

  it('confirma coordenadas válidas con origen manual, aceptando la coma decimal', async () => {
    const confirmar = mostrar()
    await userEvent.type(screen.getByLabelText('Latitud'), '5,3')
    await userEvent.type(screen.getByLabelText('Longitud'), '-75.45')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar coordenadas' }))
    expect(confirmar).toHaveBeenCalledWith({ latitud: 5.3, longitud: -75.45, origen: 'MANUAL' })
  })

  it('si guardar falla muestra el mensaje y permite reintentar', async () => {
    const confirmar = vi.fn().mockRejectedValueOnce(new Error('No se pudo guardar.')).mockResolvedValueOnce(undefined)
    mostrar(confirmar)
    await userEvent.type(screen.getByLabelText('Latitud'), '5.3')
    await userEvent.type(screen.getByLabelText('Longitud'), '-75.45')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar coordenadas' }))
    expect(await screen.findByText('No se pudo guardar.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar coordenadas' }))
    expect(confirmar).toHaveBeenCalledTimes(2)
  })
})

describe('FormularioCoordenadas: GPS del coordinador (D22, D13)', () => {
  beforeEach(() => obtenerUbicacion.mockReset())

  async function entrarEnModoGps() {
    await userEvent.click(screen.getByRole('radio', { name: /Usar mi ubicación GPS actual/ }))
  }

  it('muestra la precisión antes de confirmar y no confirma sin que la persona lo pida', async () => {
    obtenerUbicacion.mockResolvedValue({ exito: true, ubicacion: { latitud: 5.300123, longitud: -75.450456, precisionMetros: 9.4 } })
    const confirmar = mostrar()
    await entrarEnModoGps()
    expect(screen.queryByRole('button', { name: 'Confirmar esta ubicación' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Obtener mi ubicación actual' }))
    expect(await screen.findByText('± 9 m')).toBeInTheDocument()
    expect(screen.getByText('5.300123')).toBeInTheDocument()
    expect(screen.getByText('-75.450456')).toBeInTheDocument()
    expect(confirmar).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar esta ubicación' }))
    expect(confirmar).toHaveBeenCalledWith({ latitud: 5.300123, longitud: -75.450456, origen: 'GPS_COORDINADOR', precisionMetros: 9.4 })
  })

  it('advierte (sin impedir) cuando la precisión supera el máximo provisional', async () => {
    obtenerUbicacion.mockResolvedValue({ exito: true, ubicacion: { latitud: 5.3, longitud: -75.45, precisionMetros: 60 } })
    mostrar()
    await entrarEnModoGps()
    await userEvent.click(screen.getByRole('button', { name: 'Obtener mi ubicación actual' }))
    expect(await screen.findByText(/Precisión baja/)).toBeInTheDocument()
    expect(screen.getByText(/máxima provisional para marcar \(25 m\)/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar esta ubicación' })).toBeEnabled()
  })

  it('sin advertencia cuando la precisión está dentro del máximo provisional', async () => {
    obtenerUbicacion.mockResolvedValue({ exito: true, ubicacion: { latitud: 5.3, longitud: -75.45, precisionMetros: 12 } })
    mostrar()
    await entrarEnModoGps()
    await userEvent.click(screen.getByRole('button', { name: 'Obtener mi ubicación actual' }))
    await screen.findByText('± 12 m')
    expect(screen.queryByText(/Precisión baja/)).not.toBeInTheDocument()
  })

  it('si falla explica la causa, no ofrece confirmar y permite volver a intentar', async () => {
    obtenerUbicacion.mockResolvedValueOnce({ exito: false, motivo: 'PERMISO_BLOQUEADO' })
    mostrar()
    await entrarEnModoGps()
    await userEvent.click(screen.getByRole('button', { name: 'Obtener mi ubicación actual' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Configuración del sitio/)
    expect(screen.queryByRole('button', { name: 'Confirmar esta ubicación' })).not.toBeInTheDocument()
    obtenerUbicacion.mockResolvedValueOnce({ exito: true, ubicacion: { latitud: 5.3, longitud: -75.45, precisionMetros: 10 } })
    await userEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }))
    expect(await screen.findByText('± 10 m')).toBeInTheDocument()
    expect(obtenerUbicacion).toHaveBeenCalledTimes(2)
  })

  it('la manual sigue disponible si el GPS no funciona', async () => {
    obtenerUbicacion.mockResolvedValue({ exito: false, motivo: 'UBICACION_NO_DISPONIBLE' })
    mostrar()
    await entrarEnModoGps()
    await userEvent.click(screen.getByRole('button', { name: 'Obtener mi ubicación actual' }))
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('radio', { name: /Escribir latitud y longitud/ }))
    expect(screen.getByLabelText('Latitud')).toBeInTheDocument()
  })
})
