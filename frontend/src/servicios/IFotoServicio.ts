import type { PropietarioFoto } from '../reglas/permisoFoto'

/**
 * Contrato del servicio de fotos de perfil (D14, D24).
 *
 * Guarda, entrega y retira la foto de una persona. Retirar la foto elimina solo la imagen: el historial
 * de asistencia no se toca. Si el almacenamiento falla, los métodos de lectura devuelven `null` (la
 * aplicación funciona con el avatar por defecto) y los de escritura lanzan `ErrorAlmacenFotos` (de `contratos/`) con el motivo.
 * No valida formatos ni permisos: eso lo hacen `prepararFoto` y `reglas/`.
 */
export interface IFotoServicio {
  /** Guarda (o reemplaza) la foto, que debe pesar como máximo 2 MB. */
  guardar(propietario: PropietarioFoto, foto: Blob): Promise<void>
  /** Devuelve una dirección temporal para mostrar la foto, o `null` si no hay o no se puede leer. */
  obtenerUrl(propietario: PropietarioFoto): Promise<string | null>
  /** Retira la foto de la persona. No afecta a ningún otro dato. */
  retirar(propietario: PropietarioFoto): Promise<void>
}
