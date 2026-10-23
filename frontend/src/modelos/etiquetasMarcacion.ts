import type { MotivoRechazo, TipoMarcacion } from '../contratos/marcacion'

/** Nombre de cada evento de la jornada, tal como lo ve la persona. */
export const NOMBRE_MARCACION: Record<TipoMarcacion, string> = {
  ENTRADA: 'Entrada',
  SALIDA_ALMUERZO: 'Salida a almuerzo',
  REGRESO_ALMUERZO: 'Regreso del almuerzo',
  SALIDA_FINAL: 'Salida final',
}

/** Texto del botón que registra cada evento. */
export const ACCION_MARCACION: Record<TipoMarcacion, string> = {
  ENTRADA: 'Registrar entrada',
  SALIDA_ALMUERZO: 'Registrar salida a almuerzo',
  REGRESO_ALMUERZO: 'Registrar regreso del almuerzo',
  SALIDA_FINAL: 'Registrar salida final',
}

/** Causa de cada intento rechazado. Los fallos técnicos se nombran como tales, nunca como ubicación indebida (CA-14). */
export const TEXTO_MOTIVO_RECHAZO: Record<MotivoRechazo, string> = {
  FUERA_DE_RADIO: 'Ubicación fuera del radio del hospital',
  PERMISO_DENEGADO: 'Fallo técnico: permiso de ubicación denegado',
  PERMISO_BLOQUEADO: 'Fallo técnico: permiso de ubicación bloqueado',
  UBICACION_NO_DISPONIBLE: 'Fallo técnico: ubicación no disponible',
  TIEMPO_AGOTADO: 'Fallo técnico: la ubicación tardó demasiado',
  PRECISION_INSUFICIENTE: 'Fallo técnico: precisión del GPS insuficiente',
  CONTEXTO_NO_SEGURO: 'Fallo técnico: conexión no segura',
}
