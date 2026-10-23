import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
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

describe('pantallas de hospitales (HU-03)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })

  describe('lista', () => {
    it('muestra los 5 hospitales, el mapa y el botón de alta solo al coordinador', async () => {
      await abrir('/hospitales', 'usr-coord-1')
      expect(await screen.findByRole('link', { name: 'Hospital San José' })).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(6)
      expect(screen.getByRole('group', { name: 'Mapa esquemático de hospitales' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Nuevo hospital' })).toBeInTheDocument()
    })

    it('el administrador consulta pero no ve el alta de hospitales', async () => {
      await abrir('/hospitales', 'usr-admin-1')
      await screen.findByRole('link', { name: 'Hospital San José' })
      expect(screen.queryByRole('button', { name: 'Nuevo hospital' })).not.toBeInTheDocument()
    })

    it('crear un hospital lleva a su ficha, que avisa que necesita configuración', async () => {
      await abrir('/hospitales', 'usr-coord-1')
      await userEvent.click(await screen.findByRole('button', { name: 'Nuevo hospital' }))
      const dialogo = screen.getByRole('dialog', { name: 'Nuevo hospital' })
      await userEvent.type(within(dialogo).getByLabelText(/Nombre del hospital/), 'Hospital Nuevo Horizonte')
      await userEvent.selectOptions(within(dialogo).getByLabelText(/Municipio/), 'mun-manizales')
      await userEvent.type(within(dialogo).getByLabelText(/Dirección/), 'Calle 50 # 20-10')
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar hospital' }))
      expect(await screen.findByRole('heading', { name: 'Hospital Nuevo Horizonte' })).toBeInTheDocument()
      expect(screen.getByText(/Hospital creado en esta demostración/)).toBeInTheDocument()
      expect(screen.getByText(/necesita configuración antes de habilitar el registro/)).toBeInTheDocument()
      expect(screen.getByText('Sin coordenadas confirmadas', { selector: 'span' })).toBeInTheDocument()
    })
  })

  describe('ficha', () => {
    it('un hospital sin coordenadas confirmadas muestra el aviso y su estado (CA-6, CA-11)', async () => {
      await abrir('/hospitales/hosp-04', 'usr-coord-2')
      expect(await screen.findByRole('heading', { name: 'Hospital Santa Sofía' })).toBeInTheDocument()
      expect(screen.getByText(/no admite marcaciones hasta que se confirmen sus coordenadas/)).toBeInTheDocument()
      expect(screen.getByText('Todavía no se han confirmado coordenadas.')).toBeInTheDocument()
    })

    it('rotula el radio y la precisión como provisionales (CA-9)', async () => {
      await abrir('/hospitales/hosp-01', 'usr-coord-1')
      await screen.findByRole('heading', { name: 'Hospital San José' })
      expect(screen.getByText('100 m (valor provisional)')).toBeInTheDocument()
      expect(screen.getByText('25 m (valor provisional)')).toBeInTheDocument()
    })

    it('el coordinador confirma las coordenadas y el hospital deja de estar sin configurar', async () => {
      await abrir('/hospitales/hosp-04', 'usr-coord-2')
      await screen.findByRole('heading', { name: 'Hospital Santa Sofía' })
      await userEvent.type(screen.getByLabelText('Latitud'), '5.3')
      await userEvent.type(screen.getByLabelText('Longitud'), '-75.45')
      await userEvent.click(screen.getByRole('button', { name: 'Confirmar coordenadas' }))
      expect(await screen.findByText(/Coordenadas confirmadas en esta demostración/)).toBeInTheDocument()
      expect(screen.queryByText(/necesita configuración antes de habilitar el registro/)).not.toBeInTheDocument()
      expect(screen.getAllByText('Coordenadas confirmadas').length).toBeGreaterThan(0)
      expect(screen.getByText('Andrés Salazar confirmó las coordenadas')).toBeInTheDocument()
    })

    it('muestra el historial de coordenadas con quién y el valor anterior', async () => {
      await abrir('/hospitales/hosp-02', 'usr-coord-1')
      await screen.findByRole('heading', { name: 'Hospital La Merced' })
      expect(screen.getAllByText('Laura Gómez cambió las coordenadas')).toHaveLength(1)
      expect(screen.getByText('Laura Gómez confirmó las coordenadas')).toBeInTheDocument()
      expect(screen.getByText(/Antes: 5.0451, -75.5139/)).toBeInTheDocument()
    })

    it('el coordinador puede editar los datos del hospital', async () => {
      await abrir('/hospitales/hosp-01', 'usr-coord-1')
      await userEvent.click(await screen.findByRole('button', { name: 'Editar datos' }))
      const dialogo = screen.getByRole('dialog', { name: 'Editar hospital' })
      const nombre = within(dialogo).getByLabelText(/Nombre del hospital/)
      await userEvent.clear(nombre)
      await userEvent.type(nombre, 'Hospital San José de Caldas')
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar hospital' }))
      expect(await screen.findByRole('heading', { name: 'Hospital San José de Caldas' })).toBeInTheDocument()
      expect(screen.getByText('Datos del hospital guardados en esta demostración.')).toBeInTheDocument()
    })

    it('el administrador solo consulta las coordenadas y asigna el responsable', async () => {
      await abrir('/hospitales/hosp-05', 'usr-admin-1')
      await screen.findByRole('heading', { name: 'Hospital San Rafael' })
      expect(screen.queryByRole('button', { name: 'Editar datos' })).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Latitud')).not.toBeInTheDocument()
      expect(screen.getByText('Solo el coordinador configura las coordenadas.')).toBeInTheDocument()
      expect(screen.getByText(/pendientes de asignación y son visibles para el administrador/)).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Asignar coordinador responsable' }))
      await userEvent.selectOptions(screen.getByRole('combobox', { name: /^Coordinador/ }), 'usr-coord-1')
      await userEvent.click(screen.getByRole('button', { name: 'Guardar cambio' }))
      expect(await screen.findByText('Coordinador responsable actualizado en esta demostración.')).toBeInTheDocument()
      expect(screen.getByText('Laura Gómez', { selector: 'p strong' })).toBeInTheDocument()
      expect(screen.queryByText(/pendientes de asignación y son visibles/)).not.toBeInTheDocument()
    })

    it('el coordinador no ve el botón para cambiar el responsable', async () => {
      await abrir('/hospitales/hosp-01', 'usr-coord-1')
      await screen.findByRole('heading', { name: 'Hospital San José' })
      expect(screen.queryByRole('button', { name: /coordinador responsable/ })).not.toBeInTheDocument()
    })

    it('lista el personal asignado al hospital', async () => {
      await abrir('/hospitales/hosp-04', 'usr-coord-2')
      await screen.findByRole('heading', { name: 'Hospital Santa Sofía' })
      const tabla = await screen.findByRole('table', { name: 'Personal asignado al hospital' })
      expect(within(tabla).getByText('Esteban Arias')).toBeInTheDocument()
      expect(within(tabla).getByText('Tatiana Ruiz')).toBeInTheDocument()
    })

    it('un hospital que no existe se explica y permite volver', async () => {
      await abrir('/hospitales/no-existe', 'usr-coord-1')
      expect(await screen.findByText(/No se encontró este hospital/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Volver a hospitales' })).toBeInTheDocument()
    })
  })
})
