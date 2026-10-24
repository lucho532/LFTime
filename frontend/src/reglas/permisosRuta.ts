import type { Rol } from '../contratos/usuario'
import type { Usuario } from '../modelos/usuario'
import { rutaDeFichaDe } from './permisosPersonal'

/** Nombre de cada icono del menú (ver `componentes/iconos/Icono.tsx`). */
export type NombreIcono = 'inicio' | 'personal' | 'hospitales' | 'jornadas' | 'registro' | 'incidencias' | 'reportes' | 'configuracion'

/** Entrada del menú: a dónde lleva y cómo se llama para cada rol que puede entrar. */
interface EntradaMenu {
  ruta: string
  icono: NombreIcono
  /** Un rol aparece aquí solo si puede entrar a la ruta; el texto es el nombre que ve ese rol. */
  etiquetas: Partial<Record<Rol, string>>
}

/** Entrada del menú ya resuelta para un rol. */
export interface EntradaMenuDeRol {
  ruta: string
  icono: NombreIcono
  etiqueta: string
}

/**
 * Matriz provisional de acceso por rol (spec D27, plan §13, P-21).
 *
 * Es la única fuente del menú **y** de las rutas permitidas. Es solo visual: oculta pantallas en
 * la demostración, pero no es seguridad. La autorización real se comprueba en el backend (Fase 2).
 */
const ENTRADAS_MENU: EntradaMenu[] = [
  { ruta: 'inicio', icono: 'inicio', etiquetas: { ADMINISTRADOR: 'Inicio', COORDINADOR: 'Inicio' } },
  { ruta: 'personal', icono: 'personal', etiquetas: { ADMINISTRADOR: 'Personal', COORDINADOR: 'Personal', TRABAJADOR: 'Mi ficha' } },
  { ruta: 'hospitales', icono: 'hospitales', etiquetas: { ADMINISTRADOR: 'Hospitales / Municipios', COORDINADOR: 'Hospitales / Municipios' } },
  { ruta: 'jornadas', icono: 'jornadas', etiquetas: { ADMINISTRADOR: 'Jornadas', COORDINADOR: 'Jornadas', TRABAJADOR: 'Mi horario' } },
  { ruta: 'registro', icono: 'registro', etiquetas: { TRABAJADOR: 'Registro' } },
  { ruta: 'incidencias', icono: 'incidencias', etiquetas: { ADMINISTRADOR: 'Incidencias', COORDINADOR: 'Incidencias', TRABAJADOR: 'Mis incidencias' } },
  { ruta: 'reportes', icono: 'reportes', etiquetas: { ADMINISTRADOR: 'Reportes', COORDINADOR: 'Reportes' } },
  { ruta: 'configuracion', icono: 'configuracion', etiquetas: { ADMINISTRADOR: 'Configuración' } },
]

/**
 * Rutas con sesión que no aparecen en el menú lateral: la ficha de un administrador o coordinador (`/usuarios/:id`)
 * y el historial del trabajador (`/historial`, que se abre desde la barra inferior de su aplicación móvil).
 * Quién abre cada una la decide su pantalla con `permisosPersonal`; aquí solo se dice qué roles llegan.
 */
const RUTAS_SIN_MENU: Array<{ ruta: string; roles: Rol[] }> = [
  { ruta: 'usuarios', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
  { ruta: 'historial', roles: ['TRABAJADOR'] },
]

/** Entradas del menú que ve un rol, en orden. */
export function entradasMenuDe(rol: Rol): EntradaMenuDeRol[] {
  return ENTRADAS_MENU.flatMap((entrada) => {
    const etiqueta = entrada.etiquetas[rol]
    return etiqueta ? [{ ruta: entrada.ruta, icono: entrada.icono, etiqueta }] : []
  })
}

/**
 * Indica si un rol puede entrar a una ruta. Acepta rutas con o sin barra inicial y con subrutas
 * (`/personal/trab-001` se evalúa por `personal`).
 */
export function puedeAccederARuta(rol: Rol, rutaCompleta: string): boolean {
  const primerSegmento = rutaCompleta.split('/').filter(Boolean)[0]
  return entradasMenuDe(rol).some((entrada) => entrada.ruta === primerSegmento) || RUTAS_SIN_MENU.some((r) => r.ruta === primerSegmento && r.roles.includes(rol))
}

/** Ruta a la que llega cada rol al iniciar sesión: el trabajador al registro y el resto al panel. */
export function rutaInicialDe(rol: Rol): string {
  return rol === 'TRABAJADOR' ? '/registro' : '/inicio'
}

/** Pestaña de la barra inferior de la aplicación móvil del trabajador. */
export interface PestanaMovil {
  ruta: string
  icono: NombreIcono
  etiqueta: string
}

/**
 * Pestañas de la barra inferior del trabajador (D40): Inicio, Historial y Perfil. «Perfil» lleva a su ficha,
 * donde están su foto y sus datos. Solo visual (D27).
 */
export function pestanasMovilDe(usuario: Pick<Usuario, 'id' | 'rol' | 'trabajadorId'>): PestanaMovil[] {
  return [
    { ruta: '/registro', icono: 'inicio', etiqueta: 'Inicio' },
    { ruta: '/historial', icono: 'jornadas', etiqueta: 'Historial' },
    { ruta: rutaDeFichaDe(usuario), icono: 'personal', etiqueta: 'Perfil' },
  ]
}
