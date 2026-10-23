import type { DatosHorario } from '../modelos/horario'
import { esHoraValida, minutosEntre } from '../utilidades/horas'

/** Errores del formulario de horario, por campo. Un campo sin error no aparece. */
export type ErroresHorario = Partial<Record<keyof DatosHorario, string>>

const DURACION_MAXIMA_ALMUERZO_MINUTOS = 240

/** Contexto que necesita la validación y que el formulario no conoce por sí solo. */
export interface ContextoValidacionHorario {
  /** Hoy en Colombia, `AAAA-MM-DD`. */
  hoy: string
  /** Fechas de inicio de los horarios que el trabajador ya tiene; no se pueden repetir ni sobrescribir (R-10). */
  vigenciasExistentes: string[]
}

function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false
  }
  const [anio, mes, dia] = texto.split('-').map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
}

/**
 * Valida un horario antes de asignarlo (supuestos provisionales del plan §13, P-07, no reglas laborales).
 * - Rige desde hoy o una fecha futura: no se reescribe el pasado, y no repite la fecha de otro horario.
 * - Al menos un día laborable; horas válidas; entrada y salida distintas (la salida menor cruza la medianoche).
 * - El intervalo de almuerzo está dentro de la jornada, y la duración autorizada cabe en él.
 * Devuelve un objeto vacío si todo es válido.
 */
export function validarDatosHorario(datos: DatosHorario, contexto: ContextoValidacionHorario): ErroresHorario {
  const errores: ErroresHorario = {}

  if (!esFechaValida(datos.vigenteDesde)) {
    errores.vigenteDesde = 'Elige la fecha desde la que rige el horario.'
  } else if (datos.vigenteDesde < contexto.hoy) {
    errores.vigenteDesde = 'El horario debe regir desde hoy o desde una fecha futura: el pasado no se modifica.'
  } else if (contexto.vigenciasExistentes.includes(datos.vigenteDesde)) {
    errores.vigenteDesde = 'Ya existe un horario que empieza ese día. Elige otra fecha: los horarios anteriores se conservan.'
  }

  if (datos.diasLaborables.length === 0) {
    errores.diasLaborables = 'Elige al menos un día laborable.'
  }

  const campos = [
    ['horaEntrada', 'la hora de entrada'],
    ['horaSalida', 'la hora de salida'],
    ['ventanaAlmuerzoDesde', 'el inicio del intervalo de almuerzo'],
    ['ventanaAlmuerzoHasta', 'el fin del intervalo de almuerzo'],
  ] as const
  for (const [campo, nombre] of campos) {
    if (!esHoraValida(datos[campo])) {
      errores[campo] = `Escribe ${nombre} en formato HH:mm, por ejemplo 07:00.`
    }
  }
  if (!errores.horaEntrada && !errores.horaSalida && datos.horaEntrada === datos.horaSalida) {
    errores.horaSalida = 'La salida debe ser distinta de la entrada. Si el turno cruza la medianoche, la salida es una hora menor que la entrada.'
  }

  if (!Number.isInteger(datos.duracionAlmuerzoMinutos) || datos.duracionAlmuerzoMinutos < 1 || datos.duracionAlmuerzoMinutos > DURACION_MAXIMA_ALMUERZO_MINUTOS) {
    errores.duracionAlmuerzoMinutos = `La duración del almuerzo debe ser un número entero de minutos, entre 1 y ${DURACION_MAXIMA_ALMUERZO_MINUTOS}.`
  }

  const horasValidas = !errores.horaEntrada && !errores.horaSalida && !errores.ventanaAlmuerzoDesde && !errores.ventanaAlmuerzoHasta
  if (horasValidas && datos.horaEntrada !== datos.horaSalida) {
    const jornada = minutosEntre(datos.horaEntrada, datos.horaSalida)
    const inicio = minutosEntre(datos.horaEntrada, datos.ventanaAlmuerzoDesde)
    const fin = minutosEntre(datos.horaEntrada, datos.ventanaAlmuerzoHasta)
    if (inicio >= fin || fin > jornada) {
      errores.ventanaAlmuerzoHasta = 'El intervalo de almuerzo debe estar dentro de la jornada y terminar después de empezar.'
    } else if (!errores.duracionAlmuerzoMinutos && datos.duracionAlmuerzoMinutos > fin - inicio) {
      errores.duracionAlmuerzoMinutos = 'La duración del almuerzo no cabe en el intervalo permitido.'
    }
  }
  return errores
}
