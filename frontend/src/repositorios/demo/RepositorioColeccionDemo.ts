import { escribirJson, leerJson } from './almacenamientoLocal'
import { asegurarDatosDemo } from './inicializacionDemo'

/** Error al guardar datos de demostración (por ejemplo, almacenamiento lleno). */
export class ErrorAlmacenamientoDemo extends Error {
  constructor(coleccion: string, motivo: string) {
    super(`No se pudo guardar la colección «${coleccion}»: ${motivo}.`)
    this.name = 'ErrorAlmacenamientoDemo'
  }
}

/**
 * Repositorio genérico de una colección de contratos guardada en el almacenamiento local.
 *
 * Representa la persistencia de la demostración: lee y escribe la lista completa de una colección.
 * Es síncrono y se envuelve en servicios asíncronos. No decide reglas de negocio ni autoriza
 * operaciones, y no debe usarse fuera de `repositorios/demo`.
 */
export class RepositorioColeccionDemo<T extends { id: string }> {
  private readonly nombre: string

  constructor(nombre: string) {
    this.nombre = nombre
  }

  /** Devuelve todos los elementos de la colección. */
  listar(): T[] {
    asegurarDatosDemo()
    return leerJson<T[]>(this.nombre) ?? []
  }

  /** Devuelve el elemento con ese `id`, o `null` si no existe. */
  obtenerPorId(id: string): T | null {
    return this.listar().find((elemento) => elemento.id === id) ?? null
  }

  /** Inserta o reemplaza un elemento por su `id`. Lanza `ErrorAlmacenamientoDemo` si no se puede guardar. */
  guardar(elemento: T): void {
    const lista = this.listar()
    const posicion = lista.findIndex((existente) => existente.id === elemento.id)
    if (posicion >= 0) {
      lista[posicion] = elemento
    } else {
      lista.push(elemento)
    }
    this.reemplazarTodo(lista)
  }

  /** Sustituye toda la colección. Lanza `ErrorAlmacenamientoDemo` si no se puede guardar. */
  reemplazarTodo(elementos: T[]): void {
    const resultado = escribirJson(this.nombre, elementos)
    if (!resultado.exito) {
      throw new ErrorAlmacenamientoDemo(this.nombre, resultado.motivo === 'CUOTA_EXCEDIDA' ? 'almacenamiento lleno' : 'error de escritura')
    }
  }
}
