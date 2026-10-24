import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { almacenFotos } from '../../repositorios/demo/almacenFotos'
import { ErrorAlmacenFotos } from '../../contratos/errorAlmacenFotos'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { repositorios } from '../../repositorios/demo/repositorios'
import { servicios } from '../../servicios/fabrica'
import { establecerRelojParaPruebas } from '../../utilidades/horaColombia'
import type { AlmacenFotosEnMemoria } from '../ayudas/almacenFotosEnMemoria'

vi.mock('../../repositorios/demo/almacenFotos', async () => {
  const { AlmacenFotosEnMemoria } = await import('../ayudas/almacenFotosEnMemoria')
  return { almacenFotos: new AlmacenFotosEnMemoria() }
})
const almacen = almacenFotos as unknown as AlmacenFotosEnMemoria

async function abrir(ruta: string, usuarioId: string) {
  await servicios.sesion.iniciarSesion(usuarioId)
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}
/** La foto se edita solo desde la ficha: el botón de la cámara abre el selector (D41). */
async function abrirEditorDeFoto() {
  await userEvent.click(screen.getByRole('button', { name: 'Cambiar mi foto de perfil' }))
  const dialogo = screen.getByRole('dialog', { name: 'Mi foto de perfil' })
  return { dialogo, entrada: dialogo.querySelector<HTMLInputElement>('input[type="file"]')! }
}
const imagen = (nombre = 'foto.jpg', tipo = 'image/jpeg') => new File([new Uint8Array(2000)], nombre, { type: tipo })

beforeEach(() => {
  window.localStorage.clear()
  reiniciarAlmacenamientoParaPruebas()
  olvidarEstadoDemoParaPruebas()
  almacen.vaciar()
  establecerRelojParaPruebas(() => new Date('2026-10-23T15:00:00Z'))
})

describe('foto de perfil en la interfaz (D14, D24, D35)', () => {
  it('la propia persona sube, ve y retira su foto; la app funciona igual sin ella', async () => {
    await abrir('/personal/trab-001', 'usr-trab-001')
    await screen.findByRole('heading', { name: 'María López' })
    expect(screen.queryByRole('button', { name: 'Retirar foto' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /Sin foto visible de María López/ }).length).toBeGreaterThan(0)

    const { entrada } = await abrirEditorDeFoto()
    await userEvent.upload(entrada, imagen())
    expect(await screen.findByText('Foto guardada en esta demostración.')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Retirar foto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar foto' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole('img', { name: 'Foto de María López' }).length).toBeGreaterThan(0))

    const marcaciones = repositorios.marcaciones.listar().length
    await userEvent.click(screen.getByRole('button', { name: 'Retirar foto' }))
    expect(await screen.findByText('Foto retirada. El historial de asistencia no cambió.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('img', { name: 'Foto de María López' })).not.toBeInTheDocument())
    expect(repositorios.marcaciones.listar()).toHaveLength(marcaciones)
  })

  it('rechaza un formato no admitido con un mensaje claro y no guarda nada', async () => {
    const usuario = userEvent.setup({ applyAccept: false })
    await abrir('/personal/trab-001', 'usr-trab-001')
    await screen.findByRole('heading', { name: 'María López' })
    const { entrada } = await abrirEditorDeFoto()
    await usuario.upload(entrada, imagen('animada.gif', 'image/gif'))
    expect(await screen.findByText('Formato no admitido. Usa una foto JPG, JPEG, PNG o WebP.')).toBeInTheDocument()
    expect(await almacen.contar()).toBe(0)
  })

  it.each([
    ['CUOTA_EXCEDIDA', /no tiene espacio para guardar más fotos/],
    ['LIMITE_DE_FOTOS', /máximo de fotos de esta demostración/],
    ['ALMACENAMIENTO_NO_DISPONIBLE', /no permite guardar fotos/],
  ] as const)('si el almacenamiento falla (%s) explica qué pasó y la app sigue funcionando', async (motivo, mensaje) => {
    almacen.falloAlGuardar = new ErrorAlmacenFotos(motivo)
    await abrir('/personal/trab-001', 'usr-trab-001')
    await screen.findByRole('heading', { name: 'María López' })
    const { entrada } = await abrirEditorDeFoto()
    await userEvent.upload(entrada, imagen())
    expect(await screen.findByText(mensaje)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'María López' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subir foto' })).toBeInTheDocument()
  })

  it('administración y coordinación no cambian la foto de otra persona', async () => {
    await abrir('/personal/trab-001', 'usr-coord-1')
    await screen.findByRole('heading', { name: 'María López' })
    expect(screen.queryByRole('button', { name: 'Cambiar mi foto de perfil' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Subir foto' })).not.toBeInTheDocument()
  })

  it('el coordinador autorizado ve la foto de un trabajador; el administrador sin permiso solo ve iniciales (D24, D30)', async () => {
    await servicios.fotos.guardar({ trabajadorId: 'trab-001' }, new Blob([new Uint8Array(10)], { type: 'image/webp' }))
    const coordinador = await abrir('/personal/trab-001', 'usr-coord-1')
    await screen.findByRole('heading', { name: 'María López' })
    await waitFor(() => expect(screen.getAllByRole('img', { name: 'Foto de María López' }).length).toBeGreaterThan(0))
    coordinador.unmount()
    await abrir('/personal/trab-001', 'usr-admin-2')
    await screen.findByRole('heading', { name: 'María López' })
    expect(screen.queryByRole('img', { name: 'Foto de María López' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /Sin foto visible de María López/ }).length).toBeGreaterThan(0)
  })

  it('todo usuario puede poner su foto desde su ficha, también administración', async () => {
    await abrir('/usuarios/usr-admin-1', 'usr-admin-1')
    await screen.findByRole('heading', { name: 'Carolina Mejía' })
    const { dialogo, entrada } = await abrirEditorDeFoto()
    expect(within(dialogo).getByRole('button', { name: 'Subir foto' })).toBeInTheDocument()
    await userEvent.upload(entrada, imagen('perfil.png', 'image/png'))
    expect(await within(dialogo).findByText('Foto guardada en esta demostración.')).toBeInTheDocument()
    expect(await almacen.obtener('usuario:usr-admin-1')).not.toBeNull()
  })

  it('la foto propia no aparece fuera de la ficha: ni en la barra superior ni en el menú del perfil (D41)', async () => {
    await servicios.fotos.guardar({ usuarioId: 'usr-admin-1' }, new Blob([new Uint8Array(10)], { type: 'image/webp' }))
    await abrir('/hospitales', 'usr-admin-1')
    await userEvent.click(await screen.findByRole('button', { name: /Carolina Mejía/ }))
    expect(screen.getByRole('link', { name: 'Mi ficha' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mi foto de perfil' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Carolina Mejía/ })).not.toBeInTheDocument()
  })

  it('el trabajador no ve su foto en la aplicación móvil, solo en su ficha (D41)', async () => {
    await servicios.fotos.guardar({ trabajadorId: 'trab-001' }, new Blob([new Uint8Array(10)], { type: 'image/webp' }))
    await abrir('/registro', 'usr-trab-001')
    await screen.findByRole('heading', { name: 'Registro de jornada' })
    expect(screen.queryByRole('img', { name: /María López/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Perfil' }))
    await screen.findByRole('heading', { name: 'María López' })
    await waitFor(() => expect(screen.getAllByRole('img', { name: 'Foto de María López' }).length).toBeGreaterThan(0))
  })
})

describe('horarios en la interfaz (HU-04, D15)', () => {
  it('la ficha muestra el horario vigente y el historial, y distingue lo planificado', async () => {
    await abrir('/personal/trab-001', 'usr-coord-1')
    await screen.findByRole('heading', { name: 'María López' })
    expect(screen.getByText('Horario vigente (planificado)')).toBeInTheDocument()
    expect(screen.getAllByText('07:00 – 16:00', { exact: false }).length).toBeGreaterThan(0)
    expect(screen.getByText('Entre 12:00 y 14:00 · 60 min autorizados')).toBeInTheDocument()
    expect(screen.getByText('Desde 2026-09-01 (vigente)')).toBeInTheDocument()
    expect(screen.getByText('Desde 2026-01-01')).toBeInTheDocument()
  })

  it('el coordinador asigna un horario nuevo y el anterior se conserva en el historial', async () => {
    await abrir('/personal/trab-001', 'usr-coord-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Cambiar horario' }))
    fireEvent.change(screen.getByLabelText(/Rige desde/), { target: { value: '2026-10-25' } })
    fireEvent.change(screen.getByLabelText(/Hora de entrada/), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText(/Hora de salida/), { target: { value: '17:00' } })
    fireEvent.change(screen.getByLabelText(/Almuerzo desde/), { target: { value: '12:30' } })
    fireEvent.change(screen.getByLabelText(/Almuerzo hasta/), { target: { value: '14:30' } })
    await userEvent.click(screen.getByRole('button', { name: 'Asignar horario' }))
    expect(await screen.findByText(/Horario asignado en esta demostración/)).toBeInTheDocument()
    expect(screen.getByText('Desde 2026-10-25 (programado)')).toBeInTheDocument()
    expect(screen.getByText('Desde 2026-09-01 (vigente)')).toBeInTheDocument()
    expect(screen.getByText(/Tiene un horario programado a futuro/)).toBeInTheDocument()
  })

  it('muestra todos los errores del horario y no asigna nada si hay alguno', async () => {
    await abrir('/personal/trab-001', 'usr-coord-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Cambiar horario' }))
    fireEvent.change(screen.getByLabelText(/Rige desde/), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText(/Hora de salida/), { target: { value: '07:00' } })
    for (const dia of ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']) {
      await userEvent.click(screen.getByRole('checkbox', { name: dia }))
    }
    await userEvent.click(screen.getByRole('button', { name: 'Asignar horario' }))
    expect(screen.getByText(/desde hoy o desde una fecha futura/)).toBeInTheDocument()
    expect(screen.getByText('Elige al menos un día laborable.')).toBeInTheDocument()
    expect(screen.getByText(/distinta de la entrada/)).toBeInTheDocument()
    expect(await servicios.horarios.listarPorTrabajador('trab-001')).toHaveLength(2)
  })

  it('el administrador consulta el horario pero no lo cambia', async () => {
    await abrir('/personal/trab-001', 'usr-admin-1')
    await screen.findByRole('heading', { name: 'María López' })
    expect(screen.getByText('Horario vigente (planificado)')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cambiar horario' })).not.toBeInTheDocument()
  })

  it('Jornadas lista el horario de cada trabajador y el coordinador abre y edita el de uno', async () => {
    await abrir('/jornadas', 'usr-coord-1')
    const fila = (await screen.findByText('María López')).closest('tr')!
    expect(within(fila).getByText('07:00 – 16:00')).toBeInTheDocument()
    expect(within(fila).getByText('12:00 – 14:00 · 60 min')).toBeInTheDocument()
    expect(within(fila).getByText('Todos los días')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Editar horario de María López' }))
    const dialogo = screen.getByRole('dialog', { name: 'Horario de María López' })
    expect(within(dialogo).getByRole('button', { name: 'Cambiar horario' })).toBeInTheDocument()
  })

  it('el turno nocturno se señala como que cruza la medianoche', async () => {
    await abrir('/jornadas', 'usr-coord-1')
    await screen.findByText('María López')
    await userEvent.type(screen.getByLabelText('Buscar'), 'Marcela')
    expect(screen.getByText('19:00 – 04:00 (cruza medianoche)')).toBeInTheDocument()
  })

  it('el administrador solo ve «Ver horario» y no puede cambiarlo', async () => {
    await abrir('/jornadas', 'usr-admin-1')
    await userEvent.click(await screen.findByRole('button', { name: 'Ver horario de María López' }))
    const dialogo = screen.getByRole('dialog', { name: 'Horario de María López' })
    expect(within(dialogo).queryByRole('button', { name: 'Cambiar horario' })).not.toBeInTheDocument()
    expect(within(dialogo).getByText('Historial de horarios')).toBeInTheDocument()
  })

  it('el trabajador ve únicamente su propio horario, sin lista de personal', async () => {
    await abrir('/jornadas', 'usr-trab-001')
    expect(await screen.findByRole('heading', { name: 'Mi horario' })).toBeInTheDocument()
    expect(screen.getByText('Horario vigente (planificado)')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cambiar horario' })).not.toBeInTheDocument()
    expect(screen.queryByText('Marcela Ospina')).not.toBeInTheDocument()
  })
})
