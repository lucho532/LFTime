/**
 * Ayudas de las pruebas de las reglas de jornada: un horario conocido (07:00 a 16:00 con almuerzo de
 * 60 minutos, todos los días) y constructores de marcaciones y de la entrada de las reglas.
 * No contiene datos de demostración ni lógica de negocio.
 */
import { REGLAS_PROVISIONALES_POR_DEFECTO } from '../../configuracion/reglasProvisionales'
import type { AsignacionHorarioDto } from '../../contratos/horario'
import type { MarcacionBasica } from '../../reglas/duraciones'
import type { EntradaJornada } from '../../reglas/entradaJornada'
import type { TipoMarcacion } from '../../contratos/marcacion'
import { aInstanteUtc } from '../../utilidades/horaColombia'

export const FECHA_PRUEBA = '2026-10-21'

export const HORARIO_PRUEBA: AsignacionHorarioDto = {
  id: 'horario-prueba',
  trabajadorId: 'trab-prueba',
  vigenteDesde: '2026-01-01',
  diasLaborables: [1, 2, 3, 4, 5, 6, 7],
  horaEntrada: '07:00',
  horaSalida: '16:00',
  ventanaAlmuerzoDesde: '12:00',
  ventanaAlmuerzoHasta: '14:00',
  duracionAlmuerzoMinutos: 60,
  asignadoPorUsuarioId: 'coord-prueba',
}

/** Marcación de prueba a una hora de Colombia (`HH:mm`) de la fecha indicada. */
export function marca(tipo: TipoMarcacion, hora: string, fecha = FECHA_PRUEBA): MarcacionBasica {
  return { tipo, instante: aInstanteUtc(fecha, hora).toISOString() }
}

/** Jornada completa del ejemplo de la spec §6: 07:00, 12:00, 13:00 y 16:00. */
export function jornadaCompleta(): MarcacionBasica[] {
  return [marca('ENTRADA', '07:00'), marca('SALIDA_ALMUERZO', '12:00'), marca('REGRESO_ALMUERZO', '13:00'), marca('SALIDA_FINAL', '16:00')]
}

/** Entrada de las reglas con valores por defecto; `cambios` sustituye lo que cada prueba necesite. */
export function entradaDePrueba(hora: string, marcaciones: MarcacionBasica[], cambios: Partial<EntradaJornada> = {}): EntradaJornada {
  return {
    estadoTrabajador: 'ACTIVO',
    horario: HORARIO_PRUEBA,
    fechaOperativa: FECHA_PRUEBA,
    marcaciones,
    ahora: aInstanteUtc(FECHA_PRUEBA, hora),
    reglas: REGLAS_PROVISIONALES_POR_DEFECTO,
    hospitalAdmiteMarcacion: true,
    ...cambios,
  }
}
