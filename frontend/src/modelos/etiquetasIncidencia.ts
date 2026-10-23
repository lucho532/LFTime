import type { AccionHistorialIncidencia, EstadoIncidencia, TipoIncidencia } from '../contratos/incidencia'

/** Nombre de cada tipo de incidencia, tal como lo ve la persona. */
export const TEXTO_TIPO_INCIDENCIA: Record<TipoIncidencia, string> = {
  ENTRADA_TARDIA: 'Entrada tardía',
  SIN_ENTRADA: 'Sin registro de entrada',
  AUSENCIA_APARENTE: 'Ausencia aparente',
  SALIDA_ANTICIPADA: 'Salida anticipada',
  SIN_SALIDA: 'Sin registro de salida',
  ALMUERZO_EXCEDIDO: 'Almuerzo excedido',
  REGRESO_TARDIO: 'Regreso tardío del almuerzo',
  TIEMPO_INFERIOR: 'Tiempo trabajado inferior al programado',
  REGISTRO_INCOMPLETO: 'Registro incompleto o inconsistente',
  UBICACION_NO_AUTORIZADA: 'Ubicación no autorizada',
}

/** Estados de una incidencia (P-17, provisional). Ninguno es una sanción. */
export const TEXTO_ESTADO_INCIDENCIA: Record<EstadoIncidencia, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  PENDIENTE_INFORMACION: 'Pendiente de información',
  JUSTIFICADA: 'Justificada',
  NO_JUSTIFICADA: 'No justificada',
}

/** Estados en el orden en que se ofrecen en los selectores. */
export const ESTADOS_INCIDENCIA: EstadoIncidencia[] = ['PENDIENTE', 'EN_REVISION', 'PENDIENTE_INFORMACION', 'JUSTIFICADA', 'NO_JUSTIFICADA']

/** Tipos en el orden en que se ofrecen en los selectores. */
export const TIPOS_INCIDENCIA = Object.keys(TEXTO_TIPO_INCIDENCIA) as TipoIncidencia[]

/** Texto de cada acción del historial. */
export const TEXTO_ACCION_HISTORIAL: Record<AccionHistorialIncidencia, string> = {
  DETECTADA: 'Detectada por el sistema',
  INTENTO_ANADIDO: 'Intento añadido',
  JUSTIFICADA: 'Justificación aportada',
  REVISADA: 'Revisión iniciada',
  RESUELTA: 'Resuelta',
  ESCALADA: 'Escalada al administrador',
  ASIGNADA: 'Revisor asignado',
  REABIERTA: 'Reabierta',
  CORREGIDA: 'Corregida',
}
