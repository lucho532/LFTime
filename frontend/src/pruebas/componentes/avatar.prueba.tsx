import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from '../../componentes/base/Avatar'
import { aUsuario } from '../../mapeadores/usuarioMapeador'
import type { Usuario } from '../../modelos/usuario'
import { puedeVerFoto } from '../../reglas/permisoFoto'

function usuario(datos: Partial<Parameters<typeof aUsuario>[0]> & { id: string; rol: Usuario['rol'] }): Usuario {
  return aUsuario({ nombres: 'Nombre', apellidos: 'Apellido', ...datos })
}

const maria = usuario({ id: 'usr-trab-001', rol: 'TRABAJADOR', trabajadorId: 'trab-001' })
const coordinador = usuario({ id: 'usr-coord-1', rol: 'COORDINADOR' })
const adminConPermiso = usuario({ id: 'usr-admin-1', rol: 'ADMINISTRADOR', puedeVerFotos: true })
const adminSinPermiso = usuario({ id: 'usr-admin-2', rol: 'ADMINISTRADOR', puedeVerFotos: false })
const otroTrabajador = usuario({ id: 'usr-trab-004', rol: 'TRABAJADOR', trabajadorId: 'trab-004' })
const fotoDeMaria = { trabajadorId: 'trab-001' }

describe('puedeVerFoto (provisional, D20, D24, D30)', () => {
  it('el propietario ve la suya, por cuenta o por trabajador', () => {
    expect(puedeVerFoto(maria, fotoDeMaria)).toBe(true)
    expect(puedeVerFoto(maria, { usuarioId: 'usr-trab-001' })).toBe(true)
  })

  it('un coordinador autorizado ve la de un trabajador', () => {
    expect(puedeVerFoto(coordinador, fotoDeMaria)).toBe(true)
  })

  it('un administrador solo la ve con permiso explícito', () => {
    expect(puedeVerFoto(adminConPermiso, fotoDeMaria)).toBe(true)
    expect(puedeVerFoto(adminSinPermiso, fotoDeMaria)).toBe(false)
  })

  it('un trabajador no ve la de otra persona', () => {
    expect(puedeVerFoto(otroTrabajador, fotoDeMaria)).toBe(false)
  })

  it('sin sesión nadie la ve', () => {
    expect(puedeVerFoto(null, fotoDeMaria)).toBe(false)
  })

  it('un propietario sin identificador no coincide con nadie por error', () => {
    expect(puedeVerFoto(otroTrabajador, {})).toBe(false)
  })
})

describe('Avatar', () => {
  it('con permiso y foto muestra la imagen con texto alternativo', () => {
    render(<Avatar nombreCompleto="María López" urlFoto="data:image/png;base64,AAAA" puedeVerFoto />)
    expect(screen.getByRole('img', { name: 'Foto de María López' })).toBeInTheDocument()
  })

  it('sin permiso nunca muestra la foto, aunque exista: muestra las iniciales', () => {
    const { container } = render(<Avatar nombreCompleto="María López" urlFoto="data:image/png;base64,AAAA" puedeVerFoto={false} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Sin foto visible de María López' })).toHaveTextContent('ML')
  })

  it('con permiso pero sin foto muestra las iniciales: la aplicación funciona igual sin foto', () => {
    render(<Avatar nombreCompleto="Julián Castro Ruiz" urlFoto={null} puedeVerFoto />)
    expect(screen.getByRole('img', { name: /Julián Castro Ruiz/ })).toHaveTextContent('JC')
  })
})
