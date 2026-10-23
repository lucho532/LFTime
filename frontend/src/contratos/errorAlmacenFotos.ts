/** Motivos por los que no se pudo guardar o leer una foto. */
export type MotivoErrorFotos = 'ALMACENAMIENTO_NO_DISPONIBLE' | 'CUOTA_EXCEDIDA' | 'LIMITE_DE_FOTOS' | 'TAMANO_EXCEDIDO' | 'ERROR_DE_ESCRITURA'

/**
 * Error al guardar o leer fotos de la demostración. Lleva el motivo para que la interfaz explique
 * qué pasó. Ante cualquiera, la aplicación sigue funcionando con el avatar por defecto (D35).
 */
export class ErrorAlmacenFotos extends Error {
  readonly motivo: MotivoErrorFotos

  constructor(motivo: MotivoErrorFotos) {
    super(`No se pudo usar el almacén de fotos: ${motivo}.`)
    this.name = 'ErrorAlmacenFotos'
    this.motivo = motivo
  }
}
