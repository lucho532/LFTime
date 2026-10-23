import type { IntentoMarcacionDto } from '../contratos/marcacion'
import type { MotivoSecuenciaInvalida } from '../reglas/secuencia'
import type { MotivoFalloUbicacion } from './geolocalizacion'
import { mensajeDeFalloUbicacion } from './mensajesUbicacion'

const MENSAJES_SECUENCIA: Record<MotivoSecuenciaInvalida, string> = {
  DUPLICADA: 'Ese evento ya está registrado en tu jornada.',
  SIN_JORNADA_ABIERTA: 'Primero debes registrar tu entrada: no hay una jornada abierta.',
  FUERA_DE_SECUENCIA: 'Ese evento todavía no corresponde. Registra el siguiente de la secuencia.',
}

/** Mensaje cuando el evento no corresponde a la secuencia de la jornada. */
export function mensajeDeSecuencia(motivo: MotivoSecuenciaInvalida): string {
  return MENSAJES_SECUENCIA[motivo]
}

/**
 * Mensaje para la persona cuando un intento fue rechazado: dice la causa y cómo corregirla (CA-1).
 * Un fallo técnico nunca se presenta como ubicación indebida (CA-14). Los límites mostrados son provisionales.
 */
export function mensajeDeIntentoRechazado(intento: IntentoMarcacionDto, limites: { radioMetros: number; precisionMetros: number }): string {
  if (intento.motivo === 'FUERA_DE_RADIO') {
    const distancia = Math.round(intento.distanciaAlHospitalMetros ?? 0)
    return `No se registró: estás a unos ${distancia} m del hospital y el máximo permitido (valor provisional) es ${limites.radioMetros} m. Acércate al hospital y vuelve a intentarlo. El intento quedó guardado aparte y se avisó a tu coordinación para su revisión; no es una sanción.`
  }
  if (intento.motivo === 'PRECISION_INSUFICIENTE') {
    const precision = Math.round(intento.ubicacion?.precisionMetros ?? 0)
    return `No se registró: la precisión del GPS (± ${precision} m) es peor que la máxima permitida (valor provisional, ${limites.precisionMetros} m). Sal a un lugar abierto, espera unos segundos y vuelve a intentarlo. Esto es un problema técnico, no un problema de ubicación.`
  }
  return `No se registró. ${mensajeDeFalloUbicacion(intento.motivo as MotivoFalloUbicacion)}`
}
