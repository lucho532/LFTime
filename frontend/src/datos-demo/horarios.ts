import type { AsignacionHorarioDto } from '../contratos/horario'
import type { TrabajadorDto } from '../contratos/trabajador'

type PerfilHorario = 'DIURNO' | 'MADRUGADA' | 'NOCTURNO'

interface DatosPerfil {
  horaEntrada: string
  horaSalida: string
  ventanaAlmuerzoDesde: string
  ventanaAlmuerzoHasta: string
}

/** Perfiles de horario de la demostración. El nocturno cruza la medianoche (D5). */
const PERFILES: Record<PerfilHorario, DatosPerfil> = {
  DIURNO: { horaEntrada: '07:00', horaSalida: '16:00', ventanaAlmuerzoDesde: '12:00', ventanaAlmuerzoHasta: '14:00' },
  MADRUGADA: { horaEntrada: '06:00', horaSalida: '14:00', ventanaAlmuerzoDesde: '11:30', ventanaAlmuerzoHasta: '13:30' },
  NOCTURNO: { horaEntrada: '19:00', horaSalida: '04:00', ventanaAlmuerzoDesde: '23:00', ventanaAlmuerzoHasta: '01:00' },
}

const PERFIL_FIJO: Record<string, PerfilHorario> = {
  'trab-006': 'MADRUGADA',
  'trab-009': 'MADRUGADA',
  'trab-011': 'NOCTURNO',
}

/** Todos los días de la semana, para que el panel tenga datos cualquier día de la demostración. */
const TODOS_LOS_DIAS = [1, 2, 3, 4, 5, 6, 7]

function perfilDe(trabajador: TrabajadorDto, posicion: number): PerfilHorario {
  const fijo = PERFIL_FIJO[trabajador.id]
  if (fijo) {
    return fijo
  }
  if (trabajador.hospitalId === 'hosp-03') {
    return 'MADRUGADA'
  }
  if (trabajador.hospitalId === 'hosp-02') {
    return posicion % 2 === 0 ? 'MADRUGADA' : 'DIURNO'
  }
  return 'DIURNO'
}

function crearAsignacion(trabajadorId: string, perfil: DatosPerfil, desde: string, sufijo: string): AsignacionHorarioDto {
  return {
    id: `hor-${trabajadorId}-${sufijo}`,
    trabajadorId,
    vigenteDesde: desde,
    diasLaborables: TODOS_LOS_DIAS,
    ...perfil,
    duracionAlmuerzoMinutos: 60,
    asignadoPorUsuarioId: 'usr-coord-1',
  }
}

/**
 * Construye los horarios de la demostración. `trab-001` tiene además un horario anterior
 * (08:00 a 17:00, hasta agosto) para mostrar cambios con vigencia e historial (P-07, provisional).
 */
export function construirHorarios(trabajadores: TrabajadorDto[]): AsignacionHorarioDto[] {
  const horarios: AsignacionHorarioDto[] = []
  trabajadores.forEach((trabajador, posicion) => {
    horarios.push(crearAsignacion(trabajador.id, PERFILES[perfilDe(trabajador, posicion)], '2026-09-01', 'b'))
  })
  horarios.push(
    crearAsignacion(
      'trab-001',
      { horaEntrada: '08:00', horaSalida: '17:00', ventanaAlmuerzoDesde: '12:30', ventanaAlmuerzoHasta: '14:30' },
      '2026-01-01',
      'a',
    ),
  )
  return horarios
}
