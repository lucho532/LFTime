import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AsignacionCoordinador } from '../../componentes/hospitales/AsignacionCoordinador'
import { AvisoHospitalSinConfigurar } from '../../componentes/hospitales/AvisoHospitalSinConfigurar'
import { FormularioHospital } from '../../componentes/hospitales/FormularioHospital'
import { TablaHospitales } from '../../componentes/hospitales/TablaHospitales'
import { MapaEsquematico } from '../../componentes/mapa/MapaEsquematico'
import { HOSPITALES_DEMO } from '../../datos-demo/hospitales'
import { MUNICIPIOS_DEMO } from '../../datos-demo/municipios'
import { USUARIOS_DEMO } from '../../datos-demo/usuarios'
import { aHospital } from '../../mapeadores/hospitalMapeador'
import { aUsuario } from '../../mapeadores/usuarioMapeador'
import { crearNombreDe } from '../../utilidades/nombresUsuarios'

const HOSPITALES = HOSPITALES_DEMO.map((dto) => aHospital(dto, '2026-10-23'))
const USUARIOS = USUARIOS_DEMO.map(aUsuario)
const nombreDe = crearNombreDe(USUARIOS)
const hospital = (id: string) => HOSPITALES.find((h) => h.id === id)!

describe('FormularioHospital', () => {
  it('valida y muestra todos los errores juntos sin guardar', async () => {
    const guardar = vi.fn(async () => undefined)
    render(<FormularioHospital municipios={MUNICIPIOS_DEMO} onGuardar={guardar} onCancelar={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: 'Guardar hospital' }))
    expect(screen.getByText('Escribe el nombre del hospital.')).toBeInTheDocument()
    expect(screen.getByText('Elige el municipio del hospital.')).toBeInTheDocument()
    expect(screen.getByText('Escribe la dirección del hospital.')).toBeInTheDocument()
    expect(guardar).not.toHaveBeenCalled()
  })

  it('guarda los datos válidos y aclara que la dirección no se convierte en coordenadas', async () => {
    const guardar = vi.fn(async () => undefined)
    render(<FormularioHospital municipios={MUNICIPIOS_DEMO} onGuardar={guardar} onCancelar={() => undefined} />)
    expect(screen.getByText(/Las coordenadas se configuran aparte/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/Nombre del hospital/), 'Hospital Nuevo')
    await userEvent.selectOptions(screen.getByLabelText(/Municipio/), 'mun-pacora')
    await userEvent.type(screen.getByLabelText(/Dirección/), 'Calle 1 # 2-3')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar hospital' }))
    expect(guardar).toHaveBeenCalledWith({ nombre: 'Hospital Nuevo', municipioId: 'mun-pacora', direccion: 'Calle 1 # 2-3' })
  })

  it('muestra el error si guardar falla y la edición parte de los datos actuales', async () => {
    const guardar = vi.fn().mockRejectedValue(new Error('Almacenamiento lleno.'))
    render(<FormularioHospital inicial={{ nombre: 'Hospital San José', municipioId: 'mun-manizales', direccion: 'Carrera 23' }} municipios={MUNICIPIOS_DEMO} onGuardar={guardar} onCancelar={() => undefined} />)
    expect(screen.getByLabelText(/Nombre del hospital/)).toHaveValue('Hospital San José')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar hospital' }))
    expect(await screen.findByText('Almacenamiento lleno.')).toBeInTheDocument()
  })
})

describe('avisos de hospital sin configurar (D25, CA-6, CA-11)', () => {
  it('un hospital sin coordenadas confirmadas explica que necesita configuración antes de habilitar el registro', () => {
    render(<AvisoHospitalSinConfigurar hospital={hospital('hosp-04')} />)
    expect(screen.getByRole('status')).toHaveTextContent(/necesita configuración antes de habilitar el registro/)
    expect(screen.getByRole('status')).toHaveTextContent(/no admite marcaciones/)
  })

  it('un hospital configurado no muestra el aviso', () => {
    render(<AvisoHospitalSinConfigurar hospital={hospital('hosp-01')} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('MapaEsquematico (D18)', () => {
  function mostrar() {
    return render(
      <MemoryRouter initialEntries={['/hospitales']}>
        <Routes>
          <Route path="/hospitales" element={<MapaEsquematico hospitales={HOSPITALES} />} />
          <Route path="/hospitales/:id" element={<p>Ficha abierta</p>} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('dibuja un marcador por hospital con coordenadas confirmadas y lista aparte los demás', () => {
    mostrar()
    expect(screen.getAllByRole('link', { name: /^Hospital / })).toHaveLength(4)
    expect(screen.queryByRole('link', { name: 'Hospital Hospital Santa Sofía' })).not.toBeInTheDocument()
    const pendientes = screen.getByText(/Sin coordenadas confirmadas \(no aparecen en el mapa\)/).parentElement!
    expect(within(pendientes).getByText('Hospital Santa Sofía')).toBeInTheDocument()
  })

  it('aclara que es ilustrativo y no hace ninguna petición externa', () => {
    const { container } = mostrar()
    expect(screen.getByText(/Mapa ilustrativo/)).toBeInTheDocument()
    expect(container.querySelectorAll('img, iframe, image, script').length).toBe(0)
  })

  it('los marcadores se abren con clic o con teclado', async () => {
    mostrar()
    await userEvent.click(screen.getByRole('link', { name: 'Hospital Hospital San José' }))
    expect(screen.getByText('Ficha abierta')).toBeInTheDocument()
  })

  it('sin ningún hospital configurado no dibuja marcadores', () => {
    render(
      <MemoryRouter>
        <MapaEsquematico hospitales={[hospital('hosp-04')]} />
      </MemoryRouter>,
    )
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})

describe('TablaHospitales', () => {
  function mostrar() {
    render(
      <MemoryRouter>
        <TablaHospitales hospitales={HOSPITALES} municipios={MUNICIPIOS_DEMO} nombreDe={nombreDe} />
      </MemoryRouter>,
    )
  }

  it('muestra por texto el estado de las coordenadas y el responsable de cada hospital', () => {
    mostrar()
    const fila = (nombre: string) => screen.getByRole('link', { name: nombre }).closest('tr')!
    expect(within(fila('Hospital Santa Sofía')).getByText('Sin coordenadas confirmadas')).toBeInTheDocument()
    expect(within(fila('Hospital San José')).getByText('Coordenadas confirmadas')).toBeInTheDocument()
    expect(within(fila('Hospital San José')).getByText('Laura Gómez')).toBeInTheDocument()
    expect(within(fila('Hospital San Rafael')).getByText('Sin responsable')).toBeInTheDocument()
    expect(within(fila('Hospital San Vicente')).getByText('Andrés Salazar')).toBeInTheDocument()
  })

  it('filtra por municipio, por estado de coordenadas y por texto, y avisa si no hay coincidencias', async () => {
    mostrar()
    await userEvent.selectOptions(screen.getByLabelText('Coordenadas'), 'sin-confirmar')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    await userEvent.selectOptions(screen.getByLabelText('Coordenadas'), '')
    await userEvent.selectOptions(screen.getByLabelText('Municipio'), 'mun-villamaria')
    expect(screen.getByRole('link', { name: 'Hospital La Merced' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
    await userEvent.selectOptions(screen.getByLabelText('Municipio'), '')
    await userEvent.type(screen.getByLabelText('Buscar'), 'chinchina')
    expect(screen.getByRole('link', { name: 'Hospital San Vicente' })).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Buscar'))
    await userEvent.type(screen.getByLabelText('Buscar'), 'zzz')
    expect(screen.getByText('Sin hospitales')).toBeInTheDocument()
  })
})

describe('AsignacionCoordinador (D28)', () => {
  const coordinadores = USUARIOS.filter((u) => u.rol === 'COORDINADOR')

  function mostrar(opciones: { id: string; puedeAsignar: boolean; onAsignar?: (c: string, m: string) => Promise<void> }) {
    const onAsignar = opciones.onAsignar ?? vi.fn(async () => undefined)
    render(<AsignacionCoordinador hospital={hospital(opciones.id)} coordinadores={coordinadores} nombreDe={nombreDe} puedeAsignar={opciones.puedeAsignar} onAsignar={onAsignar} />)
    return onAsignar
  }

  it('muestra el responsable vigente y el historial con vigencia, quién asignó y motivo', () => {
    mostrar({ id: 'hosp-03', puedeAsignar: false })
    expect(screen.getByText('Andrés Salazar', { selector: 'p strong' })).toBeInTheDocument()
    expect(screen.getByText('Del 2026-01-01 al 2026-08-31')).toBeInTheDocument()
    expect(screen.getByText('Desde el 2026-09-01 (vigente)')).toBeInTheDocument()
    expect(screen.getAllByText('Asignó: Carolina Mejía')).toHaveLength(2)
  })

  it('un hospital sin responsable lo dice y explica que sus incidencias quedan pendientes de asignación', () => {
    mostrar({ id: 'hosp-05', puedeAsignar: false })
    expect(screen.getByRole('status')).toHaveTextContent(/pendientes de asignación y son visibles para el administrador/)
    expect(screen.getByText('Este hospital nunca ha tenido un coordinador responsable.')).toBeInTheDocument()
  })

  it('solo quien puede asignar ve el botón de cambio', () => {
    mostrar({ id: 'hosp-01', puedeAsignar: false })
    expect(screen.queryByRole('button', { name: /coordinador responsable/ })).not.toBeInTheDocument()
  })

  it('el administrador cambia el responsable con un motivo opcional', async () => {
    const asignar = mostrar({ id: 'hosp-01', puedeAsignar: true })
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar coordinador responsable' }))
    const dialogo = screen.getByRole('dialog', { name: 'Coordinador responsable' })
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar cambio' }))
    expect(within(dialogo).getByText('Elige a la persona que será responsable.')).toBeInTheDocument()
    expect(asignar).not.toHaveBeenCalled()
    await userEvent.selectOptions(within(dialogo).getByRole('combobox', { name: /^Coordinador/ }), 'usr-coord-2')
    await userEvent.type(within(dialogo).getByLabelText(/Motivo/), 'Nueva zona')
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar cambio' }))
    expect(asignar).toHaveBeenCalledWith('usr-coord-2', 'Nueva zona')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('si el cambio falla muestra el motivo y deja el diálogo abierto', async () => {
    mostrar({ id: 'hosp-01', puedeAsignar: true, onAsignar: vi.fn().mockRejectedValue(new Error('Esa persona ya es la coordinadora responsable de este hospital.')) })
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar coordinador responsable' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /^Coordinador/ }), 'usr-coord-1')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambio' }))
    expect(await screen.findByText(/ya es la coordinadora responsable/)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
