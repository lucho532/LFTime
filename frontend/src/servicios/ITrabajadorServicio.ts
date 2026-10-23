import type { DatosTrabajador, Trabajador } from '../modelos/trabajador'

/**
 * Contrato del servicio de trabajadores.
 *
 * Representa el acceso a los datos de personal. Su responsabilidad es entregar modelos de interfaz y
 * registrar altas y cambios con auditoría; hoy lo implementa la demostración y en la Fase 2 una llamada
 * HTTP a la API. No contiene reglas de negocio ni decide permisos (en la Fase 1 son solo visuales, D27).
 */
export interface ITrabajadorServicio {
  listar(): Promise<Trabajador[]>
  obtenerPorId(id: string): Promise<Trabajador | null>
  /** Crea un trabajador. Rechaza un documento ya registrado (supuesto provisional: un solo trabajador por documento). */
  crear(datos: DatosTrabajador, usuarioId: string): Promise<Trabajador>
  /** Actualiza los datos y el estado de un trabajador. No toca la foto, el historial ni los horarios. */
  actualizar(id: string, datos: DatosTrabajador, usuarioId: string): Promise<Trabajador>
}
