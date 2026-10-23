import type { EstadoTrabajador } from '../contratos/trabajador'

/** Trabajador ficticio escrito a mano para cubrir un escenario concreto (spec §9, P-22). */
export interface TrabajadorBase {
  id: string
  nombres: string
  apellidos: string
  cargo: string
  hospitalId: string
  estado: EstadoTrabajador
}

/**
 * Trabajadores con nombre propio. Cada uno cubre un escenario de `escenarios.ts`.
 * Todos los nombres y documentos son ficticios.
 */
export const TRABAJADORES_BASE: TrabajadorBase[] = [
  { id: 'trab-001', nombres: 'María', apellidos: 'López', cargo: 'Enfermera', hospitalId: 'hosp-01', estado: 'ACTIVO' },
  { id: 'trab-002', nombres: 'Carlos', apellidos: 'Ramírez', cargo: 'Médico general', hospitalId: 'hosp-02', estado: 'ACTIVO' },
  { id: 'trab-003', nombres: 'Andrea', apellidos: 'Torres', cargo: 'Auxiliar de enfermería', hospitalId: 'hosp-03', estado: 'ACTIVO' },
  { id: 'trab-004', nombres: 'Julián', apellidos: 'Castro', cargo: 'Médico especialista', hospitalId: 'hosp-03', estado: 'ACTIVO' },
  { id: 'trab-005', nombres: 'Valentina', apellidos: 'Gómez', cargo: 'Enfermera', hospitalId: 'hosp-01', estado: 'ACTIVO' },
  { id: 'trab-006', nombres: 'Diego', apellidos: 'Pérez', cargo: 'Técnico en salud', hospitalId: 'hosp-02', estado: 'ACTIVO' },
  { id: 'trab-007', nombres: 'Paula', apellidos: 'Rojas', cargo: 'Enfermera', hospitalId: 'hosp-03', estado: 'ACTIVO' },
  { id: 'trab-008', nombres: 'Sergio', apellidos: 'Valencia', cargo: 'Médico general', hospitalId: 'hosp-05', estado: 'ACTIVO' },
  { id: 'trab-009', nombres: 'Daniela', apellidos: 'Muñoz', cargo: 'Auxiliar de enfermería', hospitalId: 'hosp-02', estado: 'ACTIVO' },
  { id: 'trab-010', nombres: 'Luis', apellidos: 'Herrera', cargo: 'Enfermero', hospitalId: 'hosp-01', estado: 'ACTIVO' },
  { id: 'trab-011', nombres: 'Marcela', apellidos: 'Ospina', cargo: 'Enfermera', hospitalId: 'hosp-01', estado: 'ACTIVO' },
  { id: 'trab-012', nombres: 'Hernán', apellidos: 'Giraldo', cargo: 'Médico general', hospitalId: 'hosp-02', estado: 'ACTIVO' },
  { id: 'trab-013', nombres: 'Natalia', apellidos: 'Cardona', cargo: 'Auxiliar de enfermería', hospitalId: 'hosp-03', estado: 'ACTIVO' },
  { id: 'trab-014', nombres: 'Óscar', apellidos: 'Londoño', cargo: 'Técnico en salud', hospitalId: 'hosp-01', estado: 'VACACIONES' },
  { id: 'trab-015', nombres: 'Gloria', apellidos: 'Marín', cargo: 'Enfermera', hospitalId: 'hosp-05', estado: 'INACTIVO' },
  { id: 'trab-016', nombres: 'Esteban', apellidos: 'Arias', cargo: 'Enfermero', hospitalId: 'hosp-04', estado: 'ACTIVO' },
  { id: 'trab-017', nombres: 'Tatiana', apellidos: 'Ruiz', cargo: 'Auxiliar de enfermería', hospitalId: 'hosp-04', estado: 'ACTIVO' },
]
