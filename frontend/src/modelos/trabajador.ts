import type { EstadoTrabajador } from '../contratos/trabajador'
import type { DatosPersonales } from './datosPersonales'

/**
 * Modelo interno de un trabajador para la interfaz.
 *
 * Añade al contrato datos derivados (`nombreCompleto`, `estaActivo`) para que los componentes
 * no los recalculen. No se envía a la API: para eso existe `TrabajadorDto`.
 */
export interface Trabajador {
  id: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  tipoDocumento: string
  numeroDocumento: string
  cargo: string
  telefono?: string
  hospitalId: string
  estado: EstadoTrabajador
  /** Verdadero solo si el estado es ACTIVO; los demás estados suprimen la detección (P-20). */
  estaActivo: boolean
  urlFoto: string | null
}

/**
 * Datos editables de un trabajador en el formulario de alta y edición. Solo los datos personales
 * estrictamente necesarios (P-13). La foto no se edita aquí: es de cada persona (D14).
 */
export interface DatosTrabajador extends DatosPersonales {
  hospitalId: string
  estado: EstadoTrabajador
}
