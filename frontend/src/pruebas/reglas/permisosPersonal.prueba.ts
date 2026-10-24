import { describe, expect, it } from 'vitest'
import type { Usuario } from '../../modelos/usuario'
import { puedeEditarDatosDeTrabajador, puedeEditarFichaDeUsuario, rutaDeFichaDe } from '../../reglas/permisosPersonal'
import { puedeAccederARuta } from '../../reglas/permisosRuta'

function usuario(id: string, rol: Usuario['rol'], trabajadorId: string | null = null): Usuario {
  return {
    id, nombres: id, apellidos: 'Prueba', nombreCompleto: `${id} Prueba`, rol, tipoDocumento: '', numeroDocumento: '', cargo: '', telefono: '',
    trabajadorId, hospitalesResponsable: [], puedeVerFotos: false, urlFoto: null, notaDemo: '',
  }
}

const ADMIN = usuario('admin', 'ADMINISTRADOR')
const COORD = usuario('coord', 'COORDINADOR')
const OTRO_COORD = usuario('coord2', 'COORDINADOR')
const TRABAJADOR = usuario('usr-t1', 'TRABAJADOR', 'trab-1')

describe('permisos de las fichas (provisional, P-13, P-21)', () => {
  it('cada trabajador edita sus datos personales; administración y coordinación editan los de cualquier trabajador', () => {
    expect(puedeEditarDatosDeTrabajador(TRABAJADOR, 'trab-1')).toBe(true)
    expect(puedeEditarDatosDeTrabajador(TRABAJADOR, 'trab-2')).toBe(false)
    expect(puedeEditarDatosDeTrabajador(COORD, 'trab-2')).toBe(true)
    expect(puedeEditarDatosDeTrabajador(ADMIN, 'trab-2')).toBe(true)
    expect(puedeEditarDatosDeTrabajador(null, 'trab-1')).toBe(false)
  })

  it('cada administrador o coordinador edita su ficha; solo el administrador edita la de otros', () => {
    expect(puedeEditarFichaDeUsuario(COORD, 'coord')).toBe(true)
    expect(puedeEditarFichaDeUsuario(COORD, 'coord2')).toBe(false)
    expect(puedeEditarFichaDeUsuario(OTRO_COORD, 'admin')).toBe(false)
    expect(puedeEditarFichaDeUsuario(ADMIN, 'coord2')).toBe(true)
    expect(puedeEditarFichaDeUsuario(TRABAJADOR, 'admin')).toBe(false)
    expect(puedeEditarFichaDeUsuario(null, 'admin')).toBe(false)
  })

  it('cada persona va a su ficha: la de trabajador o la de usuario', () => {
    expect(rutaDeFichaDe(TRABAJADOR)).toBe('/personal/trab-1')
    expect(rutaDeFichaDe(COORD)).toBe('/usuarios/coord')
    expect(rutaDeFichaDe(ADMIN)).toBe('/usuarios/admin')
  })

  it('la ruta de la ficha de usuario no está en el menú y la alcanzan solo administración y coordinación', () => {
    expect(puedeAccederARuta('ADMINISTRADOR', '/usuarios/admin')).toBe(true)
    expect(puedeAccederARuta('COORDINADOR', '/usuarios/coord')).toBe(true)
    expect(puedeAccederARuta('TRABAJADOR', '/usuarios/admin')).toBe(false)
  })
})
