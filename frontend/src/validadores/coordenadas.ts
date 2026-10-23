/**
 * Validación de coordenadas escritas a mano (spec D22, CA-7).
 *
 * Responsabilidad: convertir el texto de un campo en un número válido o en un mensaje de error
 * comprensible. Acepta la coma como separador decimal. No consulta ni guarda nada.
 */

/** Resultado de validar un campo: o hay valor, o hay un mensaje de error (nunca ambos). */
export type ResultadoCampoNumerico = { valor: number; error: null } | { valor: null; error: string }

const FORMATO_DECIMAL = /^-?\d+(\.\d+)?$/

function validarCampo(texto: string, nombre: string, minimo: number, maximo: number, ejemplo: string): ResultadoCampoNumerico {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') {
    return { valor: null, error: `La ${nombre} es obligatoria.` }
  }
  if (!FORMATO_DECIMAL.test(limpio)) {
    return { valor: null, error: `La ${nombre} debe ser un número, por ejemplo ${ejemplo}.` }
  }
  const valor = Number(limpio)
  if (valor < minimo || valor > maximo) {
    return { valor: null, error: `La ${nombre} debe estar entre ${minimo} y ${maximo}.` }
  }
  return { valor, error: null }
}

/** Valida una latitud: número entre -90 y 90. */
export function validarLatitud(texto: string): ResultadoCampoNumerico {
  return validarCampo(texto, 'latitud', -90, 90, '5.0689')
}

/** Valida una longitud: número entre -180 y 180. */
export function validarLongitud(texto: string): ResultadoCampoNumerico {
  return validarCampo(texto, 'longitud', -180, 180, '-75.5174')
}

/** Resultado de validar un par de coordenadas. */
export interface ResultadoCoordenadas {
  latitud: ResultadoCampoNumerico
  longitud: ResultadoCampoNumerico
  /** Verdadero solo si ambas son válidas. */
  validas: boolean
}

/** Valida latitud y longitud a la vez, para que el formulario muestre todos los errores juntos. */
export function validarCoordenadas(latitudTexto: string, longitudTexto: string): ResultadoCoordenadas {
  const latitud = validarLatitud(latitudTexto)
  const longitud = validarLongitud(longitudTexto)
  return { latitud, longitud, validas: latitud.error === null && longitud.error === null }
}
