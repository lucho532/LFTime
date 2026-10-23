/**
 * Situación de los datos de demostración guardados en el navegador.
 *
 * - `RECIEN_INICIALIZADOS`: no había datos y se generaron ahora.
 * - `EXISTENTES`: ya había datos de este esquema y de hoy.
 * - `VERSION_DISTINTA`: los datos son de otra versión del esquema; se ofrece restablecer.
 * - `DE_OTRO_DIA`: los datos se generaron otro día de Colombia; se ofrece restablecer (D33).
 * - `ALMACENAMIENTO_NO_DISPONIBLE`: el navegador no permite guardar; los datos viven solo en memoria.
 */
export type EstadoDatosDemo =
  | 'RECIEN_INICIALIZADOS'
  | 'EXISTENTES'
  | 'VERSION_DISTINTA'
  | 'DE_OTRO_DIA'
  | 'ALMACENAMIENTO_NO_DISPONIBLE'
