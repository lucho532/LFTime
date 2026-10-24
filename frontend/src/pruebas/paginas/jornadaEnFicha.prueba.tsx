import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

async function abrirFicha(usuarioId: string, trabajadorId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={[`/personal/${trabajadorId}`]}>
      <App />
    </MemoryRouter>,
  )
}

describe('ficha del trabajador: jornada de hoy y cronómetro en vivo', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
    repositorios.hospitales.listar()
    repositorios.marcaciones.reemplazarTodo([])
    repositorios.intentos.reemplazarTodo([])
  })

  it('sin entrada hoy el cronómetro no corre y las marcaciones aparecen «Sin registrar»', async () => {
    await abrirFicha('usr-coord-1', 'trab-001')
    const cronometro = await screen.findByRole('timer', { name: 'Tiempo trabajado hoy' })
    expect(cronometro).toHaveTextContent('--:--:--')
    expect(screen.getByRole('heading', { name: 'Registro de jornada laboral' })).toBeInTheDocument()
    expect(screen.getAllByText('Sin registrar')).toHaveLength(4)
    expect(screen.getByText('Total tiempo de almuerzo').nextElementSibling).toHaveTextContent('Incompleto')
    expect(screen.getByText('Diferencia con lo autorizado').nextElementSibling).toHaveTextContent('Incompleto')
  })

  it('con la jornada completa compara el almuerzo con lo autorizado y da el total de la jornada', async () => {
    const { latitud, longitud } = repositorios.hospitales.obtenerPorId('hosp-01')!.coordenadas!
    const marca = (id: string, tipo: 'ENTRADA' | 'SALIDA_ALMUERZO' | 'REGRESO_ALMUERZO' | 'SALIDA_FINAL', hora: string) => ({
      id, trabajadorId: 'trab-001', hospitalId: 'hosp-01', tipo, instante: `2026-10-23T${hora}:00.000Z`, fechaOperativa: '2026-10-23',
      ubicacion: { latitud, longitud, precisionMetros: 10 }, distanciaAlHospitalMetros: 0, origen: 'TRABAJADOR' as const,
    })
    // 07:00, 12:00, 13:05 y 16:00 en hora de Colombia: almuerzo de 65 min frente a 60 autorizados.
    repositorios.marcaciones.reemplazarTodo([marca('a', 'ENTRADA', '12:00'), marca('b', 'SALIDA_ALMUERZO', '17:00'), marca('c', 'REGRESO_ALMUERZO', '18:05'), marca('d', 'SALIDA_FINAL', '21:00')])
    await abrirFicha('usr-coord-1', 'trab-001')
    await screen.findByRole('timer', { name: 'Tiempo trabajado hoy' })
    expect(screen.getByText('Total tiempo de almuerzo').nextElementSibling).toHaveTextContent('1 h 05 min')
    expect(screen.getByText('Almuerzo autorizado').nextElementSibling).toHaveTextContent('1 h 00 min')
    expect(screen.getByText('Diferencia con lo autorizado').nextElementSibling).toHaveTextContent('5 min de más')
    expect(screen.getByText('Total de la jornada (entrada a salida)').nextElementSibling).toHaveTextContent('9 h 00 min')
  })

  it('con la entrada registrada el cronómetro cuenta lo trabajado y avanza cada segundo', async () => {
    const { latitud, longitud } = repositorios.hospitales.obtenerPorId('hosp-01')!.coordenadas!
    repositorios.marcaciones.reemplazarTodo([
      { id: 'm1', trabajadorId: 'trab-001', hospitalId: 'hosp-01', tipo: 'ENTRADA', instante: '2026-10-23T12:00:00.000Z', fechaOperativa: '2026-10-23', ubicacion: { latitud, longitud, precisionMetros: 10 }, distanciaAlHospitalMetros: 0, origen: 'TRABAJADOR' },
    ])
    let ahora = new Date('2026-10-23T14:15:30Z')
    establecerRelojParaPruebas(() => ahora)
    await abrirFicha('usr-coord-1', 'trab-001')
    const cronometro = await screen.findByRole('timer', { name: 'Tiempo trabajado hoy' })
    expect(cronometro).toHaveTextContent('02:15:')
    expect(cronometro).toHaveTextContent('En vivo')
    const tabla = screen.getByRole('table')
    expect(within(tabla).getAllByText('07:00 a. m.', { selector: 'td' })).toHaveLength(2)
    expect(within(tabla).getAllByRole('link', { name: /Abrir en Maps/ })).toHaveLength(1)
    const antes = cronometro.textContent
    ahora = new Date('2026-10-23T14:15:50Z')
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 1300))
    })
    expect(cronometro.textContent).not.toBe(antes)
  })
})
