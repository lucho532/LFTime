/**
 * Acceso al almacenamiento local del navegador para la demostración (spec D9).
 *
 * Representa la única puerta de entrada a `localStorage`. Su responsabilidad es leer y escribir
 * texto y JSON con el prefijo `lftime.demo.`, sin lanzar errores: el navegador puede bloquear el
 * almacenamiento (ventana privada, datos bloqueados) o llenarlo. Si no está disponible, trabaja en
 * memoria durante la sesión para que la aplicación siga funcionando.
 *
 * No decide qué se guarda ni conoce las entidades del negocio.
 */

export const PREFIJO_CLAVE = 'lftime.demo.'

/** Motivo por el que una escritura no se pudo completar. */
export type MotivoFalloAlmacenamiento = 'CUOTA_EXCEDIDA' | 'ERROR'

export type ResultadoEscritura = { exito: true } | { exito: false; motivo: MotivoFalloAlmacenamiento }

const memoria = new Map<string, string>()
let usarMemoria: boolean | null = null

/** Indica si `localStorage` está disponible y permite escribir. Se calcula una sola vez. */
export function almacenamientoDisponible(): boolean {
  if (usarMemoria === null) {
    try {
      const clavePrueba = `${PREFIJO_CLAVE}__prueba`
      window.localStorage.setItem(clavePrueba, '1')
      window.localStorage.removeItem(clavePrueba)
      usarMemoria = false
    } catch {
      usarMemoria = true
    }
  }
  return !usarMemoria
}

/** Solo para pruebas: vuelve a comprobar la disponibilidad y vacía la memoria de respaldo. */
export function reiniciarAlmacenamientoParaPruebas(): void {
  usarMemoria = null
  memoria.clear()
}

function esErrorDeCuota(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014)
}

/** Lee el texto guardado bajo `nombre`, o `null` si no existe o no se puede leer. */
export function leerTexto(nombre: string): string | null {
  const clave = PREFIJO_CLAVE + nombre
  const enMemoria = memoria.get(clave)
  if (enMemoria !== undefined) {
    return enMemoria
  }
  if (!almacenamientoDisponible()) {
    return null
  }
  try {
    return window.localStorage.getItem(clave)
  } catch {
    return null
  }
}

/** Lee y convierte a JSON el valor guardado bajo `nombre`; devuelve `null` si no existe o está dañado. */
export function leerJson<T>(nombre: string): T | null {
  const texto = leerTexto(nombre)
  if (texto === null) {
    return null
  }
  try {
    return JSON.parse(texto) as T
  } catch {
    return null
  }
}

/**
 * Guarda texto bajo `nombre`. Informa el resultado en lugar de lanzar errores.
 * Si el navegador no permite guardar (almacenamiento bloqueado o lleno), el valor se conserva solo
 * en memoria durante la sesión para que la aplicación siga funcionando, y se informa el fallo.
 */
export function escribirTexto(nombre: string, texto: string): ResultadoEscritura {
  const clave = PREFIJO_CLAVE + nombre
  if (!almacenamientoDisponible()) {
    memoria.set(clave, texto)
    return { exito: true }
  }
  try {
    window.localStorage.setItem(clave, texto)
    memoria.delete(clave)
    return { exito: true }
  } catch (error) {
    memoria.set(clave, texto)
    return { exito: false, motivo: esErrorDeCuota(error) ? 'CUOTA_EXCEDIDA' : 'ERROR' }
  }
}

/** Guarda un valor como JSON bajo `nombre`. */
export function escribirJson(nombre: string, valor: unknown): ResultadoEscritura {
  return escribirTexto(nombre, JSON.stringify(valor))
}

/** Elimina una clave de la demostración. No falla si no existe o el almacenamiento no está disponible. */
export function eliminarClave(nombre: string): void {
  const clave = PREFIJO_CLAVE + nombre
  memoria.delete(clave)
  if (!almacenamientoDisponible()) {
    return
  }
  try {
    window.localStorage.removeItem(clave)
  } catch {
    // Sin acceso al almacenamiento: no hay nada que eliminar.
  }
}

/** Elimina todas las claves de la demostración (las que empiezan con `lftime.demo.`). */
export function eliminarTodasLasClaves(): void {
  memoria.clear()
  if (!almacenamientoDisponible()) {
    return
  }
  try {
    const claves: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const clave = window.localStorage.key(i)
      if (clave?.startsWith(PREFIJO_CLAVE)) {
        claves.push(clave)
      }
    }
    claves.forEach((clave) => window.localStorage.removeItem(clave))
  } catch {
    // Sin acceso al almacenamiento: no hay nada que eliminar.
  }
}
