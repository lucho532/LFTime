/**
 * Contrato del almacén de fotos de la demostración (spec D35).
 *
 * Representa dónde viven las imágenes (en la demostración, IndexedDB del navegador). Su responsabilidad es
 * guardar, leer y borrar imágenes por clave, y lanzar `ErrorAlmacenFotos` con el motivo si algo falla.
 * No valida formatos ni decide permisos.
 */
export interface IAlmacenFotos {
  /** Guarda (o reemplaza) la foto de una clave. Respeta el máximo de fotos de la demostración. */
  guardar(clave: string, foto: Blob): Promise<void>
  obtener(clave: string): Promise<Blob | null>
  eliminar(clave: string): Promise<void>
  eliminarTodas(): Promise<void>
  contar(): Promise<number>
}
