/** Estado de un trabajador. Los valores distintos de ACTIVO suprimen la detección y las alertas (P-20, provisional). */
export type EstadoTrabajador = 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'INCAPACIDAD' | 'LICENCIA'

/**
 * Contrato de intercambio de un trabajador.
 *
 * Representa a una persona del personal asignada a un hospital. Solo incluye los datos
 * personales estrictamente necesarios (P-13). No incluye horarios ni marcaciones.
 */
export interface TrabajadorDto {
  id: string
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  cargo: string
  telefono?: string
  hospitalId: string
  estado: EstadoTrabajador
  urlFoto?: string | null
}
