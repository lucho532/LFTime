import type { DatosPersonales } from '../modelos/datosPersonales'
import type { DatosTrabajador } from '../modelos/trabajador'

/** Errores del formulario de trabajador, por campo. Un campo sin error no aparece. */
export type ErroresTrabajador = Partial<Record<keyof DatosTrabajador, string>>

/** Errores de los datos personales, por campo (trabajadores, coordinadores y administradores). */
export type ErroresDatosPersonales = Partial<Record<keyof DatosPersonales, string>>

/**
 * Tipos de documento. **Lista provisional** (P-13): la lista definitiva de datos personales y de tipos
 * de documento queda por decidir con el responsable.
 */
export const TIPOS_DOCUMENTO = [
  { valor: 'CC', etiqueta: 'Cédula de ciudadanía' },
  { valor: 'CE', etiqueta: 'Cédula de extranjería' },
  { valor: 'PPT', etiqueta: 'Permiso por protección temporal' },
  { valor: 'PA', etiqueta: 'Pasaporte' },
]

const LARGO_MINIMO_DOCUMENTO = 5
const LARGO_MAXIMO_DOCUMENTO = 15

/** Quita puntos, espacios y guiones del documento y lo pasa a mayúsculas: «1.053.842-671» queda «1053842671». */
export function normalizarDocumento(documento: string): string {
  return documento.replace(/[.\s-]/g, '').toUpperCase()
}

/**
 * Valida los datos personales de cualquier persona (límites de interfaz, provisionales hasta cerrar P-13).
 * Devuelve un objeto vacío si todo es válido. No comprueba si el documento ya existe: eso lo hace el
 * servicio, que conoce a las demás personas.
 */
export function validarDatosPersonales(datos: DatosPersonales): ErroresDatosPersonales {
  const errores: ErroresDatosPersonales = {}
  if (datos.nombres.trim() === '') errores.nombres = 'Escribe los nombres.'
  if (datos.apellidos.trim() === '') errores.apellidos = 'Escribe los apellidos.'
  if (datos.cargo.trim() === '') errores.cargo = 'Escribe el cargo o servicio que presta.'

  if (!TIPOS_DOCUMENTO.some((tipo) => tipo.valor === datos.tipoDocumento)) {
    errores.tipoDocumento = 'Elige el tipo de documento.'
  }
  const documento = normalizarDocumento(datos.numeroDocumento)
  const soloNumeros = datos.tipoDocumento === 'CC' || datos.tipoDocumento === 'CE'
  if (documento === '') {
    errores.numeroDocumento = 'Escribe el número de documento.'
  } else if (documento.length < LARGO_MINIMO_DOCUMENTO || documento.length > LARGO_MAXIMO_DOCUMENTO) {
    errores.numeroDocumento = `El documento debe tener entre ${LARGO_MINIMO_DOCUMENTO} y ${LARGO_MAXIMO_DOCUMENTO} caracteres.`
  } else if (soloNumeros ? !/^\d+$/.test(documento) : !/^[A-Z0-9]+$/.test(documento)) {
    errores.numeroDocumento = soloNumeros ? 'Este tipo de documento solo lleva números.' : 'El documento solo puede llevar letras y números.'
  }

  const telefono = datos.telefono.replace(/[\s-]/g, '')
  if (telefono !== '' && !/^\+?\d{7,15}$/.test(telefono)) {
    errores.telefono = 'Escribe un teléfono válido, solo con números (puede empezar con +).'
  }
  return errores
}

/**
 * Valida los datos de un trabajador antes de guardarlos: sus datos personales y el hospital asignado.
 * Devuelve un objeto vacío si todo es válido.
 */
export function validarDatosTrabajador(datos: DatosTrabajador): ErroresTrabajador {
  const errores: ErroresTrabajador = validarDatosPersonales(datos)
  if (datos.hospitalId === '') errores.hospitalId = 'Elige el hospital asignado.'
  return errores
}
