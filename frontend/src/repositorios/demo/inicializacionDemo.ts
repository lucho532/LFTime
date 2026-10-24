import { construirDatosDemo } from '../../datos-demo/construirDatosDemo'
import type { DatosDemo } from '../../datos-demo/tipos'
import type { EstadoDatosDemo } from '../../modelos/estadoDatosDemo'
import { hoyColombia, obtenerAhoraUtc } from '../../utilidades/horaColombia'
import { almacenamientoDisponible, eliminarTodasLasClaves, escribirJson, leerJson, leerTexto } from './almacenamientoLocal'

/** Versión del esquema de los datos guardados. Cámbiala cuando cambie la forma de los contratos. */
export const VERSION_ESQUEMA = 3

const CLAVE_VERSION = 'version'
const CLAVE_FECHA_SEMILLA = 'fechaSemilla'

/** Nombre de cada colección guardada; coincide con las claves de `DatosDemo`. */
export const NOMBRES_COLECCIONES: Array<keyof DatosDemo> = [
  'municipios', 'hospitales', 'usuarios', 'trabajadores', 'horarios',
  'marcaciones', 'intentos', 'incidencias', 'alertas', 'auditoria',
]

let estadoActual: EstadoDatosDemo | null = null

/** Genera y guarda todos los datos. Devuelve `false` si alguna escritura no pudo hacerse en el navegador. */
function sembrar(): boolean {
  const datos = construirDatosDemo({ hoy: hoyColombia(), ahora: obtenerAhoraUtc() })
  const resultados = NOMBRES_COLECCIONES.map((nombre) => escribirJson(nombre, datos[nombre]))
  resultados.push(escribirJson(CLAVE_VERSION, VERSION_ESQUEMA), escribirJson(CLAVE_FECHA_SEMILLA, hoyColombia()))
  return almacenamientoDisponible() && resultados.every((resultado) => resultado.exito)
}

function evaluarExistentes(): EstadoDatosDemo {
  if (leerJson<number>(CLAVE_VERSION) !== VERSION_ESQUEMA) {
    return 'VERSION_DISTINTA'
  }
  return leerJson<string>(CLAVE_FECHA_SEMILLA) === hoyColombia() ? 'EXISTENTES' : 'DE_OTRO_DIA'
}

/**
 * Garantiza que existan datos de demostración y devuelve su situación. Solo siembra cuando no hay
 * ninguno: si hay datos de otra versión o de otro día **no los borra** (podrían tener cambios del
 * usuario); informa el estado para que la interfaz ofrezca restablecer.
 */
export function asegurarDatosDemo(): EstadoDatosDemo {
  if (estadoActual !== null) {
    return estadoActual
  }
  if (leerTexto(CLAVE_VERSION) === null) {
    estadoActual = sembrar() ? 'RECIEN_INICIALIZADOS' : 'ALMACENAMIENTO_NO_DISPONIBLE'
  } else {
    estadoActual = evaluarExistentes()
  }
  return estadoActual
}

/** Borra todos los datos de demostración y los vuelve a generar relativos a hoy (T-2.7). */
export function restablecerDatosDemo(): EstadoDatosDemo {
  eliminarTodasLasClaves()
  estadoActual = sembrar() ? 'RECIEN_INICIALIZADOS' : 'ALMACENAMIENTO_NO_DISPONIBLE'
  return estadoActual
}

/** Solo para pruebas: olvida el estado en memoria para volver a evaluar el almacenamiento. */
export function olvidarEstadoDemoParaPruebas(): void {
  estadoActual = null
}
