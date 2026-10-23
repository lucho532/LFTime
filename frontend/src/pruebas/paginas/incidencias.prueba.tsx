import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

const AUSENCIA_TRAB_001 = 'inc-ausencia_aparente-trab-001-2026-10-23'

async function abrir(ruta: string, usuarioId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

describe('pantallas de incidencias, alertas y campana (HU-06, HU-07)', () => {
  beforeEach(async () => {
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

  it('la coordinación ve la lista con filtros y la campana con el número de alertas sin revisar', async () => {
    await abrir('/incidencias', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Incidencias' })).toBeInTheDocument()
    expect(await screen.findAllByRole('link', { name: 'Ausencia aparente' })).not.toHaveLength(0)
    for (const etiqueta of ['Buscar', 'Estado', 'Tipo', 'Hospital', 'Situación']) {
      expect(screen.getByLabelText(new RegExp(etiqueta))).toBeInTheDocument()
    }
    expect(await screen.findByRole('button', { name: /Alertas: \d+ sin revisar/ })).toBeInTheDocument()
  })

  it('abrir la incidencia marca su alerta como revisada, y resolverla la cierra sin tocar el historial anterior', async () => {
    await servicios.incidencias.sincronizar()
    await abrir(`/incidencias/${AUSENCIA_TRAB_001}`, 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Ausencia aparente' })).toBeInTheDocument()
    expect(screen.getByText(/no es una sanción/)).toBeInTheDocument()
    await waitFor(() => expect(repositorios.alertas.obtenerPorId(`ale-${AUSENCIA_TRAB_001}`)?.revisada).toBe(true))

    await userEvent.selectOptions(screen.getByLabelText('Resolución'), 'NO_JUSTIFICADA')
    await userEvent.type(screen.getByLabelText(/Motivo de la resolución/), 'No presentó soporte.')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar resolución' }))
    expect(await screen.findByText(/Resolución registrada y auditada/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar resolución' })).not.toBeInTheDocument()
    expect(screen.getAllByText('No justificada').length).toBeGreaterThan(0)
    expect(screen.getByText('Motivo: No presentó soporte.')).toBeInTheDocument()
    expect(repositorios.auditoria.listar().map((a) => a.accion)).toContain('RESOLVER_INCIDENCIA')
  })

  it('una resolución sin motivo no se envía', async () => {
    await servicios.incidencias.sincronizar()
    await abrir(`/incidencias/${AUSENCIA_TRAB_001}`, 'usr-coord-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar resolución' }))
    expect(repositorios.incidencias.obtenerPorId(AUSENCIA_TRAB_001)?.estado).toBe('PENDIENTE')
  })

  it('el coordinador escala con motivo y ya no ofrece escalar de nuevo', async () => {
    await servicios.incidencias.sincronizar()
    await abrir(`/incidencias/${AUSENCIA_TRAB_001}`, 'usr-coord-1')
    await userEvent.type(await screen.findByLabelText(/Motivo de la escalada/), 'Requiere decisión del administrador.')
    await userEvent.click(screen.getByRole('button', { name: 'Escalar' }))
    expect(await screen.findByText(/escalada al administrador y auditada/)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Escalar' })).not.toBeInTheDocument())
    expect(screen.getAllByText(/Requiere decisión del administrador\./).length).toBeGreaterThan(0)
  })

  it('la incidencia de ubicación lista todos sus intentos, con coordenadas, precisión y motivo (CA-12)', async () => {
    const { latitud, longitud } = repositorios.hospitales.obtenerPorId('hosp-01')!.coordenadas!
    for (const desplazamiento of [0.002, 0.003]) {
      await servicios.marcaciones.registrar('trab-001', 'ENTRADA', { ubicacion: { latitud: latitud + desplazamiento, longitud, precisionMetros: 10 } })
    }
    await abrir('/incidencias/inc-ubicacion_no_autorizada-trab-001-2026-10-23', 'usr-coord-1')
    expect(await screen.findByRole('heading', { name: 'Ubicación no autorizada' })).toBeInTheDocument()
    const tabla = await screen.findByRole('table', { name: 'Intentos rechazados asociados a la incidencia' })
    expect(within(tabla).getAllByRole('row')).toHaveLength(3)
    expect(within(tabla).getAllByText('Ubicación fuera del radio del hospital')).toHaveLength(2)
  })

  it('el trabajador solo ve sus incidencias, sin campana, y aporta su justificación', async () => {
    await servicios.incidencias.sincronizar()
    await abrir('/incidencias', 'usr-trab-001')
    expect(await screen.findByRole('heading', { name: 'Mis incidencias' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Alertas/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Trabajador')).not.toBeInTheDocument()
    const filas = await screen.findAllByRole('row')
    expect(filas).toHaveLength(2)

    await userEvent.click(screen.getByRole('link', { name: 'Ausencia aparente' }))
    await userEvent.type(await screen.findByLabelText(/Tu justificación/), 'Hubo un derrumbe en la vía.')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar justificación' }))
    expect(await screen.findByText('Justificación guardada en esta demostración.')).toBeInTheDocument()
    expect(await screen.findByText('Hubo un derrumbe en la vía.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar resolución' })).not.toBeInTheDocument()
  })

  it('el trabajador no puede abrir la incidencia de otra persona', async () => {
    await servicios.incidencias.sincronizar()
    await abrir('/incidencias/inc-ausencia_aparente-trab-002-2026-10-23', 'usr-trab-001')
    expect(await screen.findByText('Incidencia no disponible')).toBeInTheDocument()
  })

  it('la bandeja del administrador reúne las pendientes de asignación y permite asignar un revisor (D28)', async () => {
    await servicios.incidencias.sincronizar()
    await abrir('/incidencias', 'usr-admin-1')
    expect(await screen.findByText(/pendientes? de asignación\./)).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('link', { name: 'Ausencia aparente' })[0])
    const revisoresDeLaBandeja = await screen.findByRole('button', { name: 'Asignar' })
    expect(revisoresDeLaBandeja).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Coordinador'), 'usr-coord-2')
    await userEvent.click(revisoresDeLaBandeja)
    expect(await screen.findByText(/Revisor asignado y auditado/)).toBeInTheDocument()
    expect(repositorios.incidencias.listar().some((i) => i.revisorPrincipalId === 'usr-coord-2' && i.asignacion === 'ASIGNADA' && i.hospitalId === 'hosp-05')).toBe(true)
  })
})
