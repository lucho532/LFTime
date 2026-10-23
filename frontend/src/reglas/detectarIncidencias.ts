import type { TipoIncidencia } from '../contratos/incidencia'
import { calcularDuraciones, instantesDeJornada, type InstantesJornada } from './duraciones'
import { minutosEntreInstantes, sumarMinutosA, type EntradaJornada } from './entradaJornada'
import { esDiaLaborable, resolverTurno } from './turnoProgramado'

/**
 * Anomalía detectada en una jornada. Solo dice qué tipo es y desde cuándo se puede afirmar: no lleva
 * ninguna consecuencia (principio 8 de la constitución: una incidencia no es una sanción, P-18).
 */
export interface IncidenciaDetectada {
  tipo: Exclude<TipoIncidencia, 'UBICACION_NO_AUTORIZADA'>
  detectadaEn: Date
}

const CAMPOS_EN_ORDEN: (keyof InstantesJornada)[] = ['entrada', 'salidaAlmuerzo', 'regresoAlmuerzo', 'salidaFinal']

/** Marcaciones que existen sin que exista una anterior de la secuencia, o fuera de orden cronológico. */
function tieneInconsistencias(instantes: InstantesJornada): boolean {
  const presentes = CAMPOS_EN_ORDEN.map((campo) => instantes[campo])
  const hayHueco = presentes.some((instante, i) => instante !== null && presentes.slice(1, i).some((previo) => previo === null))
  const enOrden = presentes.filter((instante): instante is Date => instante !== null)
  return hayHueco || enOrden.some((instante, i) => i > 0 && instante < enOrden[i - 1])
}

function ultimaMarca(instantes: InstantesJornada): Date | null {
  const presentes = CAMPOS_EN_ORDEN.map((campo) => instantes[campo]).filter((i): i is Date => i !== null)
  return presentes.length > 0 ? new Date(Math.max(...presentes.map((i) => i.getTime()))) : null
}

/**
 * Compara la jornada con el horario y devuelve las anomalías ya detectables en `ahora` (HU-06).
 *
 * Definiciones provisionales (P-01, P-02, P-20; tolerancias y umbrales vienen de `configuracion`):
 * - `ENTRADA_TARDIA`: entrada registrada después de la hora más la tolerancia.
 * - `AUSENCIA_APARENTE`: ninguna marcación y pasado el umbral de ausencia desde la hora de entrada.
 * - `SIN_ENTRADA`: hay marcaciones posteriores pero falta la entrada.
 * - `SALIDA_ANTICIPADA`: salida final antes del fin del turno menos la tolerancia.
 * - `SIN_SALIDA`: con entrada y sin salida final, pasado el umbral desde el fin del turno.
 * - `ALMUERZO_EXCEDIDO`: almuerzo completo más largo que el autorizado más su tolerancia.
 * - `REGRESO_TARDIO`: sin regreso del almuerzo pasado el umbral desde el fin del almuerzo autorizado.
 * - `TIEMPO_INFERIOR`: jornada completa con menos tiempo efectivo que el programado, descontando la suma
 *   de las tres tolerancias.
 * - `REGISTRO_INCOMPLETO`: marcaciones con huecos (distintos de la entrada) o fuera de orden.
 *
 * No incluye la ubicación no autorizada: nace de los intentos rechazados (`agruparIntentos`). No detecta
 * nada de trabajadores no activos (P-20), de días sin horario ni de hospitales que no admiten marcar (D25).
 * Función pura: no crea incidencias ni alertas ni impone consecuencias.
 */
export function detectarIncidencias(entrada: EntradaJornada): IncidenciaDetectada[] {
  const { horario, fechaOperativa, marcaciones, ahora, reglas } = entrada
  if (entrada.estadoTrabajador !== 'ACTIVO' || !horario || !entrada.hospitalAdmiteMarcacion) {
    return []
  }
  if (!esDiaLaborable(horario, fechaOperativa) && marcaciones.length === 0) {
    return []
  }
  const turno = resolverTurno(horario, fechaOperativa)
  const instantes = instantesDeJornada(marcaciones)
  const detectadas: IncidenciaDetectada[] = []
  const agregar = (tipo: IncidenciaDetectada['tipo'], detectadaEn: Date) => {
    if (detectadaEn <= ahora) detectadas.push({ tipo, detectadaEn })
  }
  const limiteEntrada = sumarMinutosA(turno.inicio, reglas.toleranciaEntradaMinutos)
  const ultima = ultimaMarca(instantes)

  if (!instantes.entrada) {
    if (ultima) agregar('SIN_ENTRADA', ultima)
    else agregar('AUSENCIA_APARENTE', sumarMinutosA(limiteEntrada, reglas.umbralAusenciaMinutos))
  } else if (instantes.entrada > limiteEntrada) {
    agregar('ENTRADA_TARDIA', instantes.entrada)
  }
  if (instantes.salidaFinal && instantes.salidaFinal < sumarMinutosA(turno.fin, -reglas.toleranciaSalidaMinutos)) {
    agregar('SALIDA_ANTICIPADA', instantes.salidaFinal)
  }
  if (instantes.entrada && !instantes.salidaFinal) {
    agregar('SIN_SALIDA', sumarMinutosA(turno.fin, reglas.umbralSalidaSinRegistrarMinutos))
  }
  const { salidaAlmuerzo, regresoAlmuerzo } = instantes
  const almuerzoLimite = turno.almuerzoAutorizadoMinutos + reglas.toleranciaAlmuerzoMinutos
  if (salidaAlmuerzo && regresoAlmuerzo && minutosEntreInstantes(salidaAlmuerzo, regresoAlmuerzo) > almuerzoLimite) {
    agregar('ALMUERZO_EXCEDIDO', regresoAlmuerzo)
  }
  if (salidaAlmuerzo && !regresoAlmuerzo && !instantes.salidaFinal) {
    agregar('REGRESO_TARDIO', sumarMinutosA(salidaAlmuerzo, turno.almuerzoAutorizadoMinutos + reglas.umbralRegresoSinRegistrarMinutos))
  }
  const duraciones = calcularDuraciones(marcaciones)
  const toleranciaTotal = reglas.toleranciaEntradaMinutos + reglas.toleranciaSalidaMinutos + reglas.toleranciaAlmuerzoMinutos
  if (duraciones.completa && duraciones.efectivoMinutos! < turno.efectivoProgramadoMinutos - toleranciaTotal && instantes.salidaFinal) {
    agregar('TIEMPO_INFERIOR', instantes.salidaFinal)
  }
  if (ultima && instantes.entrada && tieneInconsistencias(instantes)) {
    agregar('REGISTRO_INCOMPLETO', ultima)
  }
  return detectadas.sort((a, b) => a.detectadaEn.getTime() - b.detectadaEn.getTime())
}
