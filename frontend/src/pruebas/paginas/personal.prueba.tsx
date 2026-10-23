import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'

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

describe('pantallas de personal (HU-02)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
    establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
  })

  describe('lista', () => {
    it('muestra los 48 trabajadores paginados de 10 en 10, con la cédula visible (D17)', async () => {
      await abrir('/personal', 'usr-coord-1')
      expect(await screen.findByText('Mostrando 1 - 10 de 48')).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(11)
      expect(screen.getByText('CC 1.052.345.678')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'María López' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Nuevo trabajador' })).toBeInTheDocument()
    })

    it('el administrador también gestiona el personal', async () => {
      await abrir('/personal', 'usr-admin-2')
      expect(await screen.findByRole('button', { name: 'Nuevo trabajador' })).toBeInTheDocument()
    })

    it('busca sin distinguir tildes ni mayúsculas, y filtra por hospital y por estado', async () => {
      await abrir('/personal', 'usr-coord-1')
      await screen.findByText('Mostrando 1 - 10 de 48')
      await userEvent.type(screen.getByLabelText('Buscar'), 'HERNAN gir')
      expect(screen.getByText('Mostrando 1 - 1 de 1')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Hernán Giraldo' })).toBeInTheDocument()
      await userEvent.clear(screen.getByLabelText('Buscar'))
      await userEvent.selectOptions(screen.getByLabelText('Estado'), 'VACACIONES')
      expect(screen.getByRole('link', { name: 'Óscar Londoño' })).toBeInTheDocument()
      expect(screen.getByText('Mostrando 1 - 1 de 1')).toBeInTheDocument()
      await userEvent.selectOptions(screen.getByLabelText('Estado'), '')
      await userEvent.selectOptions(screen.getByLabelText('Hospital'), 'hosp-04')
      expect(screen.getByText('Mostrando 1 - 2 de 2')).toBeInTheDocument()
      await userEvent.type(screen.getByLabelText('Buscar'), 'zzzz')
      expect(screen.getByText('Sin personal')).toBeInTheDocument()
    })

    it('muestra por texto el estado de cada trabajador (también sin color)', async () => {
      await abrir('/personal', 'usr-coord-1')
      await screen.findByText('Mostrando 1 - 10 de 48')
      await userEvent.selectOptions(screen.getByLabelText('Estado'), 'INACTIVO')
      const fila = screen.getByRole('link', { name: 'Gloria Marín' }).closest('tr')!
      expect(within(fila).getByText('Inactivo')).toBeInTheDocument()
    })
  })

  describe('alta', () => {
    async function abrirAlta() {
      await abrir('/personal', 'usr-coord-1')
      await userEvent.click(await screen.findByRole('button', { name: 'Nuevo trabajador' }))
      return screen.getByRole('dialog', { name: 'Nuevo trabajador' })
    }

    it('valida y muestra todos los errores juntos', async () => {
      const dialogo = await abrirAlta()
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar trabajador' }))
      for (const mensaje of ['Escribe los nombres.', 'Escribe los apellidos.', 'Escribe el número de documento.', 'Escribe el cargo o servicio que presta.', 'Elige el hospital asignado.']) {
        expect(within(dialogo).getByText(mensaje)).toBeInTheDocument()
      }
    })

    it('crea el trabajador y abre su ficha, que avisa que aún no tiene horario', async () => {
      const dialogo = await abrirAlta()
      await userEvent.type(within(dialogo).getByLabelText(/Nombres/), 'Lucía')
      await userEvent.type(within(dialogo).getByLabelText(/Apellidos/), 'Fernández')
      await userEvent.type(within(dialogo).getByLabelText(/Número de documento/), '1.099.888.777')
      await userEvent.type(within(dialogo).getByLabelText(/Cargo o servicio/), 'Enfermera')
      await userEvent.selectOptions(within(dialogo).getByLabelText(/Hospital asignado/), 'hosp-01')
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar trabajador' }))
      expect(await screen.findByRole('heading', { name: 'Lucía Fernández' })).toBeInTheDocument()
      expect(screen.getByText(/Trabajador creado en esta demostración/)).toBeInTheDocument()
      expect(screen.getByText('Sin horario vigente')).toBeInTheDocument()
    })

    it('rechaza un documento que ya existe y deja abierto el formulario', async () => {
      const dialogo = await abrirAlta()
      await userEvent.type(within(dialogo).getByLabelText(/Nombres/), 'Otra')
      await userEvent.type(within(dialogo).getByLabelText(/Apellidos/), 'Persona')
      await userEvent.type(within(dialogo).getByLabelText(/Número de documento/), '1052345678')
      await userEvent.type(within(dialogo).getByLabelText(/Cargo o servicio/), 'Enfermera')
      await userEvent.selectOptions(within(dialogo).getByLabelText(/Hospital asignado/), 'hosp-01')
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar trabajador' }))
      expect(await within(dialogo).findByText('Ya hay un trabajador con ese número de documento.')).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Nuevo trabajador' })).toBeInTheDocument()
    })
  })

  describe('ficha y permisos', () => {
    it('muestra los datos del trabajador, su hospital, su municipio y su estado', async () => {
      await abrir('/personal/trab-001', 'usr-coord-1')
      expect(await screen.findByRole('heading', { name: 'María López' })).toBeInTheDocument()
      const datos = screen.getByText('Documento').closest('dl')!
      expect(within(datos).getByText('CC 1.052.345.678')).toBeInTheDocument()
      expect(within(datos).getByText('Hospital San José')).toBeInTheDocument()
      expect(within(datos).getByText('Manizales')).toBeInTheDocument()
      expect(within(datos).getByText('Activo')).toBeInTheDocument()
    })

    it('el coordinador edita el estado y la ficha lo refleja', async () => {
      await abrir('/personal/trab-001', 'usr-coord-1')
      await userEvent.click(await screen.findByRole('button', { name: 'Editar datos' }))
      const dialogo = screen.getByRole('dialog', { name: 'Editar trabajador' })
      await userEvent.selectOptions(within(dialogo).getByLabelText(/^Estado/), 'VACACIONES')
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar trabajador' }))
      expect(await screen.findByText('Datos del trabajador guardados en esta demostración.')).toBeInTheDocument()
      const datos = screen.getByText('Documento').closest('dl')!
      expect(within(datos).getByText('Vacaciones')).toBeInTheDocument()
    })

    it('el trabajador entra directo a su ficha desde Personal y no puede editarla', async () => {
      await abrir('/personal', 'usr-trab-001')
      expect(await screen.findByRole('heading', { name: 'María López' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Editar datos' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: '← Personal' })).not.toBeInTheDocument()
    })

    it('el trabajador no puede abrir la ficha de otra persona', async () => {
      await abrir('/personal/trab-002', 'usr-trab-001')
      expect(await screen.findByRole('heading', { name: 'Pantalla no disponible para tu rol' })).toBeInTheDocument()
    })

    it('un trabajador que no existe se explica y permite volver', async () => {
      await abrir('/personal/no-existe', 'usr-coord-1')
      expect(await screen.findByText(/No se encontró este trabajador/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Volver a personal' })).toBeInTheDocument()
    })

    it('desde la ficha de un hospital se abre la ficha de su personal', async () => {
      await abrir('/hospitales/hosp-04', 'usr-coord-2')
      await userEvent.click(await screen.findByRole('link', { name: 'Esteban Arias' }))
      expect(await screen.findByRole('heading', { name: 'Esteban Arias' })).toBeInTheDocument()
    })
  })
})
