/**
 * Generador pseudoaleatorio determinista (mulberry32) para los datos de demostración.
 *
 * Con la misma semilla produce siempre la misma secuencia, para que la demo y las pruebas
 * sean reproducibles. No es criptográfico ni debe usarse para nada de seguridad.
 */
export type Generador = () => number

/** Crea un generador con la semilla indicada; cada llamada devuelve un número en [0, 1). */
export function crearGenerador(semilla: number): Generador {
  let estado = semilla >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Elige un elemento de la lista según el generador. */
export function elegir<T>(generador: Generador, lista: readonly T[]): T {
  return lista[Math.floor(generador() * lista.length)]
}

/** Devuelve un entero entre `minimo` y `maximo`, ambos incluidos. */
export function enteroEntre(generador: Generador, minimo: number, maximo: number): number {
  return minimo + Math.floor(generador() * (maximo - minimo + 1))
}

/** Convierte un texto en una semilla numérica estable. */
export function semillaDeTexto(texto: string): number {
  let hash = 2166136261
  for (let i = 0; i < texto.length; i += 1) {
    hash = Math.imul(hash ^ texto.charCodeAt(i), 16777619)
  }
  return hash >>> 0
}
