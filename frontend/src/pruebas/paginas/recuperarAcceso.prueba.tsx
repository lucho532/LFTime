import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { reiniciarAlmacenamientoParaPruebas } from '../../repositorios/demo/almacenamientoLocal'
import { olvidarEstadoDemoParaPruebas } from '../../repositorios/demo/inicializacionDemo'
import { validarCorreo } from '../../validadores/correo'

function renderizar(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Recuperación de acceso por correo (demostración)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reiniciarAlmacenamientoParaPruebas()
    olvidarEstadoDemoParaPruebas()
  })

  it('el ingreso ofrece «¿Olvidaste tu contraseña?» y lleva a pedir el enlace', async () => {
    renderizar('/ingreso')
    await userEvent.click(await screen.findByRole('link', { name: '¿Olvidaste tu contraseña?' }))
    expect(screen.getByRole('heading', { name: '¿Olvidaste tu contraseña?' })).toBeInTheDocument()
  })

  it('rechaza un correo vacío o mal escrito y, si es válido, aclara que no se envió nada', async () => {
    renderizar('/recuperar-acceso')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }))
    expect(screen.getByText('Escribe tu correo electrónico.')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'esto-no-es-un-correo')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }))
    expect(screen.getByText(/Escribe un correo válido/)).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Correo electrónico'))
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'persona@ejemplo.com')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }))
    expect(await screen.findByText(/no se envió ningún correo/i)).toBeInTheDocument()
  })

  it('la contraseña nueva exige confirmarla y aclara que no se cambió ninguna', async () => {
    renderizar('/restablecer-contrasena')
    await userEvent.type(screen.getByLabelText('Contraseña nueva'), 'abc')
    await userEvent.type(screen.getByLabelText('Confirma la contraseña nueva'), 'xyz')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña nueva' }))
    expect(screen.getByText('Las dos contraseñas no coinciden.')).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Confirma la contraseña nueva'))
    await userEvent.type(screen.getByLabelText('Confirma la contraseña nueva'), 'abc')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña nueva' }))
    expect(await screen.findByText(/no se cambió ninguna contraseña/i)).toBeInTheDocument()
  })

  it('validarCorreo solo revisa la forma', () => {
    expect(validarCorreo('  ')).not.toBeNull()
    expect(validarCorreo('a@b')).not.toBeNull()
    expect(validarCorreo(' a@b.co ')).toBeNull()
  })
})
