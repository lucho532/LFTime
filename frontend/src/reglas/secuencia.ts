import type { TipoMarcacion } from '../contratos/marcacion'

/** Orden obligatorio de los eventos de una jornada (HU-05). */
export const SECUENCIA_MARCACIONES: TipoMarcacion[] = ['ENTRADA', 'SALIDA_ALMUERZO', 'REGRESO_ALMUERZO', 'SALIDA_FINAL']

/** Motivo por el que una marcación no puede registrarse en este momento. */
export type MotivoSecuenciaInvalida = 'DUPLICADA' | 'SIN_JORNADA_ABIERTA' | 'FUERA_DE_SECUENCIA'

export type ResultadoSecuencia = { permitida: true } | { permitida: false; motivo: MotivoSecuenciaInvalida }

/** Cuántos eventos seguidos, desde la entrada, ya están registrados. */
function progresoDe(tiposRegistrados: TipoMarcacion[]): number {
  let progreso = 0
  while (progreso < SECUENCIA_MARCACIONES.length && tiposRegistrados.includes(SECUENCIA_MARCACIONES[progreso])) {
    progreso += 1
  }
  return progreso
}

/**
 * Evento que corresponde registrar a continuación, o `null` si la jornada ya terminó.
 * Es lo único que la pantalla de registro ofrece al trabajador (HU-05).
 */
export function siguienteMarcacion(tiposRegistrados: TipoMarcacion[]): TipoMarcacion | null {
  return SECUENCIA_MARCACIONES[progresoDe(tiposRegistrados)] ?? null
}

/**
 * Decide si un evento puede registrarse dado lo ya registrado en la jornada (HU-05).
 * Impide eventos duplicados, saltos de secuencia y cualquier evento sin una jornada abierta.
 * La corrección autorizada y auditada (T-9.7) está bloqueada por P-12 y no se contempla aquí.
 * Función pura: no registra nada.
 */
export function validarSecuencia(tiposRegistrados: TipoMarcacion[], tipo: TipoMarcacion): ResultadoSecuencia {
  if (tipo === siguienteMarcacion(tiposRegistrados)) {
    return { permitida: true }
  }
  if (tiposRegistrados.includes(tipo)) {
    return { permitida: false, motivo: 'DUPLICADA' }
  }
  if (!tiposRegistrados.includes('ENTRADA')) {
    return { permitida: false, motivo: 'SIN_JORNADA_ABIERTA' }
  }
  return { permitida: false, motivo: 'FUERA_DE_SECUENCIA' }
}
