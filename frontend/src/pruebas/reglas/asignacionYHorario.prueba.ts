import { describe, expect, it } from 'vitest'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { AsignacionCoordinadorDto } from '../../contratos/hospital'
import { obtenerAsignacionVigente } from '../../reglas/asignacionCoordinador'
import { obtenerHorarioVigente } from '../../reglas/horarioVigente'

function asignacion(coordinadorId: string, desde: string, hasta?: string): AsignacionCoordinadorDto {
  return { id: `a-${coordinadorId}-${desde}`, hospitalId: 'h', coordinadorId, vigenteDesde: desde, vigenteHasta: hasta, asignadoPorUsuarioId: 'admin' }
}

function horario(desde: string, entrada: string): AsignacionHorarioDto {
  return {
    id: `h-${desde}`, trabajadorId: 't', vigenteDesde: desde, diasLaborables: [1], horaEntrada: entrada, horaSalida: '16:00',
    ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '14:00', duracionAlmuerzoMinutos: 60, asignadoPorUsuarioId: 'c',
  }
}

describe('obtenerAsignacionVigente (provisional, P-28)', () => {
  const asignaciones = [asignacion('a', '2026-01-01', '2026-08-31'), asignacion('b', '2026-09-01')]

  it('elige la asignación que rige en la fecha, incluidos los extremos', () => {
    expect(obtenerAsignacionVigente(asignaciones, '2026-08-31')?.coordinadorId).toBe('a')
    expect(obtenerAsignacionVigente(asignaciones, '2026-09-01')?.coordinadorId).toBe('b')
    expect(obtenerAsignacionVigente(asignaciones, '2027-03-01')?.coordinadorId).toBe('b')
  })

  it('devuelve null si no hay responsable en esa fecha', () => {
    expect(obtenerAsignacionVigente(asignaciones, '2025-12-31')).toBeNull()
    expect(obtenerAsignacionVigente([], '2026-10-23')).toBeNull()
  })

  it('no modifica las asignaciones recibidas', () => {
    const copia = structuredClone(asignaciones)
    obtenerAsignacionVigente(asignaciones, '2026-10-23')
    expect(asignaciones).toEqual(copia)
  })
})

describe('obtenerHorarioVigente (provisional, P-07)', () => {
  const horarios = [horario('2026-01-01', '08:00'), horario('2026-09-01', '07:00')]

  it('elige el horario más reciente que no sea posterior a la fecha', () => {
    expect(obtenerHorarioVigente(horarios, 't', '2026-08-31')?.horaEntrada).toBe('08:00')
    expect(obtenerHorarioVigente(horarios, 't', '2026-09-01')?.horaEntrada).toBe('07:00')
  })

  it('devuelve null si el trabajador no tiene horario o aún no rige', () => {
    expect(obtenerHorarioVigente(horarios, 'otro', '2026-10-23')).toBeNull()
    expect(obtenerHorarioVigente(horarios, 't', '2025-12-31')).toBeNull()
  })
})
