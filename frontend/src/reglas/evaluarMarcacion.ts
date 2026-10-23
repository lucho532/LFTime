import type { HospitalDto } from '../contratos/hospital'
import type { MotivoRechazo, UbicacionDto } from '../contratos/marcacion'
import { calcularDistanciaMetros } from './distanciaGeografica'

/** Motivos de fallo técnico que ocurren antes de tener una ubicación (el GPS no entregó nada). */
export type MotivoFalloSinUbicacion = Exclude<MotivoRechazo, 'FUERA_DE_RADIO' | 'PRECISION_INSUFICIENTE'>

/** Límites contra los que se evalúa una ubicación. Provisionales (D19): 100 m y 25 m. */
export interface LimitesUbicacion {
  radioPermitidoMetros: number
  precisionMaximaMetros: number
}

/** Lo que el dispositivo entregó al intentar marcar: una ubicación, o el motivo técnico por el que no hay. */
export type IntentoDeUbicacion = { ubicacion: UbicacionDto } | { falloTecnico: MotivoFalloSinUbicacion }

export type ResultadoEvaluacion =
  | { resultado: 'VALIDA'; distanciaMetros: number }
  | { resultado: 'RECHAZADA'; motivo: MotivoRechazo; esFalloTecnico: boolean; distanciaMetros?: number }
  /** El hospital no tiene coordenadas confirmadas: no hay nada contra qué comparar y no se admite marcar (D25). */
  | { resultado: 'HOSPITAL_SIN_COORDENADAS' }

function esNumeroFinito(valor: number): boolean {
  return Number.isFinite(valor)
}

/**
 * Evalúa un intento de marcación contra el hospital asignado (D19, D23). Valores provisionales.
 *
 * - Sin coordenadas confirmadas en el hospital: no se evalúa (D25).
 * - Sin ubicación, con datos no numéricos o con precisión peor que la máxima: **fallo técnico**. Nunca
 *   cuenta como ubicación fuera de zona (CA-14), porque con esa precisión no se puede afirmar dónde estaba.
 * - Con ubicación suficientemente precisa a más del radio: rechazada por `FUERA_DE_RADIO`.
 * - Una precisión o una distancia exactamente iguales al límite son válidas; solo lo que lo supera se rechaza.
 *
 * Función pura: no guarda el intento ni crea incidencias (eso lo hace el servicio de marcaciones).
 */
export function evaluarMarcacion(
  hospital: Pick<HospitalDto, 'coordenadas'>,
  intento: IntentoDeUbicacion,
  limites: LimitesUbicacion,
): ResultadoEvaluacion {
  if (!hospital.coordenadas?.confirmadas) {
    return { resultado: 'HOSPITAL_SIN_COORDENADAS' }
  }
  if ('falloTecnico' in intento) {
    return { resultado: 'RECHAZADA', motivo: intento.falloTecnico, esFalloTecnico: true }
  }
  const { latitud, longitud, precisionMetros } = intento.ubicacion
  if (![latitud, longitud, precisionMetros].every(esNumeroFinito)) {
    return { resultado: 'RECHAZADA', motivo: 'UBICACION_NO_DISPONIBLE', esFalloTecnico: true }
  }
  const distanciaMetros = calcularDistanciaMetros(hospital.coordenadas, { latitud, longitud })
  if (precisionMetros > limites.precisionMaximaMetros) {
    return { resultado: 'RECHAZADA', motivo: 'PRECISION_INSUFICIENTE', esFalloTecnico: true, distanciaMetros }
  }
  if (distanciaMetros > limites.radioPermitidoMetros) {
    return { resultado: 'RECHAZADA', motivo: 'FUERA_DE_RADIO', esFalloTecnico: false, distanciaMetros }
  }
  return { resultado: 'VALIDA', distanciaMetros }
}
