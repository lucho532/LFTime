import type { MarcacionDto, TipoMarcacion } from '../contratos/marcacion'

const MILISEGUNDOS_POR_MINUTO = 60_000

/** Lo mínimo que las reglas necesitan de una marcación. */
export type MarcacionBasica = Pick<MarcacionDto, 'tipo' | 'instante'>

/** Instante (truncado al minuto) de cada evento de la jornada; `null` si no se registró. */
export interface InstantesJornada {
  entrada: Date | null
  salidaAlmuerzo: Date | null
  regresoAlmuerzo: Date | null
  salidaFinal: Date | null
}

/** Duraciones de una jornada en minutos. `null` significa cómputo incompleto (D16). */
export interface DuracionesJornada {
  efectivoMinutos: number | null
  almuerzoMinutos: number | null
  totalMinutos: number | null
  /** Verdadero solo si están los cuatro eventos y en orden cronológico. */
  completa: boolean
}

const CAMPO_POR_TIPO: Record<TipoMarcacion, keyof InstantesJornada> = {
  ENTRADA: 'entrada',
  SALIDA_ALMUERZO: 'salidaAlmuerzo',
  REGRESO_ALMUERZO: 'regresoAlmuerzo',
  SALIDA_FINAL: 'salidaFinal',
}

/**
 * Ubica el instante de cada evento de una jornada. Los instantes se truncan al minuto para que las
 * duraciones sean enteras y total = efectivo + almuerzo siempre se cumpla. Si un tipo aparece más de
 * una vez (no debería, ver `secuencia`), se conserva la primera marcación.
 */
export function instantesDeJornada(marcaciones: MarcacionBasica[]): InstantesJornada {
  const instantes: InstantesJornada = { entrada: null, salidaAlmuerzo: null, regresoAlmuerzo: null, salidaFinal: null }
  const ordenadas = [...marcaciones].sort((a, b) => Date.parse(a.instante) - Date.parse(b.instante))
  for (const marcacion of ordenadas) {
    const campo = CAMPO_POR_TIPO[marcacion.tipo]
    if (instantes[campo] === null) {
      const milisegundos = Date.parse(marcacion.instante)
      instantes[campo] = new Date(Math.floor(milisegundos / MILISEGUNDOS_POR_MINUTO) * MILISEGUNDOS_POR_MINUTO)
    }
  }
  return instantes
}

function minutosEntreInstantes(desde: Date | null, hasta: Date | null): number | null {
  if (!desde || !hasta) {
    return null
  }
  return (hasta.getTime() - desde.getTime()) / MILISEGUNDOS_POR_MINUTO
}

/**
 * Calcula el tiempo efectivo, el de almuerzo y el total de una jornada a partir de sus marcaciones (D16).
 *
 * - Efectivo = (entrada → salida a almuerzo) + (regreso → salida final).
 * - Almuerzo = salida a almuerzo → regreso (se calcula con solo esas dos marcas).
 * - Total = entrada → salida final.
 *
 * Si falta una marcación, o están desordenadas, efectivo y total son `null`: nunca se entrega una duración
 * estimada como definitiva. Regla provisional (P-03 y P-05 abiertos): no decide si el almuerzo se paga o
 * se descuenta ni clasifica horas extra; los tres tiempos se entregan separados (D21). No usa el reloj.
 */
export function calcularDuraciones(marcaciones: MarcacionBasica[]): DuracionesJornada {
  const { entrada, salidaAlmuerzo, regresoAlmuerzo, salidaFinal } = instantesDeJornada(marcaciones)
  const almuerzoMinutos = minutosEntreInstantes(salidaAlmuerzo, regresoAlmuerzo)
  const primerTramo = minutosEntreInstantes(entrada, salidaAlmuerzo)
  const segundoTramo = minutosEntreInstantes(regresoAlmuerzo, salidaFinal)
  const totalMinutos = minutosEntreInstantes(entrada, salidaFinal)
  const almuerzoValido = almuerzoMinutos !== null && almuerzoMinutos >= 0 ? almuerzoMinutos : null
  const enOrden = [primerTramo, almuerzoMinutos, segundoTramo].every((tramo) => tramo !== null && tramo >= 0)
  if (!enOrden || primerTramo === null || segundoTramo === null || totalMinutos === null) {
    return { efectivoMinutos: null, almuerzoMinutos: almuerzoValido, totalMinutos: null, completa: false }
  }
  return { efectivoMinutos: primerTramo + segundoTramo, almuerzoMinutos, totalMinutos, completa: true }
}

/**
 * Tiempo efectivo acumulado hasta `ahora`, en minutos enteros, para mostrar el avance del día en el panel;
 * `null` si aún no hay entrada. Cuenta el tramo abierto hasta `ahora` y nunca pasa de las marcas
 * registradas. **No es el tiempo oficial**: es parcial hasta que la jornada tiene sus cuatro marcas, y
 * entonces coincide con el efectivo de `calcularDuraciones` (provisional, P-03 y P-05 abiertos).
 */
export function calcularEfectivoHastaAhora(marcaciones: MarcacionBasica[], ahora: Date): number | null {
  const { entrada, salidaAlmuerzo, regresoAlmuerzo, salidaFinal } = instantesDeJornada(marcaciones)
  if (!entrada) {
    return null
  }
  const tramo = (desde: Date, hasta: Date | null) => Math.max(0, Math.min((hasta ?? ahora).getTime(), ahora.getTime()) - desde.getTime())
  const primerTramo = tramo(entrada, salidaAlmuerzo ?? salidaFinal)
  const segundoTramo = regresoAlmuerzo ? tramo(regresoAlmuerzo, salidaFinal) : 0
  return Math.floor((primerTramo + segundoTramo) / MILISEGUNDOS_POR_MINUTO)
}
