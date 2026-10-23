import { describe, expect, it } from 'vitest'
import { entradasMenuDe, puedeAccederARuta, rutaInicialDe } from '../../reglas/permisosRuta'

const etiquetas = (rol: Parameters<typeof entradasMenuDe>[0]) => entradasMenuDe(rol).map((entrada) => entrada.etiqueta)

describe('permisosRuta (matriz provisional, plan §13, P-21)', () => {
  it('el administrador ve el panel y la configuración, pero no el registro de jornada', () => {
    expect(etiquetas('ADMINISTRADOR')).toEqual(['Inicio', 'Personal', 'Hospitales / Municipios', 'Jornadas', 'Incidencias', 'Reportes', 'Configuración'])
  })

  it('el coordinador ve lo mismo que el administrador salvo la configuración, y tampoco registra jornada', () => {
    expect(etiquetas('COORDINADOR')).toEqual(['Inicio', 'Personal', 'Hospitales / Municipios', 'Jornadas', 'Incidencias', 'Reportes'])
  })

  it('el trabajador solo ve lo propio: ficha, horario, registro e incidencias', () => {
    expect(etiquetas('TRABAJADOR')).toEqual(['Mi ficha', 'Mi horario', 'Registro', 'Mis incidencias'])
  })

  it('solo el trabajador puede registrar marcaciones', () => {
    expect(puedeAccederARuta('TRABAJADOR', 'registro')).toBe(true)
    expect(puedeAccederARuta('COORDINADOR', 'registro')).toBe(false)
    expect(puedeAccederARuta('ADMINISTRADOR', 'registro')).toBe(false)
  })

  it('solo el administrador entra a la configuración', () => {
    expect(puedeAccederARuta('ADMINISTRADOR', 'configuracion')).toBe(true)
    expect(puedeAccederARuta('COORDINADOR', 'configuracion')).toBe(false)
    expect(puedeAccederARuta('TRABAJADOR', 'configuracion')).toBe(false)
  })

  it('el trabajador no entra al panel, hospitales ni reportes', () => {
    for (const ruta of ['inicio', 'hospitales', 'reportes']) {
      expect(puedeAccederARuta('TRABAJADOR', ruta)).toBe(false)
    }
  })

  it('acepta rutas con barra inicial y subrutas, y rechaza rutas desconocidas', () => {
    expect(puedeAccederARuta('COORDINADOR', '/personal/trab-001')).toBe(true)
    expect(puedeAccederARuta('COORDINADOR', '/hospitales/hosp-01/coordenadas')).toBe(true)
    expect(puedeAccederARuta('ADMINISTRADOR', '/no-existe')).toBe(false)
    expect(puedeAccederARuta('ADMINISTRADOR', '/')).toBe(false)
  })

  it('cada rol aterriza en una ruta que puede ver', () => {
    expect(rutaInicialDe('TRABAJADOR')).toBe('/registro')
    expect(rutaInicialDe('COORDINADOR')).toBe('/inicio')
    expect(rutaInicialDe('ADMINISTRADOR')).toBe('/inicio')
    for (const rol of ['ADMINISTRADOR', 'COORDINADOR', 'TRABAJADOR'] as const) {
      expect(puedeAccederARuta(rol, rutaInicialDe(rol))).toBe(true)
    }
  })

  it('el menú y los accesos salen de la misma fuente: todo lo que está en el menú se puede abrir', () => {
    for (const rol of ['ADMINISTRADOR', 'COORDINADOR', 'TRABAJADOR'] as const) {
      for (const entrada of entradasMenuDe(rol)) {
        expect(puedeAccederARuta(rol, entrada.ruta)).toBe(true)
      }
    }
  })
})
