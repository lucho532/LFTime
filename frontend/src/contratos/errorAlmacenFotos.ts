/** Motivos por los que no se pudo guardar o leer una foto; la interfaz los traduce a un mensaje (`mensajeDeErrorFoto`). */
export type MotivoErrorFotos = 'ALMACENAMIENTO_NO_DISPONIBLE' | 'CUOTA_EXCEDIDA' | 'LIMITE_DE_FOTOS' | 'TAMANO_EXCEDIDO' | 'ERROR_DE_ESCRITURA'

/**
 * Error al guardar o leer fotos. Es parte del contrato de `IFotoServicio`: el almacén y el servicio lo
 * lanzan y el hook lo reconoce, por eso vive en `contratos/` y no en el repositorio. Lleva el motivo para
 * que la interfaz explique qué pasó; ante cualquiera, la aplicación sigue funcionando con el avatar por
 * defecto (D35). No decide qué mensaje ver ni qué hacer con el fallo.
 */
export class ErrorAlmacenFotos extends Error {
  readonly motivo: MotivoErrorFotos

  constructor(motivo: MotivoErrorFotos) {
    super(`No se pudo usar el almacén de fotos: ${motivo}.`)
    this.name = 'ErrorAlmacenFotos'
    this.motivo = motivo
  }
}
