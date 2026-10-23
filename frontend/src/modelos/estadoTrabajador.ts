import type { EstadoTrabajador } from '../contratos/trabajador'

/** Texto que ve la persona para cada estado de un trabajador. */
export const TEXTO_ESTADO_TRABAJADOR: Record<EstadoTrabajador, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  VACACIONES: 'Vacaciones',
  INCAPACIDAD: 'Incapacidad',
  LICENCIA: 'Licencia',
}

/** Estados en el orden en que se ofrecen en los selectores. */
export const ESTADOS_TRABAJADOR: EstadoTrabajador[] = ['ACTIVO', 'INACTIVO', 'VACACIONES', 'INCAPACIDAD', 'LICENCIA']
