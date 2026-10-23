import type { DatosHospital } from '../modelos/hospital'

/** Errores del formulario de hospital, por campo. Un campo sin error no aparece. */
export type ErroresHospital = Partial<Record<keyof DatosHospital, string>>

const LARGO_MAXIMO_NOMBRE = 120
const LARGO_MAXIMO_DIRECCION = 160

/**
 * Valida los datos de un hospital antes de guardarlos (límites de interfaz, no reglas de negocio).
 * Devuelve un objeto vacío si todo es válido. No consulta si el nombre ya existe.
 */
export function validarDatosHospital(datos: DatosHospital): ErroresHospital {
  const errores: ErroresHospital = {}
  const nombre = datos.nombre.trim()
  const direccion = datos.direccion.trim()
  if (nombre === '') {
    errores.nombre = 'Escribe el nombre del hospital.'
  } else if (nombre.length > LARGO_MAXIMO_NOMBRE) {
    errores.nombre = `El nombre no puede tener más de ${LARGO_MAXIMO_NOMBRE} caracteres.`
  }
  if (datos.municipioId === '') {
    errores.municipioId = 'Elige el municipio del hospital.'
  }
  if (direccion === '') {
    errores.direccion = 'Escribe la dirección del hospital.'
  } else if (direccion.length > LARGO_MAXIMO_DIRECCION) {
    errores.direccion = `La dirección no puede tener más de ${LARGO_MAXIMO_DIRECCION} caracteres.`
  }
  return errores
}
